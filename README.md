# 🧩 mongo-base-crud

**TypeScript library to simplify CRUD operations with MongoDB.**  
Ideal for whitelabel projects, with support for multiple databases, dynamic aliases, and Singleton pattern.

---

## 📦 Installation

```bash
npm install mongo-base-crud
```

---

## ⚙️ Configuration

Create a `.env` file with the following variables:

```env
MONGO_URL="mongodb://admin:admin@localhost:27017"
MONGO_DB=test
MONGO_PREFIX_NAME=test_
MONGO_DISABLE_PLURAL=true
```

- `MONGO_URL`: MongoDB connection URL
- `MONGO_DB`: Base database name
- `MONGO_PREFIX_NAME`: Prefix used for multi-tenant or whitelabel projects
- `MONGO_DISABLE_PLURAL`: *(optional)* if set to `true`, prevents automatic pluralization of collection names

📌 **Manual configuration example:** you can override this programmatically by passing `disablePlural: true` in the connection config:

```ts
await BaseCrud.getInstance("exact_collection_name", "my_db", {}, 1, {
  fullUrl: "mongodb://localhost:27017",
  disablePlural: true,
});
```

---

## 🧠 About `getInstance` and `.instance()`

🔹 `BaseCrud.getInstance(...)`  
Creates or returns a global Singleton instance. Useful for dynamic or generic cases. The instance key is based on `dbName_collectionName`.

🔸 `.instance(alias: string)`  
Recommended method to create reusable repositories with unique names, ideal for whitelabel projects. Internally uses `getInstance` with a custom key based on the alias.

---

## 🧪 Example with `.instance()`

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
      `UserRepo_${clinicAlias}`, // unique instance key
      UserRepository,
      "users",
      dbName,
      { name: 1 } // indexes
    );
  }

  constructor(collection = "users", dbName = "default", indexes = {}) {
    super(collection, dbName, indexes);
  }
}
```

---

## 📚 Available Methods

### 🧩 `save(data: object): Promise<DocumentWithId>`

Creates or completely replaces a document. If `id` is present, acts as an upsert.

#### ✅ Example 1

```ts
const saveResult = await UserRepository.instance("acme").save({
  name: "John"
});
```

#### ✅ Example 2

```ts
await UserRepository.instance("acme").save({
  id: "my-custom-id",
  name: "Mary"
});
```

---

### ✏️ `update(data: { id: string, ... }): Promise<DocumentWithId>`

Fully updates a document based on the provided `id`.

---

### 🧩 `partialUpdate(id: string, data: object): Promise<DocumentWithId>`

Partially updates only the provided fields of a document.

---

### 🔍 `find(filter?, select?, skip?, limit?, orderBy?, direction?, searchValue?, searchFields?): Promise<List<T>>`

Performs a filtered, paginated search with optional sorting and text search on multiple fields.

---

### 📋 `findAll(filter?, select?, orderBy?, direction?, searchValue?, searchFields?): Promise<T[]>`

Same as `find`, but returns all results without pagination.

---

### 🔍 `getById(id: string): Promise<T | null>`

Retrieves a document by its ID.

---

### ❌ `delete(id: string): Promise<boolean>`

Deletes a document by its ID.

---

### 🔄 `aggregate(pipeline: object[]): Promise<T[]>`

Executes an aggregation pipeline.  
**Example:**

```ts
const result = await UserRepository.instance("acme").aggregate([
  { $group: { _id: "$details.name", count: { $sum: 1 } } },
  { $project: { _id: 0, name: "$_id", count: 1 } }
]);
```

---

## 🏗️ Generic Usage with `getInstance(...)`

```ts
const crud = BaseCrud.getInstance<{ id: string; name: string }>(
  "users",
  "clinic_acme",
  { name: 1 }
);

await crud.save({ name: "Example" });
```

---

## 📌 Requirements

- Node.js >= 14
- MongoDB >= 4.x
- TypeScript

---

## ✅ Tests

Example using [Vitest](https://vitest.dev):

```ts
it("should save a new document", async () => {
  const result = await UserRepository.instance("acme").save({ name: "Test" });
  expect(result.id).toBeDefined();
});
```

---

## 🤝 Contributing

Pull requests are welcome! Suggestions, usage examples, and improvements are greatly appreciated.

---

## 📝 License

Apache-2.0 © IDress : Renato Miawaki
