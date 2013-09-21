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
          console.error('Cannot parse', stdout);
          return onDone();
        }
        onDone(json);
      });
}

exports['gr'] = {

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

  'can tag a new directory': function(done) {
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
  'can execute a command accross multiple directories using a tag': function(done) {
    var p = fixturepath+'/a';
    // #foo ls -lah
    run('--json -t foo ls -lah', p, function(result) {
      console.log(result);
      done();
    });
  },

  'can list all directories by tag': function(done) {
    var p = fixturepath+'/a';
    // #foo
    // tag foo
    run('--json -t foo', p, function(result) {
      console.log(result);
      done();
    });
  },

  'can list all tags': function(done) {
    var p = fixturepath+'/a';
    run('--json tag list', p, function(result) {
      console.log(result);
      done();
    });
  },

  'can untag a directory': function() {
    var p = fixturepath+'/a';
    // -#foo
    // tag rm foo
    run('--json -#foo', p, function(result) {
      console.log(result);
      p = fixturepath + '/b';
      run('--json tag rm bar', p, function(result) {
        console.log(result);
        done();
      });
    });
  },

/*
  'can execute a command accross multiple directories using a smart target': function() {

  },

  'can ignore a directory via configuration': function() {

  },

  'can add a directory via configuration': function() {

  },

  'can add a root directory for scanning via configuration': function() {

  },

  'executing bootstrap queues the right commands': function() {

  },

  '--confirm applies xargs -p to the command': function() {

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
