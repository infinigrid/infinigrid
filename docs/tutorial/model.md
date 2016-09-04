# Working with the model

Infinigrid's `Model` class is designed to be immutable. Any change to the model
creates a (shallow) copy.

## Extending the Model class

It is possible to use your own class as a model, either by implementing all the
features from `Model` or by just extending `Model`.

```js

class ExtendedModel extends Model {

  foo() {
    console.log('bar');
  }

}

const model = new ExtendedModel().randomMap(16);

model.foo(); // Prints 'bar' since all methods of `Model` preserves the class
```
