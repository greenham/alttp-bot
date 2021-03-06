const db = require('../db.js'),
  config = require('../config.json'),
  collectionName = "bot-commands",
  pollIntervalSeconds = 30;

let state = {
  commands: []
};

db.connect(config.db.host, config.db.db, (err) => {
  if (!err) {
    // Read in basic text commands / definitions
    fetchAll().then(result => {
      state.commands = result;
      // Poll for changes
      setInterval(refresh, pollIntervalSeconds*1000);
    })
    .catch(console.error);
  } else {
    console.error('Unable to connect to Mongo.');
    process.exit(1);
  }
});

// Read the initial state from the database
// TODO: Don't do this.
function fetchAll()
{
  return new Promise((resolve, reject) => {
    db.get().collection(collectionName)
      .find({"deleted": {$ne: true}})
      .sort({"command": 1})
      .toArray((err, commands) => {
        if (err) reject(err);
        resolve(commands);
      });
  });
}

function refresh()
{
  fetchAll().then(result => {state.commands = result}).catch(console.error);
}

// @TODO: add some caching here
function get(command)
{
  return new Promise((resolve, reject) => {
    db.get().collection(collectionName)
    .findOne({
      "$or": [
        {"command": command},
        {"aliases": command}
      ],
      "deleted": {$ne: true}
    }, (err, cmdResult) => {
      if (err) {
        reject(err);
      }
      if (!cmdResult) resolve(false);
      resolve(cmdResult);
    });
  });
}

function getAll()
{
  return state.commands;
}

function getCommandsInCategory(category)
{
  if (category == 'all') {
    return getAll();
  }

  return state.commands.filter(e => {
    return (e.category == category);
  });
}

module.exports = {
  get: get,
  getAll: getAll,
  getCommandsInCategory: getCommandsInCategory,
  refresh: refresh
};