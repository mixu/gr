var assert = require('assert'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    fixture = require('file-fixture'),
    run = require('./lib/run.js'),
    backupConfig = require('./lib/backup-config.js');

describe('integration tagging', function() {

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

  // Tagging:
  describe('pristine - ', function() {

    beforeEach(function(done) {
      // add a new random tag
      this.pristineTag = Math.random().toString(36).substring(2);
      run('--json +#' + this.pristineTag, fixturepath + '/a', function(result) {
        done();
      });
    });

    it('#tag - List directories associated with "tag"', function(done) {
      var p = fixturepath + '/a';
      // #foo
      run('--json -t ' + this.pristineTag, p, function(result) {
        assert.ok(Array.isArray(result));
        assert.ok(result.some(function(v) {
          return v == p;
        }));
        done();
      });
    });

    // #tag <cmd>      Run a command in the directories associated with "tag"
    it('-t <tag> <cmd> - Run a command in the directories associated with "tag"', function(done) {
      // #foo ls -lah
      run('-t ' + this.pristineTag + ' ls -lah', fixturepath + '/a', function(result) {
        // check that one of the lines contains "a.txt"
        assert.ok(/a\.txt/.test(result));
        done();
      });
    });

    it('can mix tags and paths for command execution', function(done) {
      // gr -t bar ./fixtures/b cmd
      run('-t ' + this.pristineTag + ' ' + fixturepath + '/b' + ' ls -lah', fixturepath + '/a', function(result) {
        // check that one of the lines contains "a.txt" (via the tag)
        assert.ok(/a\.txt/.test(result));
        // check that one of the lines contains "b.txt" (via the path)
        assert.ok(/b\.txt/.test(result));
        done();
      });
    });

    it('tag list - List all tags (default action)', function(done) {
      var p = fixturepath + '/a',
          pristineTag = this.pristineTag;
      run('--json tag list', p, function(result) {
        assert.ok(typeof result == 'object');
        assert.ok(result[pristineTag]);
        assert.ok(result[pristineTag].some(function(v) {
          return v == p;
        }));
        done();
      });
    });

    it('-#tag - Remove a tag from the current directory (cwd)', function(done) {
      var p = fixturepath + '/a',
          tag = this.pristineTag;
      // -#foo
      // tag rm foo
      run('--json -#' + tag, p, function(result) {
        assert.deepEqual(result, { op: 'rm', tag: tag, path: p });
        run('--json tag ls ' + tag, p, function(result) {
          assert.ok(Array.isArray(result));
          assert.ok(!result.some(function(v) {
            return v == p;
          }));
          done();
        });
      });
    });

    it('tag rm <tag> - Alternative to -#tag', function(done) {
      var p = fixturepath + '/b',
          tag = this.pristineTag;
      run('--json tag rm ' + tag, p, function(result) {
        assert.deepEqual(result, { op: 'rm', tag: tag, path: p });
        done();
      });
    });

  });


  it('+#tag - Add a tag to the current directory (cwd)', function(done) {
    var p = fixturepath + '/a',
        tag = Math.random().toString(36).substring(2);
    run('--json +#' + tag, p, function(result) {
      // get the answer
      run('--json tag ls ' + tag, p, function(result) {
        assert.ok(Array.isArray(result));
        assert.ok(result.some(function(v) {
          return v == p;
        }));
        done();
      });
    });
  });

  it('tag add <tag> - Alternative to +#tag (cwd)', function(done) {
    var p = fixturepath + '/b',
        tag = Math.random().toString(36).substring(2);
    run('--json tag add ' + tag, p, function(result) {
      // get the answer
      run('--json tag ls ' + tag, p, function(result) {
        assert.ok(Array.isArray(result));
        assert.ok(result.some(function(v) {
          return v == p;
        }));
        done();
      });
    });
  });

  describe('add and remove tag to multiple dirs', function() {

    before(function() {
      this.dirs = [
        fixturepath + '/a',
        fixturepath + '/b',
        fixturepath + '/c'
      ];
      this.pristineTag = Math.random().toString(36).substring(2);
    });

    it('+#tag <p1> <p2> ...    Add a tag to <path>', function(done) {
      var self = this,
          p = fixturepath + '/a';
      run('--json +#' + this.pristineTag + ' ' + this.dirs.join(' '), p, function(result) {
        // get the answer
        run('--json tag ls ' + self.pristineTag, p, function(result) {

          assert.ok(Array.isArray(result));
          assert.ok(result.length == 3);
          assert.ok(self.dirs.every(function(v) {
            return result.indexOf(v) > -1;
          }));
          done();
        });
      });
    });

    it('tag add <t> <p1> <p2> ... Alternative to +#tag <path>', function(done) {
      var self = this,
          p = fixturepath + '/a';
      run('--json tag add ' + this.pristineTag + ' ' + this.dirs.join(' '), p, function(result) {
        // get the answer
        run('--json tag ls ' + self.pristineTag, p, function(result) {
          assert.ok(Array.isArray(result));
          assert.ok(result.length == 3);
          assert.ok(self.dirs.every(function(v) {
            return result.indexOf(v) > -1;
          }));
          done();
        });
      });
    });

    //     -#tag <path>    Remove a tag from <path>
    //     tag rm <t> <p>  Alternative to -#tag <path>
    // TODO

    // gr -#foo path1 path2 path3
    // TODO

  });

});
