var fs = require('fs');

module.exports = {
  git: function(req) {
    var stat;
    try {
      stat = fs.statSync(req.path + '/.git/');
      if (stat.isDirectory()) {
        return true;
      }
    } catch (e) { }
    if (req.format === 'human') {
      console.log('Skipped ' + req.path + ' as it does not have a .git subdirectory.');
    }
    return false;
  },
  make: function(req) {
    var stat;
    try {
      stat = fs.statSync(req.path + '/Makefile');
      if (stat.isFile()) {
        return true;
      }
    } catch (e) { }
    if (req.format === 'human') {
      console.log('Skipped ' + req.path + ' as it does not have a ./Makefile file.');
    }
    return false;
  }
};
