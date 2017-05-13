const express = require('express');
const router = express.Router();
const api = require('../utils/api');
const utils = require('../utils/utils');


router.get('/', (req, res, next) => {
  const nickname = req.query.nickname;

  api.getPlayerId(nickname).then(body => {
    if (!body.data[0]) {
      res.status(400).send({
        type: 'QueryError',
        message: 'WrongNickname'
      });
    }

    const accountId = body.data[0]['account_id'];

    return api.getPlayerInfo(accountId).then(function (body2) {
      const player = body2.data[accountId];
      const stats = player.statistics.all;

      // Promises for chaining
      const playerTanksPromise = api.getPlayerTanks(accountId);
      const expectedPromise = api.getReferenceList();
      const tanksPromise = api.getTanks();

      return Promise.all([playerTanksPromise, expectedPromise, tanksPromise]).then(function (response) {
        const playerTanks = response[0].data[accountId];
        const expectedList = response[1].data;
        const tanks = response[2].data;

        const avgDmg = stats['damage_dealt'] / stats.battles;
        const avgSpot = stats.spotted / stats.battles;
        const avgFrag = stats.frags / stats.battles;
        const avgDef = stats['dropped_capture_points'] / stats.battles;
        const avgWinRate = stats.wins / stats.battles * 100;
        const avgCap = stats['capture_points'] / stats.battles;

        // Calculate ratings
        const wn8 = utils.calculateWN8(playerTanks, expectedList, stats.battles, avgDmg, avgSpot, avgFrag, avgDef, avgWinRate);
        const eff = utils.calculateEfficiency(playerTanks, tanks, stats.battles, avgDmg, avgSpot, avgFrag, avgDef, avgCap);

        const summary = {
          battles: stats.battles,
          battlesPerc: '-',
          victories: stats.wins,
          victoriesPerc: utils.percByBattle(stats.wins, stats.battles),
          draws: stats.draws,
          drawsPerc: utils.percByBattle(stats.draws, stats.battles),
          defeats: stats.losses,
          defeatsPerc: utils.percByBattle(stats.losses, stats.battles),
          survived: stats['survived_battles'],
          survivedPerc: utils.percByBattle(stats['survived_battles'], stats.battles),
          deaths: stats.battles - stats['survived_battles'],
          deathsPerc: utils.percByBattle(stats.battles - stats['survived_battles'], stats.battles),

          frags: stats.frags,
          fragsAvg: utils.avgByBattle(stats.frags, stats.battles),
          damageDealt: stats['damage_dealt'],
          damageDealtAvg: utils.avgByBattle(stats['damage_dealt'], stats.battles),
          tanksSpotted: stats.spotted,
          tanksSpottedAvg: utils.avgByBattle(stats.spotted, stats.battles),
          capturePoints: stats['capture_points'],
          capturePointsAvg: utils.avgByBattle(stats['capture_points'], stats.battles),
          droppedCapturePoints: stats['dropped_capture_points'],
          droppedCapturePointsAvg: utils.avgByBattle(stats['dropped_capture_points'], stats.battles),
          experience: stats.xp,
          experienceAvg: utils.avgByBattle(stats.xp, stats.battles)
        };

        // template params
        res.send({
          wn8: utils.roundTwoDecPlaces(wn8),
          eff: utils.roundTwoDecPlaces(eff),
          summary: summary
        });
        return next();
      });
    });
  });
});

module.exports = router;
