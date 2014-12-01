var assert = require('assert'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    fixture = require('file-fixture'),
    run = require('./lib/run.js'),
    backupConfig = require('./lib/backup-config.js');


describe('integration config', function() {

  before(function() {
    restore = backupConfig();

    // fixtures
    fixturepath = fs.realpathSync(fixture.dir({
      'a/a.txt': 'a.txt',
      'b/b.txt': 'b.txt',
      'c/c.txt': 'c.txt'
    }));

    utilpath = fs.realpathSync(fixture.dir({
      // needed to test that quoted commands work as expected, e.g.
      // echoback.js "foo bar" => [ 'foo bar' ]
      // vs echoback.js "foo" "bar" => [ 'foo', 'bar' ]
      'bin/echoback.js': 'console.log(process.argv.slice(2));'
    }));
  });

  after(function() {
    restore();
  });

  beforeEach(function() {
    this.key = 'test.' + Math.random().toString(36).substring(2);
    this.value = Math.random().toString(36).substring(2);
  });

  it('set <k> <v>   Set a config key (overwrites existing value)', function(done) {
    var key = this.key, value = this.value;
    run('--json config set ' + key + ' ' + value, fixturepath + '/a', function(result) {
      run('--json config get ' + key, fixturepath + '/a', function(result) {
        assert.equal(result, value);
        done();
      });
    });
  });

  it('add <k> <v>   Add a value to a config key (appends rather than overwriting)', function(done) {
    var key = this.key, value = this.value;
    run('--json config add ' + key + ' ' + value, fixturepath + '/a', function(result) {
      run('--json config get ' + key, fixturepath + '/a', function(result) {
        assert.ok(Array.isArray(result));
        assert.ok(result.some(function(v) { return v == value; }));
        done();
      });
    });
  });

  it('rm <k> <v>    Remove a value from a config key (if it exists)', function(done) {
    this.timeout(4000);
    var key = this.key, value = this.value, value2 = this.value + 'aa';
    run('--json config add ' + key + ' ' + value, fixturepath + '/a', function(result) {
      assert.deepEqual(result, { op: 'add', key: key, value: value, result: [value] });
      run('--json config add ' + key + ' ' + value2, fixturepath + '/a', function(result) {
        run('--json config rm ' + key + ' ' + value, fixturepath + '/a', function(result) {
        assert.deepEqual(result, { op: 'rm', key: key, value: value, result: [value2] });
          run('--json config get ' + key, fixturepath + '/a', function(result) {
            assert.ok(Array.isArray(result));
            assert.ok(!result.some(function(v) { return v == value; }));
            done();
          });
        });
      });
    });
  });

  it('list - List all configuration (default action)', function(done) {
    var key = this.key, value = this.value;
    run('--json config set ' + key + ' ' + value, fixturepath + '/a', function(result) {
      run('--json config list', fixturepath + '/a', function(result) {
        var parts = key.split('.');
        assert.equal(typeof result, 'object');
        assert.equal(result.test[parts[1]], value);
        done();
      });
    });
  });

});
