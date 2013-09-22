var assert = require('assert'),
    util = require('util'),
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

exports['gr'] = {

// Tagging:

//    #tag            List directories associated with "tag"

  'can list all directories by tag': function(done) {
    var p = fixturepath+'/a';
    // #foo
    run('--json -t foo', p, function(result) {
      assert.ok(Array.isArray(result));
      assert.ok(result.some(function(v) {
        return v == p;
      }));
      done();
    });
  },

//    #tag <cmd>      Run a command in the directories associated with "tag"
//    -t <tag> <cmd>  Run a command in the directories associated with "tag"

  'can execute a command across multiple directories using a tag': function(done) {
    var p = fixturepath+'/a';
    // #foo ls -lah
    run('-t foo ls -lah', p, function(result) {
      // check that one of the lines contains "a.txt"
      assert.ok(/a\.txt/.test(result));
      done();
    });
  },

  'can mix tags and paths for command execution': function() {
    // gr #foo -t bar ~/bar/baz cmd
  },

  'can set the command explicitly using --': function() {
    // gr #foo -- cmd
  },

  'a target that is not a directory is treated as a command': function() {
    // gr dir file.sh
  },

  'if no target is given, then all tagged paths are used': function() {

  },

//     +#tag           Add a tag to the current directory
//     tag add <tag>   Alternative to +#tag

  'can tag a new directory (cwd)': function(done) {
    var p = fixturepath+'/a';
    run('--json +#foo', p, function(result) {
      // get the answer
      run('--json tag ls foo', p, function(result) {
        assert.ok(Array.isArray(result));
        assert.ok(result.some(function(v) {
          return v == p;
        }));
        p = fixturepath + '/b';
        run('--json tag add bar', p, function(result) {
          // get the answer
          run('--json tag ls bar', p, function(result) {
            assert.ok(Array.isArray(result));
            assert.ok(result.some(function(v) {
              return v == p;
            }));
            done();
          });
        });
      });
    });
  },

//    +#tag <path>    Add a tag to <path>
//    tag add <t> <p> Alternative to +#tag <path>
// TODO

// gr +#foo path1 path2 path3
// TODO

//     -#tag           Remove a tag from the current directory
//     tag rm <tag>    Alternative to -#tag

  'can untag a directory (cwd)': function(done) {
    var p = fixturepath+'/a';
    // -#foo
    // tag rm foo
    run('--json -#foo', p, function(result) {
      assert.deepEqual(result, { op: 'rm', tag: 'foo', path: p });
      run('--json tag ls foo', p, function(result) {
        assert.ok(Array.isArray(result));
        assert.ok(!result.some(function(v) {
          return v == p;
        }));
        p = fixturepath + '/b';
        run('--json tag rm bar', p, function(result) {
          assert.deepEqual(result, { op: 'rm', tag: 'bar', path: p });
          done();
        });

      });

    });
  },

//     -#tag <path>    Remove a tag from <path>
//     tag rm <t> <p>  Alternative to -#tag <path>
// TODO

// gr -#foo path1 path2 path3
// TODO

//     tag list        List all tags (default action)

  'can list all tags': function(done) {
    var p = fixturepath+'/a';
    run('--json tag list', p, function(result) {
      assert.ok(typeof result == 'object');
      assert.ok(result['foo']);
      assert.ok(result['foo'].some(function(v) {
        return v == p;
      }));
      done();
    });
  },

//     tag discover    Auto-discover git paths under ~/
// TODO


//     gr list        List all known repositories and their tags
// TODO

//     gr status    Displays the (git) status of the selected directories.
// TODO


/*
  '--config lists configuration': function() {
    gr.exec([ 'config' ], function(err, result) {

    });
  },

  '--config add foo.bar adds a configuration option': function() {
    gr.exec([ 'config', 'add', 'foo.bar', 'baz' ], function(err, result) {

    });
  },

  '--config remove name value removes a configuration option': function() {
    gr.exec([ 'config', 'remove', 'abc' ], function(err, result) {

    });
  },

  '--list lists all known repositories': function() {
    gr.exec([ 'list' ], function(err, result) {

    });
  },
*/

// MISC:
//    gr help        Show this help
//    gr version     Version info

// TODO:
// enabling / disabling plugins
//    gr bootstramp

/*
  'executing bootstrap queues the right commands': function() {

  }
*/
};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stderr.on('data', function (data) { if (/^execvp\(\)/.test(data)) console.log('Failed to start child process. You need mocha: `npm install -g mocha`') });
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
