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
  log.info('remove', key, process.cwd(), '=>', req.config.get(key));
  req.config.save();
  req.exit();
}

function list(req, res, next) {
  var key = (req.argv[0] ? 'tags.'+req.argv[0] : 'tags'),
      obj = req.config.get(key);
  if(typeof obj == 'object' && obj) {
    Object.keys(obj).forEach(function(tag) {
      console.log(
        style('Paths tagged ', 'gray') +
        style('#'+tag, 'white') +
        ': ' + obj[tag].join(', ')
      );
    });

    if(Object.keys(obj).length == 0) {
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
