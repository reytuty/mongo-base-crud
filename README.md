# mongo-base-crud

Lib to simple handler singleton classes em typescript

## Install

```
npm i mongo-base-crud
```

## Usage

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


MyClassExample.instance().find().then(result=>{console.log(result)});

```

```
function getCrud(){
  const genericCrud:BaseCrud<MyDTO> = BaseCrud<MyDTO>.getInstance("collectionName", "dbName", { type: 1 });
  return genericCrud;
}
getCrud().find().then(console.log)

```
