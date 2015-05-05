var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    path = require('path'),
    style = require('./style.js');

module.exports = function(line, cwd, onDone) {
  var parts = (Array.isArray(line) ? line : line.split(' ')),
      task;

  task = spawn('/bin/bash', ['-l', '-O', 'expand_aliases', '-c', parts.join(' ')], {
    cwd: cwd,
    stdio: ['ignore', process.stdout, process.stderr]
  });

  task.on('exit', function(code) {
    if (code !== 0) {
      console.log('');
      console.log('spawn-task: "' + parts.join(' ') + '" exited with nonzero exit code: ' + code);
      // task.emit('error', new Error('Child process exited with nonzero exit code: '+ code));
    }
  });

  task.once('close', onDone);
};
