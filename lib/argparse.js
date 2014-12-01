function isArg(s) {
  return s && s.charAt(0) == '-';
}

module.exports = function(input, type) {
  var task = [],
      argv = {},
      i = 0, key, parts,
      mode = 'args', // args (parse arguments) or capture (capture the rest, ignore arguments)
      hasExplicit = (input.indexOf('--') > -1);

  if (arguments.length == 1) {
    type = {};
  }

  function set(key, value) {
    if (typeof argv[key] === 'undefined') {
      argv[key] = value;
    } else {
      if (!Array.isArray(argv[key])) {
        argv[key] = [argv[key]];
      }
      argv[key].push(value);
    }
  }

  while (i < input.length) {
    if (input[i] == '--') {
      mode = 'capture';
      i++;
    } else if (mode == 'args' && (isArg(input[i]) && input[i] != '--')) {
      key = input[i].replace(/^-+/, '');
      if (key.indexOf('=') > -1) {
        parts = key.split('=', 2);
        set(parts[0], parts[1]);
        i++;
        continue;
      } else {
        i++;
          // e.g. explicitly set to String
          if (input[i] && type[key] != Boolean) {
            set(key, input[i]);
            i++;
          } else if (key.substr(0, 3) == 'no-') {
            set(key.substr(3), false);
          } else {
            set(key, true);
          }
      }
    } else {
      // the first non-argument changes to "capture mode"
      // except when the -- is passed: when that option is passed, then everything up to that argument is ignored
      if (!hasExplicit || mode == 'capture') {
        mode = 'capture';
        task.push(input[i]);
      }
      i++;
    }
  }

  if (task.length > 0) {
    argv['_'] = task;
  }

  return argv;
};
