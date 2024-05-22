# mongo-base-crud

Lib to simple handler singleton classes em typescript

## Install

```
npm i mongo-base-crud
```

## Usage

Create `.env` file with

```
MONGO_URL=
MONGO_DB=
MONGO_PREFIX_NAME=
```

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
/// Example to add an object

const newObj = { id: "1", name: "John Doe" };
MyClassExample.instance().add(newObj).then(result => {
  console.log("Object added:", result);
}).catch(error => {
  console.error("Error adding object:", error);
});

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
