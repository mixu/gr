var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    path = require('path'),
    style = require('./style.js');

module.exports = function(line, cwd, onDone) {
  /*
  var task = exec(line, {
      cwd: cwd,
      maxBuffer: 1024*1024 // 1Mb
    }, function (err, stdout, stderr) {
      console.log(style('in ' +path.dirname(cwd) + path.sep, 'gray') + style(path.basename(cwd), 'white') + '\n');
      console.log(stdout.split('\n').map(function(line) {
        return '  '+line;
      }).join('\n'));
      if(stderr) {
        console.log('stderr: ' + stderr);
      }
      if (err !== null) {
        console.log('exec error: ' + err);
      }
    });
  */
  var parts = line.split(' '),
      task = spawn(parts[0], parts.slice(1), {
        cwd: cwd,
        stdio: ['ignore', process.stdout, process.stderr]
      });

  task.on('exit', function(code) {
    if(code != 0) {
      console.log('');
      console.log('spawn-task: "' +line+ '" exited with nonzero exit code: '+ code);
      // task.emit('error', new Error('Child process exited with nonzero exit code: '+ code));
    }
  });

  task.once('close', onDone);
};
