var fs = require('fs');

function Config(filename) {
  this.filename = filename;
  try {
    this.items = JSON.parse(fs.readFileSync(filename));
  } catch(e) {
    this.items = {};
  }
}

Config.prototype.save = function() {
  fs.writeFileSync(this.filename, JSON.stringify(this.items, null, 2));
};

Config.prototype.get = function(name) {
  return this.items[name];
};

module.exports = Config;
