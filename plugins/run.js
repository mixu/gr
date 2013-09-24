var log = require('minilog')('gr-run'),
    path = require('path'),
    style = require('../lib/style.js'),
    run = require('../lib/run.js');

module.exports = function(req, res, next) {
  // if argv is empty, skip
  if(req.argv.length == 0) {
    return next();
  }

  // assume that the rest of the argvs are the command
  var task = req.argv,
      dirname = path.dirname(req.path).replace(req.gr.homePath, '~') + path.sep;

  if(task[0] == '--') {
    task.shift();
  }

  if(task[0] == 'git') {
    // for "git" tasks, add the color option
    parts.splice(1, 0, '-c color.ui=always');
  }
  if(req.format == 'human') {
    console.log(
      style('\nin ' + dirname, 'gray') +
      style(path.basename(req.path), 'white') + '\n'
      );
  }
  run(task.join(' '), req.path, req.done);
};
