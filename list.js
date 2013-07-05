var fs = require('fs'),
    path = require('path');

function List() {
  this.files = [];
}

List.prototype.add = function(filepath){
  if(!filepath) return this;
  var self = this,
      paths = (Array.isArray(filepath) ? filepath : [ filepath ]);

  paths.forEach(function(p) {
    var stat;
    p = path.normalize(p); // for windows
    try {
      stat = fs.lstatSync(p);
    } catch(e) {
      // ENOENT can occur when stat'ing a symlink to a nonexistent location
      // we want to traverse symlinks in general but ignore these issues
      if(e.code != 'ENOENT') {
        throw e;
      } else {
        return;
      }
    }

    if (stat.isDirectory() && !stat.isSymbolicLink() && path.basename(p) != '.git') {
      p += (p[p.length-1] !== path.sep ? path.sep : '');

      var items = fs.readdirSync(p);

      var gitpath = items.filter(function(path) {
        return path == '.git';
      });

      if(gitpath.length > 0) {
        return self.add( gitpath.map(function (f) {
          return p + f;
        }));
      } else {
        return self.add( items.filter(function(path) {
          return path.charAt(0) != '.';
        }).map(function (f) {
          return p + f;
        }));
      }

    }

    if(path.basename(p) == '.git') {
      self.files.push({ name: p, stat: stat });
    }
  });
  // sort on each add
  self.files.sort(function(a, b) { return a.name.localeCompare(b.name); });
  return this;
};

module.exports = List;
