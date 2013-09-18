var path = require('path'),
    List = require('./lib/list.js'),
    exec = require('./lib/run.js'),
    style = require('./lib/style.js'),
    Config = require('./lib/config.js'),
    parse = require('./lib/argparse.js');

var filterRegex = require('./lib/list-tasks/filter-regex.js');

var homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

function Gr() {
  this.list = new List();
  this.config = new Config(homePath+'/.grconfig.json');
}

Gr.prototype.add = function(path) {
  this.list.add(path);
};

Gr.prototype.exclude = function(arr) {
  // apply filter paths
  var excludeList = arr.filter(function(item) {
    return !!item;
  }).map(function(expr) {
    expr = expr.replace('~', homePath);
    return new RegExp(expr);
  });

  filterRegex(gr.list, excludeList);
}

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

Gr.prototype.exec = function(argv, done) {
  // first argument one of:
  // `config`
  // `list``
  // `tag`

  switch(argv[0]) {
    case 'config':
      require('./plugins/config.js')(argv.slice(1), this, done);
      break;
    case 'tag':
      require('./plugins/tag.js')(argv.slice(1), this, done);
      break;
    case 'list':
      break;
  }

  console.log(argv);

};

module.exports = Gr;
