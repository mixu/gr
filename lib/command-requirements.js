var fs = require('fs'),
    path = require('path'),
    execSync = require('child_process').execSync;

module.exports = {
  git: function(req) {
    try {
      execSync('git rev-parse --is-inside-git-dir', {
        cwd: req.path,
        stdio: 'ignore'
      });
    } catch (e) {
      if (req.format === 'human') {
        console.log('Skipped ' + req.path + ' as it does not have a .git subdirectory and is not a submodule.');
      }
      return false;
    }
    return true;
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
