# ampersand-collection

A way to store/manage objects or models.

Unlike other tools this makes no assumptions about how it's going to be used or what type of models it is going to contain. This makes it a very flexible/useful tool for modeling all kinds of stuff.

It does not require underscore or jQuery, but instead makes it easy to extend with those methods if you'd like.

<!-- starthide -->
Part of the [Ampersand.js toolkit](http://ampersandjs.com) for building clientside applications.
<!-- endhide -->

## browser support

[![browser support](https://ci.testling.com/ampersandjs/ampersand-collection.png)
](https://ci.testling.com/ampersandjs/ampersand-collection)

## install

```
npm i ampersand-collection
```

## massive flexibility

The collection is a fairly low-level tool, in that it's useful for any time you want to be able to store JS objects in an array.

In many ways it's simply an observable array of objects.

It emits `add`, `remove` events and makes it possible to merge in a set of objects into an existing collection and emit change events appropriately.

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

Adding [ampersand-collection-rest-mixin](http://github.com/AmpersandJS/ampersand-rest-mixin) and [ampersand-collection-underscore-mixin](http://github.com/AmpersandJS/ampersand-collection-underscore-mixin). 

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

## A quick note about instanceof checks

With npm and browserify for module deps you can sometimes end up with a situation where, the same `collection` constructor wasn't used to build a `collection` object. As a result `instanceof` checks will fail. 

In order to deal with this (because sometimes this is a legitimate scenario), `collection` simply creates a read-only `isCollection` property on all collection objects that can be used to check whether or a not a given object is in fact a collection object no matter what its constructor was.


<!-- starthide -->

## credits

Created by [@HenrikJoreteg](http://twitter.com/henrikjoreteg) but many ideas and some code (especially for the `set`) methods should be credited to Jeremy Ashkenas and the rest of the Backbone.js authors. 


## license

MIT

<!-- endhide -->
