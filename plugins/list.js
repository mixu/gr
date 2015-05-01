/**
 * The list plugin just lists all repository directories.
 * Missing directories are included, marked in red.
 */
var fs = require('fs'),
    path = require('path'),
    style = require('../lib/style.js');

module.exports = function(req, res, next) {
  req.gr.addAll();
  req.gr.dirUnique();
  req.gr.directories.forEach(function(dir) {
    var cwd = dir.replace(new RegExp('^' + req.gr.homePath + '/'), '~/');
    console.log(
      style(path.dirname(cwd) + path.sep, 'gray') +
      style(path.basename(cwd), fs.existsSync(dir) ? 'white' : 'red')
    );
  });

  req.exit();
};
