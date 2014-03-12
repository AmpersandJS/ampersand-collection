var test = require('tape');
var Collection = require('../collection');


test('basics', function (t) {
    var c = new Collection();
    t.ok(c);
    c.add({hey: 'there'});
    t.end();
});
