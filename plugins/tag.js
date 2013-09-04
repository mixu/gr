module.exports = function(argv) {

  switch(argv[0]) {
    case 'add':
      addTag(argv.slice(1));
      break;
    case 'remove':
    case 'rm':
      removeTag(argv.slice(1));
      break;
    case 'list':
      listRepos(argv[1]);
      break;
    case 'use':

      break;
    default:
      // queue command for execution
  }

};

function addTag(rest) {


}
