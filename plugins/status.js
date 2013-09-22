var log = require('minilog')('gr-status'),
    path = require('path'),
    style = require('../lib/style.js'),
    run = require('../lib/run.js');

var exec = require('child_process').exec

module.exports = function(req, res, next) {
  var cwd = req.path,
      tags,
      dirname = path.dirname(cwd).replace(req.gr.homePath, '~') + path.sep,
      pathMaxLen = Object.keys(req.config.items.repos).reduce(function(prev, current) {
        return Math.max(prev, current.replace(req.gr.homePath, '~').length + 2);
      }, 0);

  function pad(s, len) {
    return (s.toString().length < len ?
      new Array(len - s.toString().length).join(' ') : '');
  }

  // search for matching tags
  tags = req.gr.getTagsByPath(cwd);

  if(req.argv.length > 0 && req.argv[0] == '--direct') {
    console.log(
      style('\nin ' + dirname, 'gray') +
      style(path.basename(cwd), 'white') + '\n'
      );
    run('git -c color.status=always status -sb', cwd, req.done);
  } else {
    var task = exec('git status --porcelain ', {
        cwd: cwd,
        maxBuffer: 1024*1024 // 1Mb
      }, function (err, stdout, stderr) {
        var lines = stdout.split('\n').filter(function(line) {
          return !!line.trim();
        });
        // to find out behind/ahead:
        // git -c color.ui=false status --short --branch
        exec('git -c color.ui=false status --short --branch', {
            cwd: cwd,
            maxBuffer: 1024*1024 // 1Mb
          }, function (err, stdout, stderr) {
          // parse
          var behind = stdout.match(/(\[.+\])/g) || '',
              modified = (lines.length > 0 ?
                lines.length + ' modified' :
                'Clean'
              );
          console.log(
            style(dirname, 'gray') +
            style(path.basename(cwd), 'white') + pad(cwd, pathMaxLen) +' ' +
            style(modified, (lines.length > 0 ? 'red' : 'green')) + pad(modified, 14) +
            behind + pad(behind, 14) +
            tags.map(function(s) { return '#' + s; }).join(' ')
          );
          if (err !== null) {
            console.log('exec error: ' + err);
            if(stderr) {
              console.log('stderr: ' + stderr);
            }
          }
          req.done();
        });
      });
  }
};
