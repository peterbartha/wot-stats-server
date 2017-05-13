const apiKey = require('../config/api-key').apiKey;
const request = require('request');

/**
 * Wot API wrapper
 * @param url
 * @returns {Promise}
 */
function wotGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      url: url,
      json: true
    };
    request.get(options, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(body);
    });
  });
}

function getPlayerId(nickname) {
  return wotGet('https://api.worldoftanks.eu/wot/account/list/?application_id=' + apiKey + '&search=' + nickname);
}

function getPlayerInfo(accountId) {
  return wotGet('https://api.worldoftanks.eu/wot/account/info/?application_id=' + apiKey + '&account_id=' + accountId);
}

function getPlayerTanks(accountId) {
  return wotGet('https://api.worldoftanks.eu/wot/account/tanks/?application_id=' + apiKey + '&account_id=' + accountId);
}

function getPlayerAchievements(accountId) {
  return wotGet('https://api.worldoftanks.eu/wot/account/achievements/?application_id=' + apiKey + '&account_id=' + accountId);
}

function getTanks() {
  return wotGet('https://api.worldoftanks.eu/wot/encyclopedia/tanks/?application_id=' + apiKey);
}

/**
 * Refrence API wrapper
 * @returns {Promise}
 */
function getReferenceList() {
  return new Promise(function(resolve, reject) {
    const options = {
      url: 'http://www.wnefficiency.net/exp/expected_tank_values_28.json',
      json: true
    };
    request.get(options, function(error, response, body) {
      if (error) {
        reject(error);
      }
      resolve(body);
    });
  });
}

/**
 * Exported public functions
 */
module.exports.getPlayerId = getPlayerId;
module.exports.getPlayerInfo = getPlayerInfo;
module.exports.getPlayerTanks = getPlayerTanks;
module.exports.getPlayerAchievements = getPlayerAchievements;
module.exports.getTanks = getTanks;
module.exports.getReferenceList = getReferenceList;
