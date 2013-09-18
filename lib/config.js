var fs = require('fs')
    get = require('./getitem.js').get,
    set = require('./getitem.js').set,
    add = require('./getitem.js').add;

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

Config.prototype.get = function(path) {
  return get(path, this.items);
};

Config.prototype.set = function(path, value) {
  set(path, value, this.items);
};

Config.prototype.add = function(path, value) {
  add(path, value, this.items);
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
