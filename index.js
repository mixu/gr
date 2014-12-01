var fs = require('fs'),
    path = require('path'),
    style = require('./lib/style.js'),
    Config = require('./lib/config.js'),
    log = require('minilog')('gr');

var filterRegex = require('./lib/list-tasks/filter-regex.js');

function Gr() {
  this.homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  this.config = new Config(this.homePath + '/.grconfig.json');
  this.stack = [];
  this.format = 'human';
  this.directories = [];
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

  filterRegex(this.directories, excludeList);
};

Gr.prototype.preprocess = function(argv) {
  var self = this,
      isExpandable,
      index = 0,
      first;
  do {
    isExpandable = false;
    if (!argv[index]) {
      break;
    }
    first = argv[index].substr(0, 2);
    switch (first) {
      case '+@':
      case '+#':
        argv.splice(index, 1, 'tag', 'add', argv[index].substr(2));
        isExpandable = true;
        index++;
        break;
      case '-@':
      case '-#':
        argv.splice(index, 1, 'tag', 'rm', argv[index].substr(2));
        isExpandable = true;
        index++;
        break;
      case '-t':
        // replace -t foo with @foo
        if (argv[index].length == 2) {
          argv.splice(index, 2, '@' + argv[index + 1]);
          isExpandable = true;
          index += 2;
        }
        break;
      case '--':
        // ignore strings starting with -- but not --
        if (argv[index].length > 2) {
          isExpandable = true;
          index++;
        } else {
          isExpandable = false;
          index++;
        }
        break;
    }
  } while (isExpandable && index < argv.length);
  return argv;
};

Gr.prototype.parseTargets = function(argv) {
  var self = this,
      isTarget,
      processed = 0,
      targetPath,
      first;

  function pushDir(path) {
    self.directories.push(path);
  }

  do {
    isTarget = false;
    if (!argv[0]) {
      break;
    }
    first = argv[0].charAt(0);
    switch (first) {
      case '@':
      case '#':
        // @tags
        var key = 'tags.' + argv[0].substr(1),
            value = this.config.get(key);

        if (typeof value !== 'undefined') {
          (Array.isArray(value) ? value : [value]).forEach(pushDir);
        } else if (this.format == 'human') {
          log.error('Tag ' + argv[0] + ' is not associated with any paths.');
        }
        processed++;
        isTarget = true;
        argv.shift();
        break;
      case '~':
      case '/':
      case '.':
        // paths
        targetPath = path.resolve(process.cwd(), argv[0]);
        if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
          this.directories.push(targetPath);
          processed++;
          isTarget = true;
          argv.shift();
        }
        break;
      default:
        if (argv[0] == '--json') {
          argv.shift();
          this.format = 'json';
          isTarget = true;
          processed++;
        } else if (argv[0] == '--') {
          isTarget = false;
          processed++;
        }
        break;
    }
  } while (isTarget && argv.length > 0);

  if (processed === 0) {
    // default to using all paths
    this.addAll();
  }

  // unique, non-empty only
  this.dirUnique();
  // apply exclusions
  this.exclude([].concat(this.config.get('exclude'), argv['exclude']));
  delete argv['exclude'];

  // return the remaining argv
  return argv;
};

// add middleware
Gr.prototype.use = function(route, fn) {
  if (typeof route === 'function') {
    this.stack.push({ route: '', handle: route });
  } else {
    this.stack.push({ route: (Array.isArray(route) ? route : [route]), handle: fn });
  }
};

// queue and execute a set of tasks (serially)
Gr.prototype.exec = function(argv, exit) {
  var self = this,
      tasks = [];

  // if no paths, just push one task
  if (this.directories.length === 0) {
    tasks.push(function(onDone) {
      self.handle('', argv, onDone, exit);
    });
  } else {
    this.directories.forEach(function(cwd) {
      tasks.push(function(onDone) {
        self.handle(cwd, argv, onDone, exit);
      });
    });
  }

  function series(task) {
    if (task) {
      task(function(result) {
        return series(tasks.shift());
      });
    } else {
      if (typeof exit === 'function') {
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
      log.info('No command matched:', argv);
      // if the list is empty, warn
      if (self.directories.length === 0 && self.format == 'human') {
        log.warn('No target paths matched. Perhaps no paths are associated with the tag you used?');
      }
      return;
    }
    isMatch = (layer.route === '');
    // skip this layer if the route doesn't match.
    if (!isMatch) {
      parts = layer.route;
      isMatch = parts.every(function(part, i) {
        return argv[i] == part;
      });
      rest = argv.slice(layer.route.length ? layer.route.length : 1);
    } else {
      rest = argv;
    }
    if (!isMatch) {
      return next(err);
    }

    // log.info('Matched', layer.route);

    // Call the layer handler
    // Trim off the part of the url that matches the route
    var req = {
      gr: self,
      config: self.config,
      argv: rest,
      path: path,
      format: self.format,
      done: done,
      exit: exit
    };

    layer.handle(req, process.stdout, next);
  }

  next();
};

Gr.prototype.getTagsByPath = function(cwd) {
  var self = this,
      tags = [];
  if (!cwd || !this.config || !this.config.items || !this.config.items.tags) {
    return tags;
  }
  Object.keys(this.config.items.tags).forEach(function(tag) {
    if (Array.isArray(self.config.items.tags[tag]) &&
       self.config.items.tags[tag].indexOf(cwd) > -1) {
      tags.push(tag);
    }
  });
  return tags;
};

Gr.prototype.addAll = function() {
  var self = this;
  if (this.config && this.config.items && this.config.items.tags) {
    Object.keys(this.config.items.tags).forEach(function(tag) {
      if (Array.isArray(self.config.items.tags[tag])) {
        self.config.items.tags[tag].forEach(function(dirname) {
          self.directories.push(dirname);
        });
      }
    });
  }
};

Gr.prototype.dirUnique = function() {
  var last;
  this.directories = this.directories.filter(function(k) {
                    return !!k;
                  })
                  .sort()
                  .filter(function(key) {
                    var isDuplicate = (key == last);
                    last = key;
                    return !isDuplicate;
                  });
};

module.exports = Gr;
