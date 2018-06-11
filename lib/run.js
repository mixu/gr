var spawn = require('child_process').spawn,
    spawnSync = require('child_process').spawnSync,
    exec = require('child_process').exec,
    path = require('path'),
    style = require('./style.js');

module.exports = function(line, cwd, onDone, interactive) {
  var parts = (Array.isArray(line) ? line : line.split(' ')),
      task;

  function onClose(code) {
    if (code !== 0) {
      console.log('');
      console.log('spawn-task: "' + parts.join(' ') + '" exited with nonzero exit code: ' + code);
      // task.emit('error', new Error('Child process exited with nonzero exit code: '+ code));
    }
  }

  if (interactive) {
    task = spawnSync(parts[0], parts.slice(1), {
      cwd: cwd,
      stdio: 'inherit'
    });

    onClose(task.status);
    onDone();
  }
  else {
    task = spawn(parts[0], parts.slice(1), {
      cwd: cwd,
      stdio: ['ignore', process.stdout, process.stderr]
    });

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
  }
};
