var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    path = require('path'),
    style = require('./style.js');

module.exports = function(line, cwd, onDone) {
  var parts = (Array.isArray(line) ? line : line.split(' ')),
      task;

  task = spawn(process.env.SHELL || '/bin/bash', ['-l', '-O', 'expand_aliases', '-c', parts.join(' ')], {
    cwd: cwd,
    stdio: ['ignore', process.stdout, process.stderr]
  });

  function onClose(code) {
    if (code !== 0) {
      console.log('');
      console.log('spawn-task: "' + parts.join(' ') + '" exited with nonzero exit code: ' + code);
      // task.emit('error', new Error('Child process exited with nonzero exit code: '+ code));
    }
  }
  task.once('error', function(err) {
    if (err.code === 'ENOENT') {
      console.log('ENOENT error executing the command "' + parts.join(' ') +'" in ' + cwd + '. Please make sure you have installed an executable named "' + parts[0] + '" in $PATH.');
    } else {
      throw err;
    }
  });

  // Node <= 0.8x
  task.once('exit', onClose);
  // Node >= 0.10.x
  task.once('close', onDone);
};
