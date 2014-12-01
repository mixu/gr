var assert = require('assert'),
    get = require('../lib/getitem.js').get,
    set = require('../lib/getitem.js').set,
    add = require('../lib/getitem.js').add;

var keys = ['abc', 'foo.bar', 'abc.def.ghi'];

describe('test get and set', function() {

  it('set and get a single value in nested', function() {
    keys.forEach(function(key) {
      var obj = {},
          value = Math.random().toString(36).substring(2);
      set(key, value, obj);

      // console.log(require('util').inspect(obj, null, 20, true));
      console.log(key, get(key, obj));

      assert.equal(get(key, obj), value);
    });
  });

  it('set and get where value exists', function() {
    keys.forEach(function(key) {
      var obj = {},
          value1 = Math.random().toString(36).substring(2),
          value2 = Math.random().toString(36).substring(2);

      add(key, value1, obj);
      add(key, value2, obj);

      console.log(key, get(key, obj));
      assert.deepEqual(get(key, obj), [value1, value2]);
    });
  });

  it('get nonexistent', function() {
    assert.equal(get('aaa', {}), undefined);
  });

});
