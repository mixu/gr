var path = require('path'),
    binpath = path.normalize(__dirname + '/../../bin/gr'),
    exec = require('child_process').exec;

module.exports = function run(args, cwd, onDone) {
  exec(binpath + ' ' + args, {
        cwd: cwd,
        maxBuffer: 1024 * 1024 // 1Mb
      }, function(err, stdout, stderr) {
        var json;
        if (stderr) {
          console.log('stderr: ' + stderr);
        }
        if (err !== null) {
          throw err;
        }
        try {
          json = JSON.parse(stdout);
        } catch (e) {
          // console.error('Cannot parse', stdout);
          return onDone(stdout);
        }
        onDone(json);
      });
};
