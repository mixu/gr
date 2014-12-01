var log = require('minilog')('gr-list'),
    path = require('path'),
    style = require('../lib/style.js');

module.exports = function(req, res, next) {
  // get all the directories from the
  req.gr.addAll();
  req.gr.dirUnique();
  req.gr.directories.forEach(function(dir) {
    var cwd = dir.replace(new RegExp('^' + req.gr.homePath + '/'), '~/');
    console.log(style(path.dirname(cwd) + path.sep, 'gray') + style(path.basename(cwd), 'white'));
  });

  req.exit();
};
