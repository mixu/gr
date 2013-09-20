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

module.exports = {
  add: add,
  remove: remove,
  list: list
};
