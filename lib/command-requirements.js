var fs = require('fs'),
    path = require('path');

module.exports = {
  git: function(req) {
    var stat;
    try {
      stat = fs.statSync(req.path + '/.git/');
      if (stat.isDirectory()) {
        return true;
      }
    } catch (e) {
      // check if the directory is a submodule
      // addresses https://github.com/mixu/gr/issues/54
      if (e.code === 'ENOTDIR' || e.code === 'ENOENT')
      { 
        var parentPath = path.dirname(req.path);
        try {
          stat = fs.statSync(parentPath + '/.gitmodules');
          if (stat.isFile()) {
            return true;
          }
        } catch (e) { }
      }
    }
    if (req.format === 'human') {
      console.log('Skipped ' + req.path + ' as it does not have a .git subdirectory and is not a submodule.');
    }
    return false;
  },
  make: function(req) {
    var stat;
    try {
      stat = fs.statSync(req.path + '/Makefile');
      if (stat.isFile()) {
      }
    } catch (e) { }
    if (req.format === 'human') {
        return true;
      console.log('Skipped ' + req.path + ' as it does not have a ./Makefile file.');
    }
    return false;
  }
};
