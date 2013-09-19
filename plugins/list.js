var log = require('minilog')('gr-list');

module.exports = function(req, res, next) {
  gr.files().forEach(function(file) {
    var cwd = path.dirname(file.name).replace(new RegExp('^'+homePath+'/'), '~/');
    console.log(style(path.dirname(cwd) + path.sep, 'gray') + style(path.basename(cwd), 'white'));
  });

  req.exit();
};
