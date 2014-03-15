# ampersand-collection

A way to store/manage objects or models.

Unlike other tools this makes no assumptions about how it's going to be used or what type of models it is going to contain. This makes it a very flexible/useful tool for modeling all kinds of stuff. 

It does not require underscore or jQuery, but instead makes it easy to extend with those methods if you'd like.

## massive flexibility

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


```js
var Collection = require('ampersand-collection');
var restMixin = require('ampersand-rest-mixin');
var underscoreMixin = require('ampersand-underscore-mixin');


// or we can extend it with underscore and REST methods
// to turn it into something similar to a Backbone Collection
var RestfulCollection = Collection.extend(underscoreMixin, restMixin, {
    url: '/mystuff' 
});

var collection = new RestfulCollection();

// does ajax request
collection.fetch();


```
