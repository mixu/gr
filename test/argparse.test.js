var assert = require('assert'),
    util = require('util'),
    parse = require('../lib/argparse.js');

describe('test parse', function() {

  it('parses short boolean', function() {
    assert.deepEqual(parse([ '-b' ]), { b: true });
  });

  it('long boolean', function() {
    assert.deepEqual(parse([ '--bool' ]), { bool: true });
  });

  it('bare', function() {
    assert.deepEqual(parse([ 'foo', 'bar', 'baz' ]), { _: ['foo', 'bar', 'baz'] });
  });

  it('short capture', function() {
    assert.deepEqual(parse([ '-h', 'bar', 'baz' ]), { h: 'bar', _: ['baz'] });
  });

  it('short captures', function() {
    assert.deepEqual(parse([ '-h', 'bar', '-p', 1 ]), { h: 'bar', p: 1 });
  });

  it('long capture space', function() {
    assert.deepEqual(parse([ '--long', 'bar' ]), { long: 'bar' });
  });

  it('long capture eq', function() {
    assert.deepEqual(parse([ '--long=bar' ]), { long: 'bar' });
  });

  it('long captures space', function() {
    assert.deepEqual(parse([ '--long', 'bar', '--foo', 'baz' ]), { long: 'bar', foo: 'baz' });
  });

  it('long captures eq', function() {
    assert.deepEqual(parse([ '--long=bar', '--foo=baz' ]), { long: 'bar', foo: 'baz' });
  });

  it('no long boolean', function() {
    assert.deepEqual(parse([ '--no-bool' ]), { bool: false });
  });

  it('multiple captures', function() {
    assert.deepEqual(parse([ '-v', 'a', '-v', 'b', '-v', 'c' ]), { v : ['a','b','c'] });
  });

  it('capture unknown as smart arg', function() {
    assert.deepEqual(parse([ '-b', 'hello', 'world' ], { b: Boolean } ),
      { b: true, _: ['hello', 'world'] });
    assert.deepEqual(parse([ '--bool', 'hello', 'world' ], {bool: Boolean }),
      { bool: true, _: ['hello', 'world'] });
    assert.deepEqual(parse([ '--long', 'bar', '--foo', 'baz', 'hello', 'world' ]),
      { long: 'bar', foo: 'baz', _: ['hello', 'world'] });

    assert.deepEqual(parse([ 'git', 'log', '--short', '-1' ]),
      { _: ['git', 'log', '--short', '-1'] });
  });

  it('explicit args', function() {
    assert.deepEqual(parse([ '--bool', 'foo', '--', 'hello', 'world' ]),
      { bool: 'foo', _: ['hello', 'world'] });
    assert.deepEqual(parse([ '--bool', 'foo', '--', 'hello', 'world' ], { bool: Boolean }),
      { bool: true, _: ['hello', 'world'] });
    assert.deepEqual(parse([ '--bool', 'foo', '--', '--hello', '--world' ]),
      { bool: 'foo', _: ['--hello', '--world'] });
  });

  xit('smart target does not exist');
  xit('smart target exists but not a directory');
  xit('smart target exists and is a directory');
  xit('capture long arguments given the number of expected options');

});
