var path = require('path'),
    List = require('./list.js'),
    exec = require('./run.js');

var homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    task = 'git -c color.status=always status -sb';

if(process.argv.length > 2) {
  var parts = process.argv.slice(2);
  /*
  if(parts[0] == 'git') {
    parts.splice(1, 0, '-c color.ui=always');
  }
  */
  task = parts.join(' ');
}

var list = new List(),
    tasks = [];

list.add(homePath);

list.files.forEach(function(file) {
  var cwd = path.dirname(file.name);
  tasks.push(function(onDone) {
    console.log('\nin '+cwd+'\n');
    exec(task, cwd, onDone);
  });
});

function series(task) {
  if(task) {
    task(function(result) {
      return series(tasks.shift());
    });
  }
}
series(tasks.shift());


