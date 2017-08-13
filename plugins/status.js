/**
 * The status plugin shows status information for each repository.
 */
var fs = require('fs'),
    path = require('path'),
    style = require('../lib/style.js'),
    run = require('../lib/run.js'),
    commandRequirements = require('../lib/command-requirements.js');

var exec = require('child_process').exec;

module.exports = function(req, res, next) {
  var cwd = req.path,
      tags,
      dirname = path.dirname(cwd).replace(req.gr.homePath, '~') + path.sep,
      repos = (req.gr.directories ? req.gr.directories : []),
      pathMaxLen = repos.reduce(function(prev, current) {
        return Math.max(prev, current.replace(req.gr.homePath, '~').length + 2);
      }, 0);

  function pad(s, len) {
    return (s.toString().length < len ?
      new Array(len - s.toString().length).join(' ') : '');
  }

  // force human format, makes commandRequirements print out when skipping
  if (!commandRequirements.git({ format: 'json', path: cwd })) {

    console.log(
      style(dirname, 'gray') +
      style(path.basename(cwd), 'white') +
      pad(dirname + path.basename(cwd), pathMaxLen) + ' ' +
      style('Missing .git directory', 'red')
    );
    return req.done();
  }

  // search for matching tags
  tags = req.gr.getTagsByPath(cwd);

  if (req.argv.length > 0 && req.argv.includes('-v')) {
    console.log(
      style('\nin ' + dirname, 'gray') +
      style(path.basename(cwd), 'white') + '\n'
      );

    run(['git', '-c', 'color.status=always', 'status', '-sb'], cwd, req.done);
  } else {
    var task = exec('git status --branch --porcelain ', {
        cwd: cwd,
        maxBuffer: 1024 * 1024 // 1Mb
      }, function(err, stdout, stderr) {
        var lines = stdout.split('\n').filter(function(line) {
          return !!line.trim();
        });

        //remove the branch info so it isn't counted as a change
        var branchInfo = lines.shift();

        // parse
        var behind = (branchInfo || '').match(/(\[.+\])/g) || '',
            modified = (lines.length > 0 ?
              lines.length + ' modified' :
              'Clean'
            );

        var branchName = branchInfo.slice(3).split('...', 1)[0],
            pname = path.basename(cwd),
            printed;

        printed = style(dirname, 'gray') +
          style(pname, 'white') + pad(dirname + pname, pathMaxLen) + ' ' +
          branchName + pad(branchName, 15) + ' ' +
          style(modified, (lines.length > 0 ? 'red' : 'green')) + pad(modified, 14) +
          behind + pad(behind, 14);
        if (req.argv.length === 0 || !req.argv.includes('-q')) {
          printed += tags.map(function(s) { return '@' + s; }).join(' ');
        }
        console.log(printed);
        if (err !== null) {
          console.log('exec error: ' + err);
          if (stderr) {
            console.log('stderr: ' + stderr);
          }
        }
        req.done();
      });
  }
};
