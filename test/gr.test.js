var assert = require('assert'),
    util = require('util');

exports['gr'] = {

  '--config lists configuration': function() {
    gr.exec([ '--config' ], function(result) {

    });
  },

  '--config add foo.bar adds a configuration option': function() {
    gr.exec([ '--config', 'add', 'foo.bar', 'baz' ], function(result) {

    });
  },

  '--config name value adds a configuration option': function() {
    gr.exec([ '--config', 'abc', 'def' ], function(result) {

    });
  },

  '--config remove name value removes a configuration option': function() {
    gr.exec([ '--config', 'remove', 'abc' ], function(result) {

    });
  },

  '--list lists all known repositories': function() {
    gr.exec([ '--list' ], function(result) {

    });
  },

  'can tag a new directory': function() {
    gr.exec([ '+#foo' ], function(result) {

    });
    gr.exec([ '--tag', 'add', 'foo' ], function(result) {

    });
  },

  'can execute a command accross multiple directories using a tag': function() {
    gr.exec([ '#foo', 'bar' ], function(result) {

    });
    gr.exec([ '--tag', 'foo', 'bar' ], function(result) {

    });
  },

  'can list all directories by tag': function() {
    gr.exec([ '#foo' ], function(result) {

    });
    gr.exec([ '--tag', 'foo' ], function(result) {

    });
  },

  'can list all tags': function() {
    gr.exec([ '--tag', 'list' ], function(result) {

    });
  },

  'can untag a directory': function() {
    gr.exec([ '-#foo' ], function(result) {

    });
    gr.exec([ '--tag', 'rm', 'foo' ], function(result) {

    });
  },

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
};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stderr.on('data', function (data) { if (/^execvp\(\)/.test(data)) console.log('Failed to start child process. You need mocha: `npm install -g mocha`') });
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
