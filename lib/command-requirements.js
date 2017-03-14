var fs = require('fs'),
    path = require('path'),
    spawnSync = require('child_process').spawnSync;

module.exports = {
  git: function (req) {
    var gitCommand = spawnSync('git', ['rev-parse', '--show-prefix'], {cwd: req.path});
    if (gitCommand.stderr.toString().replace(/(\r\n|\n|\r)/gm, '').trim()) {
      if (req.format === 'human') {
        console.log('Skipped ' + req.path + ' as it is not a Git repository.');
      }
      return false;
    }
    if (gitCommand.stdout.toString().replace(/(\r\n|\n|\r)/gm, '').trim()) {
      if (req.format === 'human') {
        console.log('Skipped ' + req.path + ' as it is not the root of Git repository or submodule.');
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
