var log = require('minilog')('gr-config');

module.exports = function(argv, gr, done) {

  switch(argv[0]) {
    case 'add':
      add(argv[1], argv[2], gr, done);
      break;
    case 'set':
      set(argv[1], argv[2], gr, done);
      break;
    case 'remove':
    case 'rm':
      remove(argv[1], argv[2], gr, done);
      break;
    case 'get':
      get(argv[1], gr, done);
      break;
    case 'list':
    default:
      console.log(gr.config.items);
      done(null);
  }

};

function add(name, value, gr, done) {
  if(!name || typeof value === 'undefined') {
    return done('Name and value are required!');
  }
  gr.config.add(name, value);
  log.info('add', name, value, '=>', gr.config.get(name));
  gr.config.save();
  return done(null, gr.config.get(name));
}

function remove(name, value, gr, done) {
  if(!name) {
    return done('Name is required!');
  }
  gr.config.remove(name, value);
  log.info('remove', name, '=>', gr.config.get(name));
  gr.config.save();
  return done(null, gr.config.get(name));
}

function set(name, value, gr, done) {
  if(!name || typeof value === 'undefined') {
    return done('Name and value are required!');
  }
  gr.config.set(name, value);
  log.info('set', name, value, '=>', gr.config.get(name));
  gr.config.save();
  return done(null, gr.config.get(name));
}

function get(name, gr, done) {
  log.info('get', name, '=>', gr.config.get(name));
  return done(null, gr.config.get(name));
}
