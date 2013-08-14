function isArg(s) {
  return s && s.charAt(0) == '-';
}

module.exports = function(input, type) {
  var task = [],
      argv = {},
      i = 0, key, parts;

  if(arguments.length == 1) {
    type = {};
  }

  function set(key, value) {
    if(typeof argv[key] === 'undefined') {
      argv[key] = value;
    } else {
      if(!Array.isArray(argv[key])) {
        argv[key] = [ argv[key] ];
      }
      argv[key].push(value);
    }
  }


  while(i < input.length) {
    if(isArg(input[i])) {
      key = input[i].replace(/^-+/, '');
      if(key.indexOf('=') > -1) {
        parts = key.split('=', 2);
        set(parts[0], parts[1]);
        i++;
        continue;
      } else {
        i++;
          // e.g. explicitly set to String
          if(input[i] && type[key] != Boolean) {
            set(key, input[i]);
            i++;
          } else if(key.substr(0, 3) == 'no-') {
            set(key.substr(3), false);
          } else {
            set(key, true);
          }
      }
    } else {
      task.push(input[i]);
      i++;
    }
  }

  if(task.length > 0) {
    argv['_'] = task;
  }
  return argv;
};
