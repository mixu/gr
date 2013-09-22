var log = require('minilog')('filter-regex');

// Filter out files from a list by a blacklist of regular expressions
module.exports = function(list, expressions) {
  list = list.filter(function(obj, i) {
    var name = obj.name,
        matchedExpr,
        match = expressions.some(function(expr) {
          var result = name.match(expr);
          if(result) {
            matchedExpr = expr;
          }
          return result;
        });
    if(match) {
      log.info('Excluded by regexp ', matchedExpr, ':', name);
    }
    return !match;
  });
};
