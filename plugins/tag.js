var fs = require('fs'),
    path = require('path'),
    log = require('minilog')('gr-tag'),
    style = require('../lib/style.js');

function add(req, res, next) {
  var key = 'tags.'+req.argv[0],
      targetPath = process.cwd(),
      tmp;

  if(req.argv.length > 1) {
    // tag add foo ~/path
    targetPath = tmp = path.resolve(process.cwd(), req.argv[1]);
    if(!fs.existsSync(tmp)) {
      console.log('Path not found', tmp);
    }
  }

  req.config.add(key, targetPath);
  log.info('add', key, targetPath, '=>', req.config.get(key));
  req.config.save();
  req.exit();
}

function remove(req, res, next) {
  var key = 'tags.'+req.argv[0],
      targetPath = process.cwd(),
      tmp;

  if(req.argv.length > 1) {
    // tag add foo ~/path
    targetPath = tmp = path.resolve(process.cwd(), req.argv[1]);
    if(!fs.existsSync(tmp)) {
      console.log('Path not found', tmp);
    }
  }

  req.config.remove(key, process.cwd());

  switch(req.format) {
    case 'json':
      break;
    case 'human':
    default:
      log.info('remove', key, process.cwd(), '=>', req.config.get(key));
  }

  req.config.save();
  req.exit();
}

function list(req, res, next) {
  var key = (req.argv[0] ? 'tags.'+req.argv[0] : 'tags'),
      obj = req.config.get(key);

  if(Array.isArray(obj)) {
    // result is an array, usually like "tags.foo" => [ paths ]
    if(req.format == 'human') {
      console.log(
        style('Paths tagged ', 'gray') +
        style('#'+req.argv[0], 'white') +
        ': ' + obj.join(', ')
      );
    } else {
      console.log(JSON.stringify(obj, null, 2));
    }
  } else if(typeof obj == 'object' && obj) {
    // result is an object, usually like "tags" => { foo: [ paths] }
    Object.keys(obj).forEach(function(tag) {
      var val = obj[tag];
      if(req.format == 'human') {
        console.log(
          style('Paths tagged ', 'gray') +
          style('#'+tag, 'white') +
          ': ' + (Array.isArray(val) ? val.join(', ') : val)
        );
      } else {
        console.log(JSON.stringify(obj[tag], null, 2));
      }
    });

    if(Object.keys(obj).length == 0 && req.format == 'human') {
      console.log('No tags have been defined.');
    }
  }
  req.exit();
}

var spawn = require('child_process').spawn,
    os = require('os'),
    tty = require('tty'),
    findBySubdir = require('../lib/find-by-subdir.js');

function discover(req, res, next) {
  var editor = process.env['GIT_EDITOR'] || process.env['EDITOR'] || 'nano',
      tmpfile = os.tmpDir() + '/foo.txt';

  console.log(findBySubdir(req.gr.homePath, [ '.git' ]));

  return req.exit();

  fs.writeFileSync(tmpfile, fs.readFileSync(__dirname + '/discover.template.md'));

  var task = spawn(editor, [ tmpfile ], {
    env: process.env,
    stdout: 'inherit'
  });

  function indata(c) {
    task.stdin.write(c);
  }
  function outdata(c) {
    process.stdout.write(c);
  }

  task.on('exit', function(code) {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.removeListener('data', indata);
    task.stdout.removeListener('data', outdata);
    if(code != 0) {
      console.log('');
      console.log('spawn-task: "' +line+ '" exited with nonzero exit code: '+ code);
      // task.emit('error', new Error('Child process exited with nonzero exit code: '+ code));
    }
  });

  task.once('close', function() {
    var lines = fs.readFileSync(tmpfile).toString().split('\n').filter(function(line) {
                    return line.charAt(0) != '#' && line.trim() != '';
                  });

    console.log(lines);
  });

  process.stdin.resume();
  process.stdin.on('data', indata);
  task.stdout.on('data', outdata);
  process.stdin.setRawMode(true);

}

module.exports = {
  add: add,
  remove: remove,
  list: list,
  discover: discover
};
