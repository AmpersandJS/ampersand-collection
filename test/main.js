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
