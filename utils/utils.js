/**
 * Common
 */
function roundTwoDecPlaces(number) {
  return Math.round(number * 100) / 100;
}

function avgByBattle(number, battles) {
  const n = number / battles;
  return roundTwoDecPlaces(n);
}

function percByBattle(number, battles) {
  const n = number / battles * 100;
  return roundTwoDecPlaces(n);
}

/**
 * Calculate player's WN8
 * For more information, please check: http://wiki.wnefficiency.net/pages/WN8
 */
function calculateWN8(tanks, expected, battles, avgDmg, avgSpot, avgFrag, avgDef, avgWinRate) {
  const statArr = [];
  for (let i=0; i < tanks.length; i++) {
    const tank = tanks[i];
    for (let j=0; j < expected.length; j++) {
      const stat = expected[j];
      if (tank.tank_id === stat.IDNum) {
        stat.expDamage = stat.expDamage * tank.statistics.battles;
        stat.expDef = stat.expDef * tank.statistics.battles;
        stat.expFrag = stat.expFrag * tank.statistics.battles;
        stat.expSpot = stat.expSpot * tank.statistics.battles;
        stat.expWinRate = (stat.expWinRate * tank.statistics.battles * 100) / 100.0;
        statArr.push(stat);
      }
    }
  }
  const expectedAvg = calculateExpectedAvg(statArr, battles);
  const avg = { avgDmg: avgDmg, avgSpot: avgSpot, avgFrag: avgFrag, avgDef: avgDef, avgWinRate: avgWinRate };
  return calculateWN8Ratios(avg, expectedAvg);
}

function calculateExpectedAvg(statArr, battles) {
  let expDmg = 0;
  let expSpot = 0;
  let expFrag = 0;
  let expDef = 0;
  let expWinRate = 0;

  for (let i=0; i < statArr.length; i++) {
    const avg = statArr[i];
    expDmg += avg.expDamage;
    expSpot += avg.expSpot;
    expFrag += avg.expFrag;
    expDef += avg.expDef;
    expWinRate += avg.expWinRate;
  }

  return {
    expDmg: expDmg / battles,
    expSpot: expSpot / battles,
    expFrag: expFrag / battles,
    expDef: expDef / battles,
    expWinRate: expWinRate / battles
  }
}

function calculateWN8Ratios(avg, expected) {
  const rDAMAGE = avg.avgDmg     / expected.expDmg;
  const rSPOT   = avg.avgSpot    / expected.expSpot;
  const rFRAG   = avg.avgFrag    / expected.expFrag;
  const rDEF    = avg.avgDef     / expected.expDef;
  const rWIN    = avg.avgWinRate / expected.expWinRate;

  const rWINc    = Math.max(0,                          (rWIN    - 0.71) / (1 - 0.71) );
  const rDAMAGEc = Math.max(0,                          (rDAMAGE - 0.22) / (1 - 0.22) );
  const rFRAGc   = Math.max(0, Math.min(rDAMAGEc + 0.2, (rFRAG   - 0.12) / (1 - 0.12)));
  const rSPOTc   = Math.max(0, Math.min(rDAMAGEc + 0.1, (rSPOT   - 0.38) / (1 - 0.38)));
  const rDEFc    = Math.max(0, Math.min(rDAMAGEc + 0.1, (rDEF    - 0.10) / (1 - 0.10)));

  return 980*rDAMAGEc + 210*rDAMAGEc*rFRAGc + 155*rFRAGc*rSPOTc + 75*rDEFc*rFRAGc + 145*Math.min(1.8, rWINc);
}

/**
 * Battles / tank levels
 */
function battlesByTier(playerTanks, tanks) {
  const perLevel = {};
  for (let i = 0; i < playerTanks.length; i++) {
    const playerTank = playerTanks[i];
    const tank = tanks[playerTank.tank_id];
    if (tank) {
      if (perLevel[tank.level]) {
        perLevel[tank.level] += playerTank.statistics.battles;
      } else {
        perLevel[tank.level] = playerTank.statistics.battles;
      }
    }
  }
  return perLevel;
}

/**
 * Calculate player's efficiency
 * For more information, please check: http://www.modxvm.com/en/faq/how-is-player-efficiency-rating-calculated/
 */
function calculateEfficiency(playerTanks, tanks, battles, avgDmg, avgSpot, avgFrag, avgDef, avgCap) {
  const perLevel = battlesByTier(playerTanks, tanks);
  let sum = 0;
  for (let level in perLevel) {
    const z = perLevel[level];
    const j = parseInt(level, 10);
    sum += z*j;
  }
  const avgTier = sum / battles;
  return avgDmg * (10 / (avgTier + 2)) * (0.23 + 2*avgTier / 100) +
    avgFrag * 250 +
    avgSpot * 150 +
    Math.log(avgCap + 1) / Math.log(1.732) * 150 +
    avgDef * 150;
}

/**
 * Export public functions
 */
module.exports.roundTwoDecPlaces = roundTwoDecPlaces;
module.exports.avgByBattle = avgByBattle;
module.exports.percByBattle = percByBattle;
module.exports.calculateWN8 = calculateWN8;
module.exports.calculateEfficiency = calculateEfficiency;
module.exports.battlesByTier = battlesByTier;
