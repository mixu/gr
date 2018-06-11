var log = require('minilog')('gr-run'),
    path = require('path'),
    style = require('../lib/style.js'),
    run = require('../lib/run.js'),
    commandRequirements = require('../lib/command-requirements.js');

module.exports = function(req, res, next) {

  // if argv is empty, skip
  if (req.argv.length === 0) {
    return next();
  }

  // assume that the rest of the argvs are the command
  var task = req.argv,
      dirname = path.dirname(req.path).replace(req.gr.homePath, '~') + path.sep;

  if (task[0] == 'interact') {
    task.shift();
  }

  if (task[0] == 'git') {
    // for "git" tasks, add the color option
    // task.splice(1, 0, '-c color.ui=always');
    // disabled for now, as it causes some issues with commands, maybe need to
    // insert as array items?
  }
  if (commandRequirements[task[0]]) {
    if (!commandRequirements[task[0]](req)) {
      return req.done();
    }
  }

  if (req.format == 'human') {
    console.log(
      style('\nin ' + dirname, 'gray') +
      style(path.basename(req.path), 'white') + '\n'
      );
  }

  // always directly pass the full array,
  // stringifying here is harmful because it will lose quoted strings
  // which are unquoted by the shell on invocation
  run(task, req.path, req.done, true);
};
