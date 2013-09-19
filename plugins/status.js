var log = require('minilog')('gr-status'),
    path = require('path'),
    style = require('../lib/style.js'),
    exec = require('../lib/run.js');

module.exports = function(req, res, next) {
  var cwd = process.cwd(),
      task = 'git -c color.status=always status -sb';

  console.log(style('\nin ' +path.dirname(cwd) + path.sep, 'gray') + style(path.basename(cwd), 'white') + '\n');
  exec(task, cwd, req.done);
};
