var log = require('minilog')('gr-tag');

function add(req, res, next) {
  var key = 'tags.'+req.argv[0];
  req.config.add(key, process.cwd());
  log.info('add', key, process.cwd(), '=>', req.config.get(key));
  req.config.save();
  req.exit();
}

function remove(req, res, next) {
  var key = 'tags.'+req.argv[0];
  req.config.remove(key, process.cwd());
  log.info('remove', key, process.cwd(), '=>', req.config.get(key));
  req.config.save();
  req.exit();
}

function list(req, res, next) {
  var key = (req.argv[0] ? 'tags.'+req.argv[0] : 'tags');
  log.info('get', key, '=>', req.config.get(key));
  req.exit();
}

module.exports = {
  add: add,
  remove: remove,
  list: list
};
