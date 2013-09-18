var log = require('minilog')('gr-tag');

module.exports = function(argv, gr, done) {

  switch(argv[0]) {
    case 'add':
      add(argv[1], gr, done);
      break;
    case 'remove':
    case 'rm':
      remove(argv[1], gr, done);
      break;
    case 'list':
      list(argv[1], gr, done);
      break;
    case 'use':

      break;
    default:
      // queue command for execution
  }

};

function add(tag, gr, done) {
  var key = 'tags.'+tag;
  gr.config.add(key, process.cwd());
  log.info('add', key, process.cwd(), '=>', gr.config.get(key));
  gr.config.save();
  return done(null, gr.config.get(key));
}

function remove(tag, gr, done) {
  var key = 'tags.'+tag;
  gr.config.remove(key, process.cwd());
  log.info('remove', key, process.cwd(), '=>', gr.config.get(key));
  gr.config.save();
  return done(null, gr.config.get(key));
}

function list(tag, gr, done) {
  var key = (tag ? 'tags.'+tag : 'tags');
  log.info('get', key, '=>', gr.config.get(key));
  return done(null, gr.config.get(key));
}
