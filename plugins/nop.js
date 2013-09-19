var log = require('minilog')('gr-nop');

module.exports = function(req, res, next) {
  Object.keys(req).forEach(function(key) {
    if(key != 'gr') {
      log.info(key, req[key]);
    }
  });
  req.done();
};
