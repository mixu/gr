var fs = require('fs'),
    path = require('path'),
    log = require('minilog')('gr-tag'),
    style = require('../lib/style.js');

function _getTargets(argv) {
  var targets = [process.cwd()];
  if (argv.length > 1) {
    // tag add foo ~/path
    targets = argv
      .slice(1)
      .map(function(item) {
        var target = path.resolve(process.cwd(), item);
        if (!fs.existsSync(target)) {
          console.log('Path not found', target);
        }
        return target;
      });
  }
  return targets;
}


function add(req, res, next) {
  var key = 'tags.' + req.argv[0],
      targets = _getTargets(req.argv);

  targets.forEach(function(target) {
    req.config.add(key, target);
    if (req.format == 'human') {
      log.info('add', key, target, '=>', req.config.get(key));
    } else {
      console.log(JSON.stringify({ op: 'add', tag: req.argv[0], path: target }));
    }
  });

  req.config.save();
  req.exit();
}

function remove(req, res, next) {
  var key = 'tags.' + req.argv[0],
      targets = _getTargets(req.argv);

  targets.forEach(function(target) {
    req.config.remove(key, target);

    if (req.format == 'human') {
      log.info('remove', key, target, '=>', req.config.get(key));
    } else {
      console.log(JSON.stringify({ op: 'rm', tag: req.argv[0], path: target }));
    }
  });

  req.config.save();
  req.exit();
}

function list(req, res, next) {
  var key = (req.argv[0] ? 'tags.' + req.argv[0] : 'tags'),
      obj = req.config.get(key);

  if (Array.isArray(obj)) {
    // result is an array, usually like "tags.foo" => [ paths ]
    if (req.format == 'human') {
      console.log(
        style('Paths tagged ', 'gray') +
        style('@' + req.argv[0], 'white') +
        ':\n ' + obj.join('\n ')
      );
    } else {
      console.log(JSON.stringify(obj, null, 2));
    }
  } else if (typeof obj == 'object' && obj) {
    // result is an object, usually like "tags" => { foo: [ paths] }
    if (req.format == 'human') {
      Object.keys(obj).forEach(function(tag) {
        var val = obj[tag];
          console.log(
            style('Paths tagged ', 'gray') +
            style('@' + tag, 'white') +
            ':\n ' + (Array.isArray(val) ? val.map(function(s) {
              return s.replace(req.gr.homePath, '~');
            }).join('\n ') : val)
          );
      });
    } else {
      console.log(JSON.stringify(obj, null, 2));
    }
    if (Object.keys(obj).length === 0 && req.format == 'human') {
      console.log('No tags have been defined.');
    }
  } else if (req.format == 'json') {
    // keep the result parseable, even if there is no corresponding tag
    if (req.argv[0]) {
      console.log('[]');
    } else {
      console.log('{}');
    }
  }
  req.exit();
}

var execSync = require('child_process').execSync,
    os = require('os'),
    tty = require('tty');

function discover(req, res, next) {
  var currentPaths = (req.argv.length > 0 ? req.argv : [req.gr.homePath]),
      repos = (req.gr.directories ? req.gr.directories : []),
      pathMaxLen = repos.reduce(function(prev, current) {
        return Math.max(prev, current.replace(req.gr.homePath, '~').length + 2);
      }, 0);

  function pad(s, len) {
    return (s.toString().length < len ?
      new Array(len - s.toString().length).join(' ') : '');
  }

  var editor = process.env['GIT_EDITOR'] || process.env['EDITOR'] || 'nano',
      tmpfile = os.tmpdir() + '/gr-repos-tmp.txt',
      gitPaths = [],
      append = '';

  var maxDepth = 5;
  var depth = 0;
  var nextPaths = [];
  var i = 0;
  var total = currentPaths.length;
  var stderr = process.stderr;
  while (currentPaths.length > 0 && depth < maxDepth) {
    var p = currentPaths.shift();
    i++;
    if (stderr.isTTY) {
      stderr.cursorTo(0);
      var str = '[gr] ' + i + '/' + total + ' Scanning ' + p + '/* for .git directories (depth ' + (depth + 1) + ')';
      stderr.write(str.substr(0, stderr.columns));
      stderr.clearLine(1);
    }
    try {
      var paths = fs.readdirSync(p).filter(function(name) {
        return fs.statSync(path.join(p, name)).isDirectory();
      });
      var hasGit = paths.filter(function(p) { return p === '.git';});
      gitPaths = gitPaths.concat(hasGit.map(function(name) { return path.join(p, name); }));
      nextPaths = nextPaths.concat(
        paths.filter(function(p) {
          return p.charAt(0) !== '.';
        }).map(function(name) {
          return path.join(p, name);
        })
      );
    } catch (e) {
      // ignore ENOENT (can occur with bad symlinks)
      // and EACCESS (can occur with superuser-permission paths)
      if (e.code !== 'ENOENT' && e.code !== 'EACCES') {
        throw e;
      }
    }
    if (currentPaths.length === 0) {
      depth++;
      if (depth < maxDepth) {
        total += nextPaths.length;
        currentPaths = nextPaths;
        nextPaths = [];
      }
    }
  }
  if (stderr.isTTY) {
    stderr.write('\n');
  }

  // for each git path:
  gitPaths.sort().forEach(function(dir) {
    var tags, humanDir;
    // 1) normalize by taking dirname, changing homePath to ~/ and sorting
    dir = path.dirname(dir);
    dir = path.resolve(dir);
    humanDir = dir.replace(new RegExp('^' + req.gr.homePath + '/'), '~/')
                  .replace(/ /g, '\\ ');
    // 2) search for matching tags
    tags = req.gr.getTagsByPath(dir);

    // 3) append to the template
    append += humanDir +
              pad(humanDir, pathMaxLen) +
              tags.map(function(s) { return '@' + s; }).join(' ') + '\n';
  });

  // now, write the file
  // and launch the user's editor

  fs.writeFileSync(tmpfile,
    fs.readFileSync(__dirname + '/discover.template.md').toString() + append);

  execSync(editor + " " + tmpfile, {
    env: process.env,
    stdio: 'inherit'
  });

  // now read back the file
  var lines = fs.readFileSync(tmpfile).toString().split('\n');
  applyTags(req, lines);
  if (req.format == 'human') {
    console.log('Tags updated. Run `gr status` or `gr tag list` to see the current state.');
  }
}

// ignores escaped spaces e.g. '\ '
function splitBySpace(line) {
  var parts = [],
      start = 0,
      end = 0;
  while (end < line.length) {
    if (line.charAt(end) === '\\') {
      end += 2;
    } else if (line.charAt(end) === ' ') {
      parts.push(line.slice(start, end));
      // skip any extra spaces
      while (line.charAt(end + 1) === ' ') {
        end++;
      }
      start = end + 1;
    }
    end++;
  }
  if (start != end) {
    parts.push(line.slice(start, end));
  }
  return parts;
}

function applyTags(req, lines) {
  // filter out commented lines
  lines = lines.filter(function(line) {
            return line.charAt(0) != '#' && line.trim().length > 0;
          });
  lines.forEach(function(line) {
    // split by whitespace
    var parts = splitBySpace(line),
        // first part is an existing path
        dirname = parts[0].replace('~', req.gr.homePath),
        // subsequent parts are tags
        tags = parts.slice(1).map(function(s) {
          // # | @ is optional
          return s.replace(/^#/, '').replace(/^@/, '');
        }),
        confTags = (req && req.config && req.config.items &&
                    req.config.items.tags ? req.config.items.tags : []);

    // this includes both tags that exist, and tags that
    // are new (e.g. not in tags yet)
    var last,
        allTags = Object.keys(confTags)
                  .concat(tags)
                  .filter(function(k) {
                    return !!k;
                  })
                  .sort()
                  .filter(function(key) {
                    var isDuplicate = (key == last);
                    last = key;
                    return !isDuplicate;
                  });

    // set (rather than add/append) the tags for this directory
    allTags.forEach(function(tag) {
      var shouldHaveTag = (tags.indexOf(tag) > -1),
          hasTag = (Array.isArray(confTags[tag]) &&
                    confTags[tag].indexOf(dirname) > -1);
      if (shouldHaveTag && !hasTag) {
        req.config.add('tags.' + tag, dirname);
      } else if (!shouldHaveTag && hasTag) {
        req.config.remove('tags.' + tag, dirname);
      }
    });
  });
  req.config.save();
}

module.exports = {
  add: add,
  remove: remove,
  list: list,
  discover: discover
};
