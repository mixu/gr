var log = require('minilog')('gr-nop');

module.exports = function(req, res, next) {
  log.info(req);
  req.done();
};
