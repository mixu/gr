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
      trackingRegex = /\[(?:ahead (\d+))?(?:, )?(?:behind (\d+))?\]/,
      fileStates = ['M','A','D','R','C'],
      tags,
      dirname = path.dirname(cwd).replace(req.gr.homePath, '~') + path.sep,
      repos = (req.gr.directories ? req.gr.directories : []),
      pathMaxLen = repos.reduce(function(prev, current) {
        return Math.max(prev, current.replace(req.gr.homePath, '~').length + 2);
      }, 0);

  function cloneState(lines) {
    var stage, workTree,
        i = 0,
        flags = 0; // 0b100: modified, 0b010: staged, 0b001: untracked
    // stop parsing if all flags are set (0b111)
    while (i < lines.length && lines[i].length > 1 && flags !== 7) {
      stage = lines[i].charAt(0);
      workTree = lines[i++].charAt(1);
      if (stage === 'U' || workTree === 'U') {
        return ['MERGE', 'red']; // early exit
      }
      if ((flags & 2) === 0 && fileStates.includes(stage)) {
        flags += 2;
      }
      if ((flags & 4) === 0 && fileStates.includes(workTree)) {
        flags += 4;
      }
      if ((flags & 1) === 0 && workTree === '?') {
        flags += 1;
      }
    }

    switch (flags) {
      case 0:
        return ['clean', 'green'];
      case 1:
        return ['%    ', 'green'];
      case 2:
        return ['+    ', 'red'];
      case 3:
        return ['+%   ', 'red'];
      case 4:
        return ['*    ', 'red'];
      case 5:
        return ['*%   ', 'red'];
      case 6:
        return ['+*   ', 'red'];
      case 7:
        return ['+*%  ', 'red'];
    }
  }

  function pad(s, len) {
    return (s.toString().length < len ?
      new Array(len - s.toString().length).join(' ') : '');
  }

  function remoteInfo(porcelain) {
    var display = 'u',
        parsed;
    if (!porcelain) {
      return style('no upstream', 'gray'); // early exit
    }

    parsed = porcelain.match(trackingRegex) || ['', undefined, undefined];
    if (parsed[1]) {
      display = display + '+' + parsed[1];
    }
    if (parsed[2]) {
      display = display + '-' + parsed[2];
    }

    if (!parsed[1] && !parsed[2]) {
      return '           '; // neither ahead nor behind (directly padded)
    } else if (parsed[1] && parsed[2]) {
      return style(display, 'red') + pad(display, 12); // both
    } else {
      return display + pad(display, 12); // either ahead or behind
    }
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
        var lines = stdout.split('\n');

        //remove the branch info so it isn't counted as a change
        var branchInfo = lines.shift().slice(3).split('...', 2);

        // parse
        var branchName = branchInfo[0],
            behind = remoteInfo(branchInfo[1]),
            modified = cloneState(lines),
            pname = path.basename(cwd),
            printed;

        printed = style(dirname, 'gray') +
          style(pname, 'white') + pad(dirname + pname, pathMaxLen) + ' ' +
          branchName + pad(branchName, 24) + ' ' +
          style(modified[0], modified[1]) + ' ' +
          behind;
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
