# mongo-base-crud

Lib to simple handler singleton classes em typescript

## Install

```
npm i mongo-base-crud
```

## Usage

Create `.env` file with

```
MONGO_URL="mongodb://admin:admin@localhost:27017"
MONGO_DB=test
MONGO_PREFIX_NAME=test_
```

`MONGO_URL` full url with a mongo connection
`MONGO_DB` database name
`MONGO_PREFIX_NAME` prefix name to any database that will be created. To keep simple to deal with enviroment or whitelabel projects

### Using to create repository class

```
import { Singleton } from "typescript-singleton";
import BaseCrud from "mongo-base-crud";

export class MyClassExample extends BaseCrud<{id:string, name:string}> {
  public static instance(): MyClassExample {
    return Singleton.getInstance<MyClassExample>(`MyClassExample`, MyClassExample);
  }
  constructor() {
    super("my_collection", "my_database", { clinicAlias: true, unitAlias: true });
  }
}
```

### Using to create repository function to get generic BaseCrud to deal with a collection

```
function getCrud(){
  const genericCrud:BaseCrud<MyDTO> = BaseCrud<MyDTO>.getInstance("collectionName", "dbName", { type: 1 });
  return genericCrud;
}
getCrud().find().then(console.log)

```

### Another examples

```
// Example to add an object

const newObj = { id: "1", name: "John Doe" };
MyClassExample.instance().add(newObj).then(result => {
  console.log("Object added:", result);
}).catch(error => {
  console.error("Error adding object:", error);
});

//if you do not pass id, it will auto created

const newObj = { name: "John Doe" };
MyClassExample.instance().save()

// Example to find objects
MyClassExample.instance().find().then(result => {
  console.log("Objects found:", result);
}).catch(error => {
  console.error("Error finding objects:", error);
});

// Example to delete an object
const objectId = "1";
MyClassExample.instance().delete(objectId).then(result => {
  console.log("Object deleted:", result);
}).catch(error => {
  console.error("Error deleting object:", error);
});

MyClassExample.instance().find().then(result=>{console.log(result)});

```

# Find

## Find params

`filter`

Optional, object to find exactly filter.
If you do not pass, no filter will be used and will be get all data

`select`

Data to return just some params of full object data fields

ex: `{id:true, name:true}, `

`skip`

ex: `0`

for pagination, start in first, optional, default 0

`limit`

ex: `10`

for pagination, get just 10 or less, optional, default 10, get all

`orderBy`

ex: `"name"`

order by name, optional, default undefined

`direction`

ex: `"asc"` or `"desc"`

optional, default asc if is setted orderBy

`searchValue`

ex: `"ab"` to find `abajour` or `ában` or `foolabicon`

search by part of string, optional, default undefined, do not filter

`searchFields`

ex: `["name"]`

the fields that a search will be use to search, optional, no default, if you do not pass, nothing will be search

## Find example

```
export interface MyUserDto{
  id: string,
  name: string,
  cateogry: string,
  birthdate: Date,
  lastname: string,
  active: boolean
}
export async function serviceTofind(active:boolean, category:string, freeQuery?:string):Promise<List<MyUserDto>>{
  const filter: Partial<MyUserDto> = {
    active,
    category
  }
  const resultData:List = MyClassExample.instance().find(
    filter, //filter active and category identical data
    {id:true, name:true}, // return just name and id
    skip = 0, // for pagination, start in first, optional, default 0
    limit = 20, // for pagination, get just 10 or less, optional, default 10, get alll
    orderBy = "name", // order by name, optional, default undefined
    direction = "asc", //optional, default asc if is setted orderBy
    searchValue = freeQuery, //search by part of string, optional, default undefined, do not filter
    searchFields = freeQuery?["name", "lastname"]: undefined // the fields that a search will be use to search, optional, no default, if you do not pass nothing, nothing will be search
  )
  const total:number  = resultData.total;
  const listData:any[] = resultData.data;
  return resultData;
}
```
## Update

```
 * Updates an existing document in the database.
 * 
 * @param data - An object containing the fields to update and the document's ID.
 *               The object must include an `id` property with the document's ID.
 *               If the object contains an `updatedAt` property, it will be set to the current date.
 * 
 * @returns A promise that resolves to the updated document with its ID.
 * 
 * @throws Will throw an error if the update operation fails.

async update(data: { [key: string]: any; id: string }): Promise<DocumentWithId> {
  if (data.hasOwnProperty("updatedAt")) {
    data.updatedAt = new Date();
  }
  const result = await (await this.dbInterface).update(data);
  return result;
}
```

### Example to update an object

```
// Example to update an object

const updatedObj = { id: "1", name: "Jane Doe", updatedAt: new Date() };
MyClassExample.instance().update(updatedObj).then(result => {
  console.log("Object updated:", result);
}).catch(error => {
  console.error("Error updating object:", error);
});

// Example to update an object without updatedAt field

const updatedObjWithoutDate = { id: "2", name: "John Smith" };
MyClassExample.instance().update(updatedObjWithoutDate).then(result => {
  console.log("Object updated:", result);
}).catch(error => {
  console.error("Error updating object:", error);
});
```


## Partial update 
```typescript
/**
 * Partially updates an existing document in the database.
 * 
 * @param id - The ID of the document to update.
 * @param data - An object containing the fields to update.
 *               If the object contains an `updatedAt` property, it will be set to the current date.
 * 
 * @returns A promise that resolves to the updated document with its ID.
 * 
 * @throws Will throw an error if the update operation fails.
 */
async partialUpdate(id: string, data: { [key: string]: any }): Promise<DocumentWithId> {
  if (data.hasOwnProperty("updatedAt")) {
    data.updatedAt = new Date();
  }
  const result = await (await this.dbInterface).partialUpdate(id, data);
  return result;
}
```

### Example to partially update an object

```typescript
// Example to partially update an object

const partialUpdateData = { name: "Jane Doe" };
MyClassExample.instance().partialUpdate("1", partialUpdateData).then(result => {
  console.log("Object partially updated:", result);
}).catch(error => {
  console.error("Error partially updating object:", error);
});

// Example to partially update an object with updatedAt field

const partialUpdateDataWithDate = { name: "John Smith", updatedAt: new Date() };
MyClassExample.instance().partialUpdate("2", partialUpdateDataWithDate).then(result => {
  console.log("Object partially updated:", result);
}).catch(error => {
  console.error("Error partially updating object:", error);
});
```
