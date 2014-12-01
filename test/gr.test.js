var assert = require('assert'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

var binpath = path.normalize(__dirname + '/../bin/gr'),
    fixturepath = path.normalize(__dirname + '/fixtures');

function run(args, cwd, onDone) {
  exec(binpath +' ' + args, {
        cwd: cwd,
        maxBuffer: 1024*1024 // 1Mb
      }, function (err, stdout, stderr) {
        var json;
        if(stderr) {
          console.log('stderr: ' + stderr);
        }
        if (err !== null) {
          throw err;
        }
        try {
          json = JSON.parse(stdout);
        } catch(e) {
          // console.error('Cannot parse', stdout);
          return onDone(stdout);
        }
        onDone(json);
      });
}

var backup,
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    confFile = homePath+'/.grconfig.json';

describe('gr integration tests', function() {

  before(function() {
    // backup
    if(fs.existsSync(confFile)) {
      backup = fs.readFileSync(confFile);
    }
  });

  after(function() {
    // restore
    if(backup) {
      fs.writeFileSync(confFile, backup);
    }
  });

  // Tagging:
  describe('pristine - ', function() {

    beforeEach(function(done) {
      // add a new random tag
      this.pristineTag = Math.random().toString(36).substring(2);
      run('--json +#'+this.pristineTag, fixturepath+'/a', function(result) {
        done();
      });
    });

    it('#tag - List directories associated with "tag"', function(done) {
      var p = fixturepath+'/a';
      // #foo
      run('--json -t '+this.pristineTag, p, function(result) {
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
      run('-t '+this.pristineTag+' ls -lah', fixturepath+'/a', function(result) {
        // check that one of the lines contains "a.txt"
        assert.ok(/a\.txt/.test(result));
        done();
      });
    });

    it('can mix tags and paths for command execution', function(done) {
      // gr -t bar ./fixtures/b cmd
      run('-t '+this.pristineTag+' ' + fixturepath+'/b'+' ls -lah', fixturepath+'/a', function(result) {
        // check that one of the lines contains "a.txt" (via the tag)
        assert.ok(/a\.txt/.test(result));
        // check that one of the lines contains "b.txt" (via the path)
        assert.ok(/b\.txt/.test(result));
        done();
      });
    });

    it('tag list - List all tags (default action)', function(done) {
      var p = fixturepath+'/a',
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
      var p = fixturepath+'/a',
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

  xdescribe('can set the command explicitly using --', function() {
    xit('gr #foo -- cmd');
  });

  xdescribe('a target that is not a directory is treated as a command', function() {
    xit('gr dir file.sh');
  });

  xdescribe('if no target is given, then all tagged paths are used', function() {});

  it('+#tag - Add a tag to the current directory (cwd)', function(done) {
    var p = fixturepath+'/a',
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
    });

    it('+#tag <p1> <p2> ...    Add a tag to <path>', function(done) {
      var self = this,
          p = fixturepath+'/a';
      run('--json +#' + this.pristineTag + ' '+ this.dirs.join(' '), p, function(result) {
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
          p = fixturepath+'/a';
      run('--json tag add ' + this.pristineTag + ' '+ this.dirs.join(' '), p, function(result) {
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

  describe('config', function() {

    beforeEach(function() {
      this.key = 'test.' + Math.random().toString(36).substring(2);
      this.value = Math.random().toString(36).substring(2);
    });

    it('set <k> <v>   Set a config key (overwrites existing value)', function(done) {
      var key = this.key, value = this.value;
      run('--json config set ' + key + ' ' + value, fixturepath+'/a', function(result) {
        run('--json config get ' + key, fixturepath+'/a', function(result) {
          assert.equal(result, value);
          done();
        });
      });
    });

    it('add <k> <v>   Add a value to a config key (appends rather than overwriting)', function(done) {
      var key = this.key, value = this.value;
      run('--json config add ' + key + ' ' + value, fixturepath+'/a', function(result) {
        run('--json config get ' + key, fixturepath+'/a', function(result) {
          assert.ok(Array.isArray(result));
          assert.ok(result.some(function(v) { return v == value; }));
          done();
        });
      });
    });

    it('rm <k> <v>    Remove a value from a config key (if it exists)', function(done) {
      this.timeout(4000);
      var key = this.key, value = this.value, value2 = this.value + 'aa';
      run('--json config add ' + key + ' ' + value, fixturepath+'/a', function(result) {
        assert.deepEqual(result, { op: 'add', key: key, value: value, result: [ value ] });
        run('--json config add ' + key + ' ' + value2, fixturepath+'/a', function(result) {
          run('--json config rm ' + key + ' ' + value, fixturepath+'/a', function(result) {
          assert.deepEqual(result, { op: 'rm', key: key, value: value, result: [ value2 ] });
            run('--json config get ' + key, fixturepath+'/a', function(result) {
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
      run('--json config set ' + key + ' ' + value, fixturepath+'/a', function(result) {
        run('--json config list', fixturepath+'/a', function(result) {
          var parts = key.split('.');
          assert.equal(typeof result, 'object');
          assert.equal(result.test[parts[1]], value);
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
