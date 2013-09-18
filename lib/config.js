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

Config.prototype.set = function(name, value) {
  this.items[name] = value;
};

Config.prototype.add = function(name, value) {
  if(!this.items[name]) {
    this.items[name] = [];
  }
  if(!Array.isArray(this.items[name])) {
    this.items[name] = [ this.items[name] ];
  }
  if(this.items[name].indexOf(value) === -1) {
    this.items[name].push(value);
  }
};

Config.prototype.remove = function(name, value) {
  var index;
  if(!value) {
    delete this.items[name];
    return;
  }
  if(this.items[name] == value) {
    delete this.items[name];
    return;
  }
  if(Array.isArray(this.items[name])) {
    index = this.items[name].indexOf(value);
    this.items[name].splice(index, 1);
  }
};

module.exports = Config;
