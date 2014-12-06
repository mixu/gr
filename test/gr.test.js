var assert = require('assert'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    fixture = require('file-fixture'),
    run = require('./lib/run.js'),
    backupConfig = require('./lib/backup-config.js');

var fixturepath,
    utilpath;

var restore;

describe('gr integration tests', function() {

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

  xdescribe('can set the command explicitly using --', function() {
    xit('gr #foo -- cmd');
  });

  xdescribe('a target that is not a directory is treated as a command', function() {
    xit('gr dir file.sh');
  });

  xdescribe('if no target is given, then all tagged paths are used', function() {});


  it('can run commands with ", like git commit -m "foo bar"', function(done) {
    // gr ./fixtures/a echo "foo bar"
    run(fixturepath + '/a' + ' node ' +
      utilpath + '/bin/echoback.js ' +
      ' "foo bar"', fixturepath + '/a', function(result) {
      assert.ok(/\[ 'foo bar' \]/.test(result));
      done();
    });
  });

  describe('path with spaces', function() {
    var fixturepath = fs.realpathSync(fixture.dir({
      'this path has spaces/file.txt': 'file.txt'
    }));

    it('can tag a folder using quotes', function(done) {
      var tag = Math.random().toString(36).substring(2),
          expected = fixturepath + '/this path has spaces';

      run('--json +@' + tag + ' "' + expected + '"', fixturepath, function(result) {
        // get the answer
        run('--json tag ls ' + tag, fixturepath, function(result) {
          assert.ok(Array.isArray(result));
          assert.ok(result.some(function(v) {
            return v == expected;
          }));
          done();
        });
      });
    });

    it('can tag a folder using escaped spaces', function(done) {
      var tag = Math.random().toString(36).substring(2),
          expected = fixturepath + '/this path has spaces';

      run('--json +@' + tag + ' ' + expected.replace(/ /g, '\\ '), fixturepath, function(result) {
        // get the answer
        run('--json tag ls ' + tag, fixturepath, function(result) {
          assert.ok(Array.isArray(result));
          assert.ok(result.some(function(v) {
            return v == expected;
          }));
          done();
        });
      });
    });
  });


// Not worth testing automatically:
//     gr tag discover    Auto-discover git paths under ~/
//     gr list        List all known repositories and their tags
//     gr status    Displays the (git) status of the selected directories.
//     gr help        Show this help
//     gr version     Version info

// TODO:
// enabling / disabling plugins
//    gr bootstramp

/*
  'executing bootstrap queues the right commands': function() {

  }
*/

});
