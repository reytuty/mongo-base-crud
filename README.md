# mongo-base-crud

Lib to simple handler singleton classes em typescript

## Install

```
npm i mongo-base-crud
```

## Usage

```
import { Singleton } from "mongo-base-crud";

Singleton.getInstance<MyClassThatIWannaToBeUnique>(
'here-my-unique-key',
MyClassThatIWannaToBeUnique,
//put your parameters here if you want
);

```

```

import { Singleton } from "mongo-base-crud";

class MyClassThatIWannaToBeUnique {
public name: string;
public total: number;
constructor(name: string, total: number) {
this.name = name;
this.total = total;
}
}

//If your class use json to config or other parameters, stringfy all of them and use as a key, like this example

const myClassConfig: any = {
user:"root",
pass:"abc",
port: 11027
}

//in this case if some other equal config was used to instance the same class, that will be the same instance class

const privateKey: string = JSON.stringfy(myClassConfig);
const total = 10;
const myClassInstance1: MyClassThatIWannaToBeUnique =
Singleton.getInstance<MyClassThatIWannaToBeUnique>(
privateKey,
MyClassThatIWannaToBeUnique,
"test",
total
);
const myClassInstance2: MyClassThatIWannaToBeUnique =
Singleton.getInstance<MyClassThatIWannaToBeUnique>(
privateKey,
MyClassThatIWannaToBeUnique,
"test",
total
);
//to prove that be the same instance, I will change a name of instance 1
myClassInstance1.name = "There is no test anymore";
console.log(myClassInstance1.name === myClassInstance2.name, "same name and same memory location");

```

```

```
