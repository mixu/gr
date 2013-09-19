var path = require('path'),
    List = require('./lib/list.js'),
    style = require('./lib/style.js'),
    Config = require('./lib/config.js'),
    parse = require('./lib/argparse.js');

var filterRegex = require('./lib/list-tasks/filter-regex.js');

var homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

function Gr() {
  this.list = new List();
  this.config = new Config(homePath+'/.grconfig.json');
  this.stack = [];
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

Gr.prototype.files = function() {
  return this.list.files;
};

Gr.prototype.use = function(route, fn) {
  this.stack.push({ route: route, handle: fn });
};

Gr.prototype.exec = function() {
  var tasks = [];
  this.list.files.forEach(function(file) {
   var cwd = path.dirname(file.name);
    tasks.push(function(onDone) {
      console.log('\nin '+cwd+'\n');
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

Gr.prototype.handle = function(argv, done) {
  var stack = this.stack,
      index = 0,
      self = this;

  function next(err) {
    var layer;
    // next callback
    layer = stack[index++];
    // all done
    if (!layer) {

      return;
    }
    // skip this layer if the route doesn't match.
    var isMatch = (Array.isArray(layer.route) ? layer.route : [ layer.route ] ).every(function(part, i) {
      return argv[i] == part;
    });
    if (!isMatch) {
      return next(err);
    }

    // Call the layer handler
    // Trim off the part of the url that matches the route
    var req = {
      argv: argv.slice(layer.route.length ? layer.route.length : 1 ),
      config: self.config,
      done: done
    };

    layer.handle(req, process.stdout, next);
  }

  next();
  console.log(argv);
};

module.exports = Gr;
