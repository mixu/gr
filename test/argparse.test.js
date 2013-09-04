var assert = require('assert'),
    util = require('util'),
    parse = require('../lib/argparse.js');

exports['parse'] = {

  'short boolean': function() {
    assert.deepEqual(parse([ '-b' ]), { b: true });
  },

  'long boolean': function() {
    assert.deepEqual(parse([ '--bool' ]), { bool: true });
  },

  'bare': function() {
    assert.deepEqual(parse([ 'foo', 'bar', 'baz' ]), { _: ['foo', 'bar', 'baz'] });
  },

  'short capture': function() {
    assert.deepEqual(parse([ '-h', 'bar', 'baz' ]), { h: 'bar', _: ['baz'] });
  },

  'short captures': function() {
    assert.deepEqual(parse([ '-h', 'bar', '-p', 1 ]), { h: 'bar', p: 1 });
  },

  'long capture space': function() {
    assert.deepEqual(parse([ '--long', 'bar' ]), { long: 'bar' });
  },

  'long capture eq': function() {
    assert.deepEqual(parse([ '--long=bar' ]), { long: 'bar' });
  },

  'long captures space': function() {
    assert.deepEqual(parse([ '--long', 'bar', '--foo', 'baz' ]), { long: 'bar', foo: 'baz' });
  },

  'long captures eq': function() {
    assert.deepEqual(parse([ '--long=bar', '--foo=baz' ]), { long: 'bar', foo: 'baz' });
  },

  'no long boolean': function() {
    assert.deepEqual(parse([ '--no-bool' ]), { bool: false });
  },

  'multiple captures': function() {
    assert.deepEqual(parse([ '-v', 'a', '-v', 'b', '-v', 'c' ]), { v : ['a','b','c'] });
  },

  'capture unknown as smart arg': function() {
    assert.deepEqual(parse([ '-b', 'hello', 'world' ], { b: Boolean } ),
      { b: true, _: ['hello', 'world'] });
    assert.deepEqual(parse([ '--bool', 'hello', 'world' ], {bool: Boolean }),
      { bool: true, _: ['hello', 'world'] });
    assert.deepEqual(parse([ '--long', 'bar', '--foo', 'baz', 'hello', 'world' ]),
      { long: 'bar', foo: 'baz', _: ['hello', 'world'] });

    assert.deepEqual(parse([ 'git', 'log', '--short', '-1' ]),
      { _: ['git', 'log', '--short', '-1'] });
  },

  'explicit args': function() {
    assert.deepEqual(parse([ '--bool', 'foo', '--', 'hello', 'world' ]),
      { bool: 'foo', _: ['hello', 'world'] });
    assert.deepEqual(parse([ '--bool', 'foo', '--', 'hello', 'world' ], { bool: Boolean }),
      { bool: true, _: ['hello', 'world'] });
    assert.deepEqual(parse([ '--bool', 'foo', '--', '--hello', '--world' ]),
      { bool: 'foo', _: ['--hello', '--hello'] });
  },

  'smart target does not exist': function() {

  },

  'smart target exists but not a directory': function() {

  },

  'smart target exists and is a directory': function() {

  },

  'capture long arguments given the number of expected options': function() {

  },

};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stderr.on('data', function (data) { if (/^execvp\(\)/.test(data)) console.log('Failed to start child process. You need mocha: `npm install -g mocha`') });
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
