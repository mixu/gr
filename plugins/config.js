var log = require('minilog')('gr-config');

function add(req, res, next) {
  var name = req.argv[0],
      value = req.argv[1];

  if(!name || typeof value === 'undefined') {
    return next('Name and value are required!');
  }

  req.config.add(name, value);
  log.info('add', name, value, '=>', req.config.get(name));
  req.config.save();

  req.exit();
}

function remove(req, res, next) {
  var name = req.argv[0],
      value = req.argv[1];

  if(!name) {
    return next('Name is required!');
  }
  req.config.remove(name, value);
  log.info('remove', name, '=>', req.config.get(name));
  req.config.save();

  req.exit();
}

function set(req, res, next) {
  var name = req.argv[0],
      value = req.argv[1];

  if(!name || typeof value === 'undefined') {
    return next('Name and value are required!');
  }
  req.config.set(name, value);
  log.info('set', name, value, '=>', req.config.get(name));
  req.config.save();

  req.exit();
}

function get(req, res, next) {
  var name = req.argv[0];

  log.info('get', name, '=>', req.config.get(name));

  req.exit();
}

function list(req, res, next) {
  console.log(req.config.items);
  req.exit();
}

module.exports = {
  add: add,
  set: set,
  remove: remove,
  get: get,
  list: list
};
