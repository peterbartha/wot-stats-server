const express = require('express');
const router = express.Router();
const api = require('../utils/api');
const request = require('request');
const apiKey = require('../config/api-key').apiKey;


router.get('/', (req, res, next) => {

  function roundTwoDecPlaces(number) {
    return Math.round(number * 100) / 100;
  }

  const optionsNewer = {
    url: 'http://www.wnefficiency.net/exp/expected_tank_values_30.json',
    json: true
  };

  request.get(optionsNewer, (error, response, body) => {
    const optionsOlder = {
      url: 'http://www.wnefficiency.net/exp/expected_tank_values_29.json',
      json: true
    };

    request.get(optionsOlder, (error2, response2, body2) => {

      const optionsForTanks = {
        url: 'https://api.worldoftanks.eu/wot/encyclopedia/tanks/?application_id=' + apiKey,
        json: true
      };

      request.get(optionsForTanks, (error3, response3, body3) => {
        const result = body.data.map(obj => {
          let tank = body3.data[obj.IDNum];
          if (!tank) {
            tank = {
              name_i18n: 'NaN (removed)',
              level: 'NaN',
              nation: 'NaN',
              image: ''
            };
          }

          let old = body2.data.find(ref => { return ref.IDNum === obj.IDNum; });
          if (!old) old = obj;  // for new tanks

          return {
            id: obj.IDNum,
            tank: tank.name_i18n,
            expFrag: obj.expFrag,
            expDamage: obj.expDamage,
            expSpot: obj.expSpot,
            expDef: obj.expDef,
            expWinRate: obj.expWinRate,
            deltaFrag: roundTwoDecPlaces(obj.expFrag - old.expFrag * 100),
            deltaDamage: roundTwoDecPlaces(obj.expDamage - old.expDamage),
            deltaSpot: roundTwoDecPlaces(obj.expSpot - old.expSpot),
            deltaDef: roundTwoDecPlaces(obj.expDef - old.expDef),
            deltaWinRate: roundTwoDecPlaces(obj.expWinRate - old.expWinRate),
            tier: tank.level,
            nation: tank.nation,
            class: tank.type ? tank.type.replace('Tank', '') : 'NaN',
            img: tank.image
          };
        });

        res.send(result);
        return next();
      });
    });
  });
});

module.exports = router;
