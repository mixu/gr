var fs = require('fs'),
    path = require('path'),
    List = require('./lib/list.js'),
    style = require('./lib/style.js'),
    Config = require('./lib/config.js'),
    parse = require('./lib/argparse.js'),
    log = require('minilog')('gr');

var filterRegex = require('./lib/list-tasks/filter-regex.js');

function Gr() {
  this.list = new List();
  this.homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  this.config = new Config(this.homePath+'/.grconfig.json');
  this.stack = [];
}

Gr.prototype.exclude = function(arr) {
  var self = this;
  // apply filter paths
  var excludeList = arr.filter(function(item) {
    return !!item;
  }).map(function(expr) {
    expr = expr.replace('~', self.homePath);
    return new RegExp(expr);
  });

  filterRegex(this.list, excludeList);
};

Gr.prototype.preprocess = function(argv) {
  var self = this,
      isExpandable,
      index = 0,
      first;
  do {
    isExpandable = false;
    first = argv[index].substr(0, 2);
    switch(first) {
      case '+#':
        argv.splice(index, 1, 'tag', 'add', argv[index].substr(2));
        isExpandable = true;
        index++;
        break;
      case '-#':
        argv.splice(index, 1, 'tag', 'rm', argv[index].substr(2));
        isExpandable = true;
        index++;
        break;
    }
  } while(isExpandable && index < argv.length);
  return argv;
};

Gr.prototype.parseTargets = function(argv) {
  var self = this,
      isTarget,
      processed = 0,
      targetPath,
      first;
  do {
    isTarget = false;
    first = argv[0].charAt(0);
    if(first == '#') {
      // #tags
      var key = 'tags.'+argv[0].substr(1),
          value = this.config.get(key);

      if(typeof value !== 'undefined') {
        (Array.isArray(value) ? value : [ value]).forEach(function(path) {
          self.list.add(path);
        });
      }
      processed++;
      isTarget = true;
      argv.shift();
    } else if(first == '~' || first == '/' || first == '.') {
      // paths
      targetPath = path.resolve(argv[0], process.cwd());
      if(fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
        this.list.add(targetPath);
        processed++;
        isTarget = true;
        argv.shift();
      }
    }
  } while(isTarget && argv.length > 0);

  if(processed == 0) {
    // use default setting from config
    var repos = {};
    // if the default setting is "scan", then scan
    this.list.add(this.homePath);
    // save the scanned repo list
    this.list.files.forEach(function(file) {
      repos[file.name] = {};
    });
    this.config.items.repos = repos;
    this.config.save();

  }

  // apply exclusions
  this.exclude([].concat(this.config.get('exclude'), argv['exclude']));
  delete argv['exclude'];

  // if the list is empty, warn
  if(this.list.files.length == 0) {
    log.warn('No target paths matched. Perhaps no paths are associated with the tag you used?');
    log.warn('Running `gr tag list` for you...');
    this.list.add(process.cwd());
    argv = ['tag', 'list'];
  }

  // return the remaining argv
  return argv;
};

// add middleware
Gr.prototype.use = function(route, fn) {
  if (typeof route === 'function') {
    this.stack.push({ route: '', handle: route });
  } else {
    this.stack.push({ route: route, handle: fn });
  }
};

// queue and execute a set of tasks (serially)
Gr.prototype.exec = function(argv, exit) {
  var self = this,
      tasks = [];
  this.list.files.forEach(function(file) {
   var cwd = path.dirname(file.name);
    tasks.push(function(onDone) {
      self.handle(cwd, argv, onDone, exit);
    });
  });

  function series(task) {
    if(task) {
      task(function(result) {
        return series(tasks.shift());
      });
    } else {
      if(typeof exit === 'function') {
        exit();
      }
    }
  }
  series(tasks.shift());
};

// handle a single route resolution
Gr.prototype.handle = function(path, argv, done, exit) {
  var stack = this.stack,
      index = 0,
      self = this;

  function next(err) {
    var layer, isMatch, rest;
    // next callback
    layer = stack[index++];
    // all done
    if (!layer) {
      return;
    }
    isMatch = (layer.route === '');
    // skip this layer if the route doesn't match.
    if(!isMatch) {
      parts = (Array.isArray(layer.route) ? layer.route : [ layer.route ] );
      isMatch = parts.every(function(part, i) {
        return argv[i] == part;
      });
      rest = argv.slice(layer.route.length ? layer.route.length : 1 );
    } else {
      rest = argv;
    }
    if (!isMatch) {
      return next(err);
    }

    // Call the layer handler
    // Trim off the part of the url that matches the route
    var req = {
      gr: self,
      config: self.config,
      argv: rest,
      path: path,
      done: done,
      exit: exit
    };

    layer.handle(req, process.stdout, next);
  }

  next();
};

module.exports = Gr;
