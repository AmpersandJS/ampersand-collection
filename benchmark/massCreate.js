var State = require('ampersand-state');
var Collection = require('../ampersand-collection');

var SomeModel = State.extend({
  derived: {
    foo: {
      deps: ['a', 'b'],
      fn: function derived () {
        return this.a + this.b;
      }
    }
  }
});

var CustomCollection = Collection.extend({
  model: SomeModel,
  mainIndex: 'a',
  indexes: ['b'],
  isModel: function(model) {
    return model instanceof SomeModel;
  }
});

var data = new Array(1000);
for (var i = 0; i < 1000; i++) {
  data[i] = new SomeModel({a: i, b: i * 2})
}

//Function that contains the pattern to be inspected
function benchFn() {
  var coll = new CustomCollection(data);
}

function printStatus(fn) {
    switch(%GetOptimizationStatus(fn)) {
        case 1: console.log("Function is optimized"); break;
        case 2: console.log("Function is not optimized"); break;
        case 3: console.log("Function is always optimized"); break;
        case 4: console.log("Function is never optimized"); break;
        case 6: console.log("Function is maybe deoptimized"); break;
    }
}

//Fill type-info
benchFn();
// 2 calls are needed to go from uninitialized -> pre-monomorphic -> monomorphic
benchFn();
benchFn();
benchFn();
benchFn();
benchFn();

%OptimizeFunctionOnNextCall(benchFn);
//The next call
benchFn();

//Check
printStatus(benchFn);


console.time('createCollection');
for (var i = 0; i < 1000;i++) {
  benchFn();
}
console.timeEnd('createCollection');
