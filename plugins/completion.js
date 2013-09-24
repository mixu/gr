var tabtab = require('tabtab');
var fs = require('fs');

module.exports = function(req, res, next) {
 var tags = [],
     hashtags;
  if(req.config && req.config.items && req.config.items.tags) {
    Object.keys(req.config.items.tags).forEach(function(tag){
      tags.push(tag);
    });
  }

  hashtags = tags.map(function(s) {
    return '#'+s;
  });

  // actions on tags
  var actions = [ 'status' ];


  tabtab.complete('gr', function(err, data) {
    /*
    fs.writeFileSync('/home/m/mnt/gr/out.txt', JSON.stringify({
      data: data
    }, null, 2));
    */
    // simply return here if there's an error or data not provided.
    // stderr not showing on completions
    if(err || !data) return;


    var line = data.line.trim();

    if(line.substr(0, 'gr tag add'.length) == 'gr tag add' ||
       line.substr(0, 'gr tag rm'.length) == 'gr tag rm' ||
       line.substr(0, 'gr tag remove'.length) == 'gr tag remove') {
      tabtab.log(tags, data);
    } else {
      switch(data.prev) {
        case '-t':
          tabtab.log(tags, data);
          break;
        case '#':
          tabtab.log(tags, data);
          break;
        case 'tag':
          tabtab.log(['add', 'rm', 'remove', 'list', 'discover'], data);
          break;
        case 'config':
          tabtab.log(['get', 'set', 'add', 'rm', 'list'], data);
          break;
        case 'status':
          tabtab.log(['-v'], data);
          break;
        case 'gr':
        default:
          if(data.lastPartial && data.lastPartial.charAt(0) == '#') {
            tabtab.log(hashtags, data);
          } else if(data.prev && data.prev.charAt(0) == '#') {
            tabtab.log(actions, data);
          } else {

            if(/^-\w?/.test(data.last)) {
              return tabtab.log(['t', '-json', '-', '-help', '-version', 'v', 'h' ], data, '-');
            }
            tabtab.log(['tag', 'list', 'status', 'config', 'help', 'version'].concat(hashtags), data);
          }
      }
    }
  });
  req.exit();
};
