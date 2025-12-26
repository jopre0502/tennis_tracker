/**
 * Calculate comprehensive match statistics from match history
 * @param {Array} history - Array of point history objects
 * @returns {Object} Statistics object with player stats and totals
 */
export const calculateStats = (history) => {
  const stats = {
    a: {
      aces: 0,
      doubleFaults: 0,
      winners: 0,
      forcedErrors: 0,
      unforcedErrors: 0,
      pointsWon: 0,
      servicePoints: 0,
      servicePointsWon: 0,
      returnPointsWon: 0,
      firstServePoints: 0,
      firstServePointsWon: 0,
      secondServePoints: 0,
      secondServePointsWon: 0
    },
    b: {
      aces: 0,
      doubleFaults: 0,
      winners: 0,
      forcedErrors: 0,
      unforcedErrors: 0,
      pointsWon: 0,
      servicePoints: 0,
      servicePointsWon: 0,
      returnPointsWon: 0,
      firstServePoints: 0,
      firstServePointsWon: 0,
      secondServePoints: 0,
      secondServePointsWon: 0
    }
  };
  const totals = { points: history.length, aces: 0, doubleFaults: 0, winners: 0, forcedErrors: 0, unforcedErrors: 0 };

  history.forEach(h => {
    const serverPlayer = h.server;
    const receiver = serverPlayer === 'a' ? 'b' : 'a';

    stats[serverPlayer].servicePoints++;
    if (h.isSecondServe) {
      stats[serverPlayer].secondServePoints++;
    } else {
      stats[serverPlayer].firstServePoints++;
    }

    stats[h.winner].pointsWon++;
    if (h.winner === serverPlayer) {
      stats[serverPlayer].servicePointsWon++;
      if (h.isSecondServe) {
        stats[serverPlayer].secondServePointsWon++;
      } else {
        stats[serverPlayer].firstServePointsWon++;
      }
    } else {
      stats[receiver].returnPointsWon++;
    }

    if (h.type === 'ace') {
      stats[h.winner].aces++;
      totals.aces++;
    }
    if (h.type === 'double_fault') {
      stats[h.server].doubleFaults++;
      totals.doubleFaults++;
    }
    if (h.type === 'winner') {
      stats[h.winner].winners++;
      totals.winners++;
    }
    if (h.type === 'forced_error') {
      const loser = h.winner === 'a' ? 'b' : 'a';
      stats[loser].forcedErrors++;
      totals.forcedErrors++;
    }
    if (h.type === 'unforced_error') {
      const loser = h.winner === 'a' ? 'b' : 'a';
      stats[loser].unforcedErrors++;
      totals.unforcedErrors++;
    }
  });

  ['a', 'b'].forEach(p => {
    stats[p].returnPoints = totals.points - stats[p].servicePoints;
    stats[p].pointsLost = totals.points - stats[p].pointsWon;
    stats[p].pointsWonByWinners = stats[p].aces + stats[p].winners;
    stats[p].pointsLostByErrors = stats[p].doubleFaults + stats[p].forcedErrors + stats[p].unforcedErrors;
  });

  totals.winningShots = totals.aces + totals.winners;
  totals.errorPoints = totals.doubleFaults + totals.forcedErrors + totals.unforcedErrors;

  return { players: stats, totals };
};

/**
 * Format a statistic with count and percentage
 * @param {number} count - The count value
 * @param {number} total - The total value for percentage calculation
 * @returns {string} Formatted string like "15 (75%)"
 */
export const formatStat = (count, total) => {
  if (total === 0) return `${count} (0%)`;
  const pct = Math.round((count / total) * 100);
  return `${count} (${pct}%)`;
};
