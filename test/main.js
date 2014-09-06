var test = require('tape');
var Collection = require('../ampersand-collection');
var State = require('ampersand-state');
var Stooge = State.extend({
    props: {
        id: 'string',
        name: 'string'
    }
});

test('basics', function (t) {
    var c = new Collection();
    var obj = {hey: 'there'};
    t.ok(c);
    c.add(obj);
    t.equals(c.length, 1);
    t.equals(c.at(0), obj);
    t.end();
});

test('indexes: should do `id` by default', function (t) {
    var c = new Collection();
    var obj = {id: '47'};
    var obj2 = {id: '48'};
    c.add([obj, obj2]);
    t.equal(c.get('47'), obj);
    t.equal(c.get('48'), obj2);
    t.end();
});

test('indexes: optionally create other indexes', function (t) {
    var C = Collection.extend({indexes: ['id', 'username']});
    var c = new C();
    var larry = {id: 1, username: 'larry'};
    var curly = {id: 2, username: 'curly'};
    var moe = {id: 3, username: 'moe'};
    c.add([larry, curly, moe]);

    t.equal(larry, c.get('larry', 'username'));
    t.equal(larry, c.get(1));
    t.equal(curly, c.get('curly', 'username'));
    t.equal(curly, c.get(2));
    t.equal(moe, c.get('moe', 'username'));
    t.equal(moe, c.get(3));
    t.end();
});

test('models: support for model constructors', function (t) {
    var Model = function (attributes) {
        this.attributes = attributes;
    };
    var C = Collection.extend({
        model: Model
    });
    var m = new Model({name: 'moe'});
    var plain = {name: 'moe'};
    var c = new C();
    c.add([plain, m]);
    t.equal(m, c.at(1));
    t.ok(c.at(0) instanceof Model);
    t.ok(c.at(1) instanceof Model);
    t.notEqual(plain, c.at(0));
    t.end();
});

test('extend: multi-extend for easy mixins', function (t) {
    var hey = {hey: function () { return 'hey'; }};
    var hi = {hi: function () { return 'hi'; }};
    var C = Collection.extend(hey, hi);
    var c = new C();
    t.equal(c.hey(), 'hey');
    t.equal(c.hi(), 'hi');
    var C2 = C.extend({woah: function () { return 'woah'; }});
    var c2 = new C2();
    t.equal(c2.woah(), 'woah');
    t.end();
});

test('add events', function (t) {
    t.plan(2);
    var c = new Collection();
    var moe = new Stooge({name: 'moe'});
    c.on('add', function (model, collection) {
        t.equal(collection, c);
        t.equal(model, moe);
    });
    c.add(moe);
    t.end();
});

test('remove events', function (t) {
    t.plan(2);
    var c = new Collection();
    var moe = new Stooge({name: 'moe', id: 'thing'});
    c.add(moe);
    c.on('remove', function (model, collection) {
        t.equal(collection, c);
        t.equal(model, moe);
    });
    c.remove(moe);
    t.end();
});

test('remove events for items that only have `cid`s', function (t) {
    t.plan(2);
    var c = new Collection();
    var moe = new Stooge({name: 'moe'});
    c.add(moe);
    c.on('remove', function (model, collection) {
        t.equal(collection, c);
        t.equal(model, moe);
    });
    c.remove(moe);
    t.end();
});

test('comparator as a string', function (t) {
    var Coll = Collection.extend({
        comparator: 'name'
    });
    var c = new Coll();
    var moe = new Stooge({name: 'moe', id: '1'});
    var larry = new Stooge({name: 'larry', id: '2'});
    var curly = new Stooge({name: 'curly', id: '3'});
    c.add([moe, curly, larry]);
    t.equal(c.at(0).name, 'curly');
    t.equal(c.at(1).name, 'larry');
    t.equal(c.at(2).name, 'moe');
    t.end();
});

test('comparator as a 1 arg function', function (t) {
    var Coll = Collection.extend({
        comparator: function (m) {
            return m.name;
        }
    });
    var c = new Coll();
    var moe = new Stooge({name: 'moe', id: '1'});
    var larry = new Stooge({name: 'larry', id: '2'});
    var curly = new Stooge({name: 'curly', id: '3'});
    c.add([moe, curly, larry]);
    t.equal(c.at(0).name, 'curly');
    t.equal(c.at(1).name, 'larry');
    t.equal(c.at(2).name, 'moe');
    t.end();
});

test('comparator as standard 2 arg sort function', function (t) {
    var Coll = Collection.extend({
        comparator: function (m1, m2) {
            if (m1.name > m2.name) return 1;
            if (m1.name < m2.name) return -1;
            return 0;
        }
    });
    var c = new Coll();
    var moe = new Stooge({name: 'moe', id: '1'});
    var larry = new Stooge({name: 'larry', id: '2'});
    var curly = new Stooge({name: 'curly', id: '3'});
    c.add([moe, curly, larry]);
    t.equal(c.at(0).name, 'curly');
    t.equal(c.at(1).name, 'larry');
    t.equal(c.at(2).name, 'moe');
    t.end();
});

test('should store reference to parent instance if passed', function (t) {
    var parent = {};
    var c = new Collection([], {parent: parent});
    t.equal(c.parent, parent);
    t.end();
});

test('`set` should remove models that aren\'t there', function (t) {
    var c = new Collection();
    c.model = Stooge;
    c.set([{name: 'moe', id: '1'}, {name: 'larry', id: '2'}, {name: 'curly', id: '3'}]);
    t.equal(c.length, 3, 'should have 3 stooges');
    c.set([{name: 'moe', id: '1'}, {name: 'larry', id: '2'}]);
    t.equal(c.length, 2, 'should have 2 stooges left');
    t.end();
});

test('`set` method should work for simple objects too', function (t) {
    var c = new Collection();
    c.set([{id: 'thing'}, {id: 'other'}]);
    t.equal(c.length, 2, 'should have two items');
    c.set([{id: 'thing', other: 'property'}], {remove: true});
    t.equal(c.length, 1, 'should have one item');
    var first = c.at(0);
    t.equal(first.id, 'thing');
    t.equal(first.other, 'property');
    t.end();
});

test('`set` method should work for simple objects without ids', function (t) {
    var c = new Collection();
    c.set([{some: 'thing'}, {random: 'other'}]);
    t.equal(c.length, 2, 'should have two items');
    c.set([{other: 'third'}], {remove: false});
    t.equal(c.length, 3);
    var first = c.at(0);
    t.equal(first.some, 'thing');
    t.end();
});

test('Proxy `Array.prototype` methods', function (t) {
    var c = new Collection();
    c.set([{id: 'thing'}, {id: 'other'}]);
    var ids = c.map(function (item) {
        return item.id;
    });
    t.deepEqual(ids, ['thing', 'other']);

    var count = 0;
    c.each(function () {
        count++;
    });
    t.equal(count, 2);
    c.forEach(function () {
        count++;
    });
    t.equal(count, 4);
    t.end();
});

test('Serialize/toJSON method', function (t) {
    var c = new Collection();
    c.set([{id: 'thing'}, {id: 'other'}]);
    t.deepEqual([{id: 'thing'}, {id: 'other'}], c.serialize());
    t.equal(JSON.stringify([{id: 'thing'}, {id: 'other'}]), JSON.stringify(c));
    t.end();
});

test('Ensure `isCollection` exists and is immutable', function (t) {
    var c = new Collection();
    t.ok(c.isCollection);
    c.isCollection = false;
    t.ok(c.isCollection);
    t.end();
});

test('add/remove events should be triggerd with POJO collections', function (t) {
    t.plan(4);

    var c = new Collection();
    var newModel = { id: 1, foo: 'bar' };

    c.once('add', function (model, collection, options) {
        t.equal(model, newModel);
        t.equal(collection, c);
    });

    c.add(newModel);

    c.once('remove', function (model, collection, options) {
        t.equal(model.id, 1);
        t.equal(collection, c);
    });

    c.remove(newModel);
});

test('Bug 14. Should prevent duplicate items when using non-standard idAttribute', function (t) {
    var Model = State.extend({
        idAttribute: '_id',
        props: {
            _id: 'string'
        }
    });

    var C = Collection.extend({
        mainIndex: '_id',
        model: Model
    });
    var c = new C([{_id: '2'}, {_id: '2'}, {_id: '2'}]);

    t.equal(c.length, 1, 'should still be 1');
    c.add({_id: '2'});
    t.equal(c.length, 1, 'should still be 1 if added later');
    c.add(new Model({_id: '2'}));
    t.equal(c.length, 1, 'should still be 1 if added as an instantiated model');
    t.end();
});

test('Bug 20. Should prevent duplicate items when using non-standard idAttribute', function (t) {
    var data = [{_id: '2'}];
    var Model = State.extend({
        idAttribute: '_id',
        props: {
            _id: 'string'
        }
    });
    var C = Collection.extend({
        model: Model
    });
    var c = new C();

    c.reset(data);
    c.add(data);
    t.equal(c.length, 1, 'should have detected the dupe and not added');
    t.end();
});

test('Bug 19. Should set mainIndex from model if supplied', function (t) {
    var Model = State.extend({
        idAttribute: '_id',
        props: {
            _id: 'string'
        }
    });
    var C = Collection.extend({
        model: Model
    });

    var c = new C();
    t.equal(c.mainIndex, '_id', 'should have set mainIndex off of model');

    var c2 = new Collection();
    t.equal(c2.mainIndex, 'id', 'mainIndex should default to `id`');

    t.end();
});

test('add with validate:true enforces validation', function (t) {
    t.plan(5);

    var Model = State.extend({
        idAttribute: '_id',
        props: {
            _id: 'string'
        },
        validate: function (attributes) {
            return 'fail';
        }
    });
    var C = Collection.extend({
        model: Model
    });

    var c = new C();

    c.on('invalid', function (collection, error, options) {
        t.equal(c, collection);
        t.equal(error, 'fail');
        t.equal(options.validate, true);
    });

    var result = c.add({_id: 'a'}, {validate: true});
    t.equal(c.length, 0);
    t.equal(result, false);

    t.end();
});
