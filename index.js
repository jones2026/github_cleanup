const request = require('request');
const prompt = require('prompt');
const { URL } = require('url');

var properties = [
  {
    name: 'api',
    description: 'Github API URL',
    default: 'https://api.github.com/',
    type: 'string'
  },
  {
    name: 'username',
    description: 'Github username',
    validator: /^[a-zA-Z\_\-0-9]+$/,
    warning: 'Username must be only letters, numbers, underscores, or dashes'
  },
  {
    name: 'token',
    description: 'Personal access token (with access to delete repos)',
    hidden: true
  }
];

let apiURL

prompt.message = "";
prompt.start();

console.log("Please enter your github information:")
prompt.get(properties, function (err, result) {
  if (err) { return onErr(err); }
  apiURL = result.api
  reposURL = new URL('user/repos', apiURL);
  var options = {
    url: reposURL,
    headers: {
      'User-Agent': 'jones2026-repo-cleanup'
    },
    auth: {
      user: result.username,
      password: result.token
    }
  }
  fetchRepos(options, result.username)
});

function fetchRepos(options, user) {
  request.get(options, function (err, res, body) {
    if (err) { return onErr(err); }
    let user_repos = JSON.parse(body);
    for (let repo of user_repos) {
      if (repo.owner.login === user && repo.fork) {
        console.log('Attempting to delete repo: ', [repo.full_name]);
        deleteURL = new URL('repos/' + [repo.owner.login] + '/' + [repo.name], apiURL);
        options.url = deleteURL
        deleteRepo(options)
      }
    }
  })
}

function deleteRepo(options) {
  request.delete(options, function (err, res, body) {
    if (err) { return onErr(err); }
    if (body.length === 0) {
      console.log('Deleted repo: ' + res.request.uri.href)
    } else {
      let response = JSON.parse(body);
      onErr('Failed to delete repo: ' + [response.message]);
    }
  })
}

function onErr(err) {
  console.log(err);
  return 1;
}