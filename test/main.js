var test = require('tape');
var Collection = require('../collection');


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
