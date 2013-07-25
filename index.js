var path = require('path'),
    List = require('./lib/list.js'),
    exec = require('./lib/run.js'),
    style = require('./lib/style.js');

function Gr() {
  this.list = new List();
}

Gr.prototype.add = function(path) {
  this.list.add(path);
};

Gr.prototype.run = function(task) {
  var tasks = [];
  this.list.files.forEach(function(file) {
   var cwd = path.dirname(file.name);
    tasks.push(function(onDone) {
      console.log(style('\nin ' +path.dirname(cwd) + path.sep, 'gray') + style(path.basename(cwd), 'white') + '\n');
      // console.log('\nin '+cwd+'\n');
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
};

Gr.prototype.files = function() {
  return this.list.files;
};

module.exports = Gr;
