'use strict';

const run = require('../lib/run');

const git = require('simple-git');

const groupBy = require('lodash.groupby');

const async = require('async');
const path = require('path');


function getProjectName(path) {
  const split = path.split('/');
  return split[split.length - 1]
}

function exportAsJson(req, res, next) {
  const exportPath = process.argv[3];
  if (!exportPath) {
    return console.log('Please supply a file path of where you want to start exporting from')
  }
  const absoluteExportPath = path.resolve(exportPath);

  let exportedConfig = {
    repos: []
  };

  const getRelativeRepoPath = function (projectName, path) {
    const exportPathRemoved = path.substring(absoluteExportPath.length, path.length);
    const relativePath = exportPathRemoved.substring(1, exportPathRemoved.length - projectName.length - 1);

    return relativePath === '/' ? '.' : relativePath;
  };

  const getRepoDetails = function (path, tag, callback) {
    git(path).listRemote(['--get-url'], function (err, gitUrl) {
      if (err) {
        console.log('Error with: ' + path);
        return callback(err)
      }
      const projectName = getProjectName(path);
      const repo = {
        name: projectName,
        url: gitUrl.trim(),
        tag: tag,
        path: getRelativeRepoPath(projectName, path)
      };
      exportedConfig.repos.push(repo);
      callback()
    });
  };

  const tags = req.config.items.tags;

  if (!tags) {
    console.log('Cannot export if there is no config');
    return req.exit()
  }

  const tagKeys = Object.keys(tags);
  const filteredTags = {};

  tagKeys.forEach((tagName) => {
    filteredTags[tagName] = tags[tagName].filter((path) => path.indexOf(absoluteExportPath) > -1);
  });


  let requests = [];
  tagKeys.forEach(function (tagName) {
    requests = requests.concat(filteredTags[tagName].map((path) => {
      return function (callback) {
        getRepoDetails(path, tagName, callback);
      };
    }));
  });
  async.parallel(requests, (err, result) => {
    if (err) {
      console.log('Error exporting config');
      return req.exit();
    }
    const groupedConfig = groupBy(exportedConfig.repos, 'url');

    const groupedConfigKeys = Object.keys(groupedConfig);
    let newConfig = {
      repos: []
    };

    groupedConfigKeys.forEach((key) => {
      let tags = [];
      const repos = groupedConfig[key];
      repos.forEach((repo) => tags.push(repo.tag));
      let newRepo = {
        name: repos[0].name,
        url: key,
        tags: tags,
        path: repos[0].path
      };
      newConfig.repos.push(newRepo)
    });

    console.log(JSON.stringify(newConfig));
  });

  req.exit();
}

module.exports = {
  exportAsJson: exportAsJson

};
