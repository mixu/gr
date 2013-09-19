function get(path, hash) {
  var parts = path.split('.')
  if(!hash || !parts) return undefined;
  var i = 0,
      current = hash;
  // return the parent and the last item
  for(; i < parts.length; i++) {
    if(typeof current[parts[i]] === 'undefined') {
      return undefined;
    }
    current = current[parts[i]];
  }
  return current;
}

function set(path, value, hash) {
  var parts = path.split('.'),
      last = parts[parts.length - 1 ],
      rest = parts.slice(0, parts.length - 1);

  var i = 0,
      current = hash;
  // return the parent and the last item
  for(; i < rest.length; i++) {
    if(!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  if (current) {
    current[last] = value;
  }
}

function remove(path, value, hash) {
  var parts = path.split('.'),
      last = parts[parts.length - 1 ],
      rest = parts.slice(0, parts.length - 1);

  var i = 0,
      current = hash;
  // return the parent and the last item
  for(; i < rest.length; i++) {
    if(!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  if (current) {
    var index;
    if(!value || current[last] == value) {
      delete current[last];
      return;
    }
    if(Array.isArray(current[last])) {
      index = current[last].indexOf(value);
      current[last].splice(index, 1);
    }
  }
}

function add(path, value, hash) {
  var parts = path.split('.'),
      last = parts[parts.length - 1 ],
      rest = parts.slice(0, parts.length - 1);

  // console.log(rest, last);

  var i = 0,
      current = hash;
  // return the parent and the last item
  for(; i < rest.length; i++) {
    if(!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  if (current) {
    if(!current[last]) {
      current[last] = [];
    }
    if(!Array.isArray(current[last])) {
      current[last] = [ current[last] ];
    }
    if(current[last].indexOf(value) === -1) {
      current[last].push(value);
    }
  }
}


exports.get = get;

exports.set = set;

exports.add = add;

exports.remove = remove;
