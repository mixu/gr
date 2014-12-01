var log = require('minilog')('gr-config');

function add(req, res, next) {
  var name = req.argv[0],
      value = req.argv[1];

  if (!name || typeof value === 'undefined') {
    return next('Name and value are required!');
  }

  req.config.add(name, value);
  if (req.format === 'human') {
    log.info('add', name, value, '=>', req.config.get(name));
  } else {
    console.log(JSON.stringify({ op: 'add', key: req.argv[0], value: value, result: req.config.get(name) }));
  }
  req.config.save();

  req.exit();
}

function remove(req, res, next) {
  var name = req.argv[0],
      value = req.argv[1];

  if (!name) {
    return next('Name is required!');
  }
  req.config.remove(name, value);
  if (req.format === 'human') {
    log.info('remove', name, '=>', req.config.get(name));
  } else {
    console.log(JSON.stringify({ op: 'rm', key: req.argv[0], value: value, result: req.config.get(name) }));
  }
  req.config.save();

  req.exit();
}

function set(req, res, next) {
  var name = req.argv[0],
      value = req.argv[1];

  if (!name || typeof value === 'undefined') {
    return next('Name and value are required!');
  }
  req.config.set(name, value);
  if (req.format === 'human') {
    log.info('set', name, value, '=>', req.config.get(name));
  } else {
    console.log(JSON.stringify({ op: 'set', key: req.argv[0], value: value, result: req.config.get(name) }));
  }
  req.config.save();

  req.exit();
}

function get(req, res, next) {
  var name = req.argv[0];

  if (req.format === 'human') {
    log.info('get', name, '=>', req.config.get(name));
  } else {
    console.log(JSON.stringify(req.config.get(name)));
  }

  req.exit();
}

function list(req, res, next) {
  if (req.format === 'human') {
    console.log(JSON.stringify(req.config.items, null, 2));
  } else {
    console.log(JSON.stringify(req.config.items));
  }
  req.exit();
}

module.exports = {
  add: add,
  set: set,
  remove: remove,
  get: get,
  list: list
};
