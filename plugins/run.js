module.exports = function(req, res, next) {

  // determine the right task
  var task = argv['_'] || [];
  task = task.join(' ');

  // for "git" tasks, add the color option

  /*
  if(parts[0] == 'git') {
    parts.splice(1, 0, '-c color.ui=always');
  }
  */
};
