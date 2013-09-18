var assert = require('assert'),
    get = require('../lib/getitem.js').get,
    set = require('../lib/getitem.js').set,
    add = require('../lib/getitem.js').add;

var keys = ['abc', 'foo.bar', 'abc.def.ghi'];

exports['get and set'] = {

  'set and get a single value in nested': function() {
    keys.forEach(function (key) {
      var obj = {},
          value = Math.random().toString(36).substring(2);
      set(key, value, obj);

      // console.log(require('util').inspect(obj, null, 20, true));
      console.log(key, get(key, obj));

      assert.equal(get(key, obj), value);
    });
  },

  'set and get where value exists': function() {
    keys.forEach(function (key) {
      var obj = {},
          value1 = Math.random().toString(36).substring(2),
          value2 = Math.random().toString(36).substring(2);

      add(key, value1, obj);
      add(key, value2, obj);

      console.log(key, get(key, obj));
      assert.deepEqual(get(key, obj), [ value1, value2 ]);
    });

  }

};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stderr.on('data', function (data) { if (/^execvp\(\)/.test(data)) console.log('Failed to start child process. You need mocha: `npm install -g mocha`') });
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
