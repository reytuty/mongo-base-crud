# 🧩 mongo-base-crud

**TypeScript library to simplify CRUD operations with MongoDB.**

Built on top of [Mongoose](https://mongoosejs.com/), designed for whitelabel/multi-tenant projects, with support for multiple databases, dynamic aliases, and the Singleton pattern.

---

## ✨ Features

- 🔌 Simple Mongo connection with connection pooling (per-database Singleton)
- 🧬 Flexible schema (no strict typing at the DB layer) with automatic `_id ↔ id` mapping
- 🏢 Multi-tenant / whitelabel friendly (prefixes, per-alias databases)
- 🔁 Full CRUD: `save`, `update`, `partialUpdate`, `find`, `findAll`, `getById`, `delete`
- 📦 **Batch operations**: `saveMany`, `updateMany`, `deleteMany` (single-roundtrip `bulkWrite`)
- 🧮 `aggregate` helper with `allowDiskUse: true` by default
- 🚀 `find` / `findAll` also run with `allowDiskUse: true` by default (no more sort-memory errors on large datasets)
- 🧠 Automatic `createdAt` / `updatedAt` handling when those fields exist in your payload

---

## 📦 Installation

```bash
npm install mongo-base-crud
```

---

## ⚙️ Configuration

Create a `.env` file:

```env
MONGO_URL="mongodb://admin:admin@localhost:27017"
MONGO_DB=test
MONGO_PREFIX_NAME=test_
MONGO_DISABLE_PLURAL=true
```

| Variable | Description |
|---|---|
| `MONGO_URL` | MongoDB connection URL |
| `MONGO_DB` | Base database name |
| `MONGO_PREFIX_NAME` | Prefix for multi-tenant / whitelabel setups |
| `MONGO_DISABLE_PLURAL` | *(optional)* if `true`, disables Mongoose's automatic pluralization of collection names |

### Overriding config programmatically

You can bypass the env vars by passing a `MongoConfig` directly:

```ts
await BaseCrud.getInstance("exact_collection_name", "my_db", {}, 1, {
  fullUrl: "mongodb://localhost:27017",
  disablePlural: true,
});
```

---

## 🧠 `getInstance` vs `.instance()`

| Method | When to use |
|---|---|
| `BaseCrud.getInstance(...)` | Quick / generic usage. Returns a global Singleton keyed by `dbName_collectionName`. |
| `YourRepository.instance(alias)` | Recommended for whitelabel setups. Creates one Singleton per alias, using a custom key (e.g. `UserRepo_acme`). |

Both are backed by [`typescript-singleton`](https://www.npmjs.com/package/typescript-singleton), so repeated calls return the same instance and reuse the same Mongo connection.

---

## 🚀 Quick Start

### Generic usage

```ts
import { BaseCrud } from "mongo-base-crud";

const users = BaseCrud.getInstance<{ id: string; name: string }>(
  "users",
  "clinic_acme",
  { name: 1 }, // indexes
);

const { id } = await users.save({ name: "John" });
const john = await users.getById(id);
```

### Recommended: extend `BaseCrud` per entity

```ts
import { Singleton } from "typescript-singleton";
import { BaseCrud } from "mongo-base-crud";

interface User {
  id: string;
  name: string;
}

export class UserRepository extends BaseCrud<User> {
  public static instance(clinicAlias: string): UserRepository {
    const dbName = `clinic_${clinicAlias}`;
    return Singleton.getInstance<UserRepository>(
      `UserRepo_${clinicAlias}`,
      UserRepository,
      "users",
      dbName,
      { name: 1 },
    );
  }

  constructor(collection = "users", dbName = "default", indexes = {}) {
    super(collection, dbName, indexes);
  }
}

// usage
const repo = UserRepository.instance("acme");
await repo.save({ name: "Mary" });
```

---

## 📚 API Reference

All methods below are exposed on any `BaseCrud<T>` instance.

### Single-document operations

#### `save(data): Promise<DocumentWithId>`

Creates a new document, or replaces an existing one when `id` is provided (upsert).
Automatically refreshes `updatedAt` / `createdAt` if those fields exist on the payload.

```ts
await repo.save({ name: "John" });                    // insert with generated UUID
await repo.save({ id: "my-custom-id", name: "Mary" }); // upsert with custom id
```

#### `update(data): Promise<DocumentWithId>`

Fully replaces the document matched by `data.id`. Refreshes `updatedAt` when present.

```ts
await repo.update({ id: "abc", name: "New Name" });
```

#### `partialUpdate(id, data): Promise<DocumentWithId>`

Updates only the provided fields (uses dot-notation under the hood).

```ts
await repo.partialUpdate("abc", { name: "New Name" });
```

#### `getById(id): Promise<T | null>`

Retrieves a single document by its `id`.

#### `delete(id): Promise<{ success: true }>`

Deletes a document by its `id`.

---

### Batch operations

All batch methods use MongoDB's `bulkWrite` with `ordered: false` — a single roundtrip that keeps going even if individual documents fail.

#### `saveMany(data): Promise<DocumentWithId[]>`

Upserts an array of documents. Items with `id` are updated; items without get a generated UUID.
Also refreshes `updatedAt` / `createdAt` per item, just like `save`.

```ts
const results = await repo.saveMany([
  { name: "Alice" },                    // new
  { id: "existing-id", name: "Bob" },   // upsert
]);
// results: [{ id: "..." }, { id: "existing-id" }]
```

#### `updateMany(data): Promise<DocumentWithId[]>`

Fully updates (upserts) each document by its `id`.

```ts
await repo.updateMany([
  { id: "a", name: "Alice v2" },
  { id: "b", name: "Bob v2" },
]);
```

#### `deleteMany(ids): Promise<void>`

Deletes all documents whose `id` is in the provided list.

```ts
await repo.deleteMany(["a", "b", "c"]);
```

---

### Querying

#### `find(filter?, select?, skip?, limit?, orderBy?, direction?, searchValue?, searchFields?): Promise<List<T>>`

Filtered, paginated search with optional sorting and multi-field text search.
Runs with `allowDiskUse: true` by default to avoid the 100MB sort memory limit.

```ts
const page = await repo.find(
  { active: true },   // filter
  { name: 1 },        // select (projection)
  0,                  // skip
  20,                 // limit
  "name",             // orderBy
  "asc",              // direction
  "jo",               // searchValue
  ["name", "email"],  // searchFields
);
// page: { total, skipped, limited, list: T[] }
```

#### `findAll(filter?, select?, orderBy?, direction?, searchValue?, searchFields?): Promise<T[]>`

Same as `find`, but returns every match with no pagination. Also uses `allowDiskUse: true`.

---

### Aggregation

#### `aggregate(pipeline, options?): Promise<T>`

Runs an aggregation pipeline. `options` defaults to `{ allowDiskUse: true }`.

```ts
const result = await repo.aggregate([
  { $group: { _id: "$details.name", count: { $sum: 1 } } },
  { $project: { _id: 0, name: "$_id", count: 1 } },
]);
```

---

## 📐 Types

```ts
type DocumentWithId = { id: string };

type Offset = { skip: number; limit: number };

type List<T> = {
  total: number;
  skipped: number;
  limited: number;
  list: T[];
};
```

---

## 📌 Requirements

- Node.js >= 14
- MongoDB >= 4.x
- TypeScript >= 5.x

---

## ✅ Testing

Example with [Vitest](https://vitest.dev):

```ts
import { describe, it, expect } from "vitest";
import { UserRepository } from "./UserRepository";

describe("UserRepository", () => {
  it("should save a new document", async () => {
    const result = await UserRepository.instance("acme").save({ name: "Test" });
    expect(result.id).toBeDefined();
  });

  it("should save many documents in one roundtrip", async () => {
    const results = await UserRepository.instance("acme").saveMany([
      { name: "A" },
      { name: "B" },
    ]);
    expect(results).toHaveLength(2);
  });
});
```

Run:

```bash
npm test
```

---

## 🤝 Contributing

Pull requests are welcome! Suggestions, usage examples, and improvements are greatly appreciated.

---

## 📝 License

Apache-2.0 © IDress — Renato Miawaki
