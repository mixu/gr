'use strict';

const run = require('../lib/run');

const git = require('simple-git');

const async = require('async');

const fs = require('fs');
const path = require('path');

function importFromJson(req, res, next) {
  const filePath = process.argv[3];
  if (!filePath) {
    console.log('Please supply a file path for your import');
    return req.exit();
  }

  const cloneRepo = (repo, callback) => {
    console.log(`Cloning ${repo.name} into ${repo.path}/${repo.name}`);
    git(repo.path).clone(repo.url, repo.name, (err, result) => {
      if (err) {
        console.log(`Failed to clone ${repo.name}`);
        return callback(err)
      }
    });
    repo.tags.forEach((tag) => req.config.add(`tags.${tag}`, path.resolve(repo.path, repo.name)));
    callback();
  };

  const exportedFile = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let cloneRequests = [];
  exportedFile.repos.forEach((repo) => {
    cloneRequests.push((callback) => {
        cloneRepo(repo, callback);
      })
    });

  async.parallel(cloneRequests, (err, result) => {
    if (err) {
      return console.log(err);
    }

    req.config.save();
    console.log('Successfully imported new config');
  });

  req.exit();
}

module.exports = {
  importFromJson: importFromJson
};
