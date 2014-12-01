var fs = require('fs'),
    path = require('path');

function find(directories, dirpath, baseNameList) {
  if (!dirpath) return [];
  var p = path.normalize(dirpath), // for windows
      stat,
      basename = path.basename(p),
      isMatch = baseNameList.some(function(name) {
        return basename == name;
      });

  try {
    stat = fs.statSync(p);
  } catch (e) {
    // ENOENT can occur when stat'ing a symlink to a nonexistent location
    // we want to traverse symlinks in general but ignore these issues
    if (e.code != 'ENOENT') {
      throw e;
    } else {
      return;
    }
  }
  // only directories are considered
  if (!stat.isDirectory()) {
    return;
  }
  // console.log(p);
  // append trailing slash
  p += (p[p.length - 1] !== path.sep ? path.sep : '');

  // is this a .git | .hg directory?
  if (isMatch &&
    stat.isDirectory()) {
    // go no further
    directories.push(p);
    return;
  }
  // else, readdir
  var items = fs.readdirSync(p);
  // is any of the items a potential match?
  isMatch = items.some(function(basename) {
    return baseNameList.some(function(name) {
      // must be .git | .hg dir
      var result = (basename == name && fs.statSync(p + basename).isDirectory());
      if (result) {
        // console.log(p + basename);
        directories.push(p + basename);
      }
      return result;
    });
  });
  // is a direct subdir a match?
  if (isMatch) {
    // go no further
    return;
  }
  // else, we must iterate into any directories
  items.filter(function(path) {
      // avoid recursing into directories that start with `.`
      return path.charAt(0) != '.';
    }).map(function(f) {
      return find(directories, p + f, baseNameList);
    }).forEach(function(i) {
      if (!!i) {
        directories.push(i);
      }
    });
  return;
}

module.exports = function(dirpath, baseNameList) {
  var directories = [];
  find(directories, dirpath, baseNameList);
  return directories;
};
