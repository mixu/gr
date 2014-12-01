var fs = require('fs'),
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    confFile = homePath + '/.grconfig.json';

module.exports = function() {
  var backup;

  // backup
  if (fs.existsSync(confFile)) {
    backup = fs.readFileSync(confFile);
  }

  return function restore() {
    if (backup) {
      fs.writeFileSync(confFile, backup);
    }
  };
};
