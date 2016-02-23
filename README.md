# ampersand-collection

A way to store/manage objects or models.

Unlike other tools this makes no assumptions about how it's going to be used or what type of models it is going to contain. This makes it a very flexible/useful tool for modeling all kinds of stuff.

It does not require underscore or jQuery, but instead makes it easy to extend with those methods if you'd like.

<!-- starthide -->
Part of the [Ampersand.js toolkit](http://ampersandjs.com) for building clientside applications.
<!-- endhide -->

## Installation

```
npm i ampersand-collection
```

<!-- starthide -->
## massive flexibility

The collection is a fairly low-level tool, in that it's useful for any time you want to be able to store JS objects in an array.

In many ways it's simply an observable array of objects.

It emits events when models are added, removed, sorted and more. It also allows for merging in a set of objects into an existing collection and emitting change events appropriately. For a detailed overview of the events that are emitted by ampersand-collection, please refer to the [Event Catalog](http://ampersandjs.com/learn/events) on the AmpersandJS learn page.

If you extend it with a `.model` property that contains a constructor, the collection will ensure that objects that don't match that constructor are instantiated before being added to the collection.

For example:

```js
var Collection = require('ampersand-collection');

// can just store plain objects
var basicCollection = new Collection([
    {name: 'larry'},
    {name: 'curly'},
    {name: 'moe'}
]);
```

Adding [ampersand-collection-rest-mixin](https://github.com/AmpersandJS/ampersand-collection-rest-mixin) and [ampersand-collection-underscore-mixin](http://github.com/AmpersandJS/ampersand-collection-underscore-mixin).

```js
var Collection = require('ampersand-collection');
var restMixin = require('ampersand-collection-rest-mixin');
var underscoreMixin = require('ampersand-collection-underscore-mixin');


// or we can extend it with underscore and REST methods
// to turn it into something similar to a Backbone Collection
var RestfulCollection = Collection.extend(underscoreMixin, restMixin, {
    url: '/mystuff'
});

var collection = new RestfulCollection();

// does ajax request
collection.fetch();
```

## A quick note about `instanceof` checks

Because of module deps in npm and browserify, sometimes it’s possible to end up in a situation where the same `collection` constructor wasn't used to build a `collection` object. As a result, `instanceof` checks will fail.

To deal with this (because sometimes this is a legitimate scenario), `collection` simply creates a read-only `isCollection` property on all collection objects. You can use it to check whether or a not a given object is, in fact, a collection object—no matter what its constructor was.
<!-- endhide -->

## API Reference

### extend `AmpersandCollection.extend([attributes])`

Create a collection class of your own by extending `AmpersandCollection`, providing the required instance properties to be attached instances of your class.

Typically you will specify a `model` constructor (if you are storing [ampersand-state](http://ampersandjs.com/docs#ampersand-state) or [ampersand-model](http://ampersandjs.com/docs#ampersand-model) objects).

### model `collection.model`

Override this property to specify the model class that the collection contains. If defined, you can pass raw attributes objects (and arrays) to `add` and `reset`, and the attributes will be converted into a model of the proper type.

```javascript
var Library = AmpersandCollection.extend({
    model: Book
});
```

A collection can also contain polymorphic models by overriding this property with a function that returns a model.

*Please note* that if you do this, you'll also want to override the `isModel` method with your own, and describe the logic used to determine whether an object is already an instantiated model or not.

```javascript
var Library = AmpersandCollection.extend({

  model: function(attrs, options) {
    if (condition) {
      return new PublicDocument(attrs, options);
    } else {
      return new PrivateDocument(attrs, options);
    }
  },

  isModel: function (model) {
    return model instanceof PublicDocument || model instanceof PrivateDocument;
  }

});
```


### constructor/initialize `new AmpersandCollection([models [, options]])`

When creating an `AmpersandCollection`, you may choose to pass in the initial array of **`models`**. The collection's [`comparator`](#comparator) may be included as an option. If you define an **`initialize`** function, it will be invoked when the collection is created, with **`models`** and **`options`** as arguments. There are a couple of options that, if provided, are attached to the collection directly: `model`, `comparator` and `parent`. 

```javascript
var people = new AmpersandCollection([{ name: 'phil' }, { name: 'bob' }, { name: 'jane' }], {
    model: Person
});
```

### mainIndex `collection.mainIndex`

Specify which property the collection should use as the main index (and unique identifier) for the models/objects it holds. This is the property that [`get`](#ampersand-collection-get) uses to retrieve models, and what `add`, `set`, and `remove` uses to determine whether a collection already contains a model or not.

If you specify a [`model`](http://ampersandjs.com/docs#ampersand-collection-model) property in the collection, and the model specifies an [`idAttribute`](http://ampersandjs.com/docs#ampersand-state-idattribute), the collection will use *that* as the `mainIndex` unless you explicitly set it to something else.

If *no* `mainIndex` or `model` is specified `"id"` is used as the default `mainIndex`.

This means, that *most* of the time you don't need to set `mainIndex` and things will still Just Work™.  If you wish to index on a derived property, your derived `fn` must be a pure function, and will be bound to the object passed into the collection on `.add()/.remove()/.set()` etc.

You may set it explicitly while extending `AmpersandCollection` like so:

```javascript
var People = AmpersandCollection.extend({
    mainIndex: '_id'
});
```

### indexes `collections.indexes`

Specify an optional array of keys to serve as additional indexes for the models in your collection (in addition to `mainIndex`). This allows you to quickly retrieve models by specifying the key to use with [`get`](#ampersand-collection-get).

Note that `get` will only ever return a single model, so the values of these indexes should be unique across the models in the collection:

```javascript
var People = AmpersandCollection.extend({
    mainIndex: '_id',

    indexes: ['otherId']
});

var people = new People([
    { _id: 1, otherId: 'a', name: 'Phil' },
    { _id: 2, otherId: 'b', name: 'Julie' },
    { _id: 3, otherId: 'c', name: 'Henrik' },
    { _id: 4, otherId: 'd', name: 'Jenn' }
]);

people.get(1) //=> { _id: 1, otherId: 'a', name: 'Phil' }

people.get('b', 'otherId') //=> { _id: 2, otherId: 'b', name: 'Julie' },
```


### length `collection.length`

Returns the `length` of the underlying array.


### isCollection/instanceof `collection.isCollection`

Because of module deps in npm and browserify, sometimes it’s possible to end up in a situation where the same `collection` constructor wasn't used to build a `collection` object. As a result, `instanceof` checks will fail.

To deal with this (because sometimes this is a legitimate scenario), `collection` simply creates a read-only `isCollection` property on all collection objects. You can use it to check whether or a not a given object is, in fact, a collection object—no matter what its constructor was.


### add `collection.add(modelOrObject, [options])`

Add a model (or an array of models) to the collection, firing an `"add"` event. If a [`model`](#ampersand-collection-model) property is defined, you may also pass raw attributes objects, and have them be vivified as instances of the model. Returns the added models (or preexisting models, if already contained).

**Options:**

* Pass `{at: index}` to splice the model into the collection at the specified index.
* If you're adding models to the collection that it already contains, they'll be ignored, unless you pass `{merge: true}`, in which case their attributes will be merged into the corresponding models, firing any appropriate `"change"` events.

```javascript
var ships = new AmpersandCollection();

ships.on("add", function(ship) {
  console.log("Ahoy " + ship.name + "!");
});

ships.add([
  {name: "Flying Dutchman"},
  {name: "Black Pearl"}
]);

//logs:
//- "Ahoy Flying Dutchman!"
//- "Ahoy Black Pearl!"
```

Note that adding the same model (a model with the same `id`) to a collection more than once is a no-op.


### serialize `collection.serialize()`

Serialize the collection into a plain javascript array, ready for sending to the server (typically called via [`toJSON`](#ampersand-collection-tojson)). Also calls `serialize()` on each model in the collection.

### toJSON `collection.toJSON()`

Returns a plain javascript array of the models in the collection (which are also serialized), ready for sending to the server. The name of this method is a bit confusing, as it doesn't actually return a JSON string — but I'm afraid that it's the way that the JavaScript API for `JSON.stringify()` works.

```javascript
var collection = new AmpersandCollection([
    {name: "Tim", age: 5},
    {name: "Ida", age: 26},
    {name: "Rob", age: 55}
]);

console.log(JSON.stringify(collection));
//=> "[{\"name\":\"Tim\",\"age\":5},{\"name\":\"Ida\",\"age\":26},{\"name\":\"Rob\",\"age\":55}]"
```

### parse `collection.parse(data, [options])`

The parse method gets called if the `{parse: true}` option is passed when calling `collection.set` method. By default, `parse` simply returns the data it was passed, but can be overwritten through `.extend` to provide any additional parsing logic to extract the array of data that should be stored in the collection. This is most commonly used when processing data coming back from an ajax request. The response from an API may look like this:

```javascript
{
  "limit": 100,
  "offset": 0,
  "data": [
    {"name": "larry"},
    {"name": "curly"},
    {"name": "moe"}
  ]
}
```

To extract `data` you'd define a `parse` method on the collection as follows, to return the array of data to be stored.

```javascript
var MyCollection = Collection.extend({
    parse: function (response) {
        return response.data;
    }
});
```

If you're using `ampersand-rest-collection`'s `fetch()` method, the `parse` method will be called with the response by default. Also, the options object passed to `set()` gets passed through as a second argument to allow for conditional parsing logic.

### set `collection.set(models, [options])`

The **set** method performs a "smart" update of the collection with the passed list of models:

* If a model in the list isn't in the collection, it will be added.
* If a model in the list is in the collection already, its attributes will be merged.
* If the collection contains any models that aren't in the list, they'll be removed.

All of the appropriate `"add"`, `"remove"`, and `"change"` events are fired as this happens. If you'd like to customize the behavior, you can disable it with options: `{add: false}`, `{remove: false}`, or `{merge: false}`.

Returns the touched models in the collection.

```javascript
var vanHalen = new AmpersandCollection([eddie, alex, stone, roth]);

vanHalen.set([eddie, alex, stone, hagar]);

// Fires a "remove" event for roth, and an "add" event for "hagar".
// Updates any of stone, alex, and eddie's attributes that may have
// changed over the years.
```

### get `collection.get(query, [indexName])`

Retrieve a model from the collection by index.

If called without `indexName` (`collection.get(123)`), retrieves the model by its [`mainIndex`](#ampersand-collection-mainindex) attribute.

Alternatively, specify an `indexName` to retrieve a model by any of the other listed [`indexes`](#ampersand-collection-indexes).

```javascript
var People = AmpersandCollection.extend({
    mainIndex: '_id',

    indexes: ['otherId']
});

var people = new People.add([
    { _id: 1, otherId: 'a', name: 'Phil' },
    { _id: 2, otherId: 'b', name: 'Julie' },
    { _id: 3, otherId: 'c', name: 'Henrik' },
    { _id: 4, otherId: 'd', name: 'Jenn' }
]);

people.get(1) //=> { _id: 1, otherId: 'a', name: 'Phil' }

people.get('b', 'otherId') //=> { _id: 2, otherId: 'b', name: 'Julie' },
```


### at `collection.at(index)`

Get a model from a collection, specified by `index`. Useful if your collection is sorted.

If your collection isn't sorted, `at()` will still retrieve models in insertion order; e.g., `collection.at(0)` returns the first model in the collection.

### remove `collection.remove(models, [options])`

Remove a model (or an array of models) from the collection, and returns them. Fires a `"remove"` event, which you can use the option `{ silent: true }` to suppress. The model's index before removal is available to listeners as `options.index`.

The models object/array can be references to actual models, or just a list of `id`s to remove.


### reset `collection.reset(models, [options])`

Adding and removing models one at a time is all well and good, but sometimes there are so many models to change that you'd rather just update the collection in bulk. Use **`reset()`** to replace a collection with a new list of models (or attribute hashes), triggering a single `"reset"` event at the end. For convenience, within a `"reset"` event, the list of any previous models is available as `options.previousModels`.

Returns the newly-set models.

Calling `collection.reset()` without passing any models as arguments will empty the entire collection.

### sort `collection.sort([options])`

Force a collection to re-sort itself. Triggers a `"sort"` event on the collection.

You don't need to call this under normal circumstances, as a collection with a `comparator` will sort itself whenever a model is added. To prevent this when adding a model, pass a `{sort: false}` option to `add()`.


### models `collection.models`

Raw access to the JavaScript array of models inside of the collection. Usually you'll want to use `get`, `at`, or the [proxied array methods](#ampersand-collection-proxied-es5-array-methods-9) to access model objects, but occasionally a direct reference to the array is desired.

### comparator

The `comparator` option lets you define how models in a collection are sorted. There's a few ways to declare `comparator`:

* Passing `false` prevents sorting
* Passing `string` sorts the collection by a specific model attribute
* Passing `function` will use native array `sort` function; which you can define with either 1 argument (each model one by one), or multiple arguments (which lets you write custom compare functions with next 2 models as arguments).

### proxied ES5 array methods (9)

The base `AmpersandCollection` proxies some basic ES5 methods to the underlying model array. Further documentation of these methods is available at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Iteration_methods)

* indexOf
* lastIndexOf
* every
* some
* forEach
* each (alias for forEach)
* map
* filter
* reduce
* reduceRight

Unlike Backbone collections, it does not include Underscore and all of its array methods. But if you want more functions than those built into modern browsers, you can mixin [`ampersand-collection-underscore-mixin`](https://github.com/AmpersandJS/ampersand-collection-underscore-mixin) to get them.

```javascript
var people = People([
    { name: 'Phil', hatColor: 'red' },
    { name: 'Jenn', hatColor: 'green' },
    { name: 'Henrik', hatColor: 'blue' },
    { name: 'Julie', hatColor: 'yellow' }
]);

people.map(function (person) { return person.name; }) //=> ['Phil', 'Jenn', 'Henrik', 'Julie']

people.filter(function (person) {
    return person.name[0] === 'J';
}) //=> ['Jenn', 'Julie']
```


<!-- starthide -->

## credits

Created by [@HenrikJoreteg](http://twitter.com/henrikjoreteg), but many ideas and some code (especially for `set()`) should be credited to [Jeremy Ashkenas](https://github.com/jashkenas) and the rest of the Backbone.js authors.


## license

MIT

## changelog

- 1.5.0 - add ability to index on a derived property

<!-- endhide -->
