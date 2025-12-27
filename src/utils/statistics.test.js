import { describe, it, expect } from 'vitest';
import { calculateStats, formatStat } from './statistics';

describe('statistics.js', () => {
  describe('formatStat', () => {
    it('should format stat with count and percentage', () => {
      expect(formatStat(15, 20)).toBe('15 (75%)');
    });

    it('should handle zero total', () => {
      expect(formatStat(0, 0)).toBe('0 (0%)');
    });

    it('should round percentages correctly', () => {
      expect(formatStat(1, 3)).toBe('1 (33%)');
      expect(formatStat(2, 3)).toBe('2 (67%)');
    });

    it('should handle 100%', () => {
      expect(formatStat(10, 10)).toBe('10 (100%)');
    });
  });

  describe('calculateStats', () => {
    it('should return empty stats for empty history', () => {
      const stats = calculateStats([]);

      expect(stats.totals.points).toBe(0);
      expect(stats.players.a.aces).toBe(0);
      expect(stats.players.b.aces).toBe(0);
    });

    it('should count aces correctly', () => {
      const history = [
        { winner: 'a', type: 'ace', server: 'a', isSecondServe: false },
        { winner: 'b', type: 'ace', server: 'b', isSecondServe: false },
        { winner: 'a', type: 'ace', server: 'a', isSecondServe: true }
      ];

      const stats = calculateStats(history);

      expect(stats.players.a.aces).toBe(2);
      expect(stats.players.b.aces).toBe(1);
      expect(stats.totals.aces).toBe(3);
    });

    it('should count double faults correctly', () => {
      const history = [
        { winner: 'b', type: 'double_fault', server: 'a', isSecondServe: true },
        { winner: 'a', type: 'double_fault', server: 'b', isSecondServe: true }
      ];

      const stats = calculateStats(history);

      expect(stats.players.a.doubleFaults).toBe(1);
      expect(stats.players.b.doubleFaults).toBe(1);
      expect(stats.totals.doubleFaults).toBe(2);
    });

    it('should count winners correctly', () => {
      const history = [
        { winner: 'a', type: 'winner', server: 'a', isSecondServe: false },
        { winner: 'b', type: 'winner', server: 'a', isSecondServe: false },
        { winner: 'a', type: 'winner', server: 'b', isSecondServe: false }
      ];

      const stats = calculateStats(history);

      expect(stats.players.a.winners).toBe(2);
      expect(stats.players.b.winners).toBe(1);
      expect(stats.totals.winners).toBe(3);
    });

    it('should count forced errors correctly', () => {
      const history = [
        { winner: 'a', type: 'forced_error', server: 'a', isSecondServe: false },
        { winner: 'b', type: 'forced_error', server: 'a', isSecondServe: false }
      ];

      const stats = calculateStats(history);

      // Forced error is counted for the loser (opponent of winner)
      expect(stats.players.b.forcedErrors).toBe(1);
      expect(stats.players.a.forcedErrors).toBe(1);
      expect(stats.totals.forcedErrors).toBe(2);
    });

    it('should count unforced errors correctly', () => {
      const history = [
        { winner: 'a', type: 'unforced_error', server: 'a', isSecondServe: false },
        { winner: 'b', type: 'unforced_error', server: 'a', isSecondServe: false }
      ];

      const stats = calculateStats(history);

      // Unforced error is counted for the loser (opponent of winner)
      expect(stats.players.b.unforcedErrors).toBe(1);
      expect(stats.players.a.unforcedErrors).toBe(1);
      expect(stats.totals.unforcedErrors).toBe(2);
    });

    it('should track service points correctly', () => {
      const history = [
        { winner: 'a', type: 'ace', server: 'a', isSecondServe: false },
        { winner: 'b', type: 'winner', server: 'a', isSecondServe: false },
        { winner: 'b', type: 'ace', server: 'b', isSecondServe: false }
      ];

      const stats = calculateStats(history);

      expect(stats.players.a.servicePoints).toBe(2); // a served 2 points
      expect(stats.players.b.servicePoints).toBe(1); // b served 1 point
      expect(stats.players.a.servicePointsWon).toBe(1); // a won 1 service point
      expect(stats.players.b.servicePointsWon).toBe(1); // b won 1 service point
    });

    it('should track return points correctly', () => {
      const history = [
        { winner: 'a', type: 'ace', server: 'a', isSecondServe: false },
        { winner: 'b', type: 'winner', server: 'a', isSecondServe: false },
        { winner: 'b', type: 'ace', server: 'b', isSecondServe: false }
      ];

      const stats = calculateStats(history);

      expect(stats.players.a.returnPoints).toBe(1); // a returned 1 point (when b served)
      expect(stats.players.b.returnPoints).toBe(2); // b returned 2 points (when a served)
      expect(stats.players.a.returnPointsWon).toBe(0); // a won 0 return points
      expect(stats.players.b.returnPointsWon).toBe(1); // b won 1 return point
    });

    it('should track first and second serve correctly', () => {
      const history = [
        { winner: 'a', type: 'ace', server: 'a', isSecondServe: false },
        { winner: 'a', type: 'winner', server: 'a', isSecondServe: true },
        { winner: 'b', type: 'winner', server: 'a', isSecondServe: false }
      ];

      const stats = calculateStats(history);

      expect(stats.players.a.firstServePoints).toBe(2);
      expect(stats.players.a.secondServePoints).toBe(1);
      expect(stats.players.a.firstServePointsWon).toBe(1);
      expect(stats.players.a.secondServePointsWon).toBe(1);
    });

    it('should calculate derived stats correctly', () => {
      const history = [
        { winner: 'a', type: 'ace', server: 'a', isSecondServe: false },
        { winner: 'a', type: 'winner', server: 'b', isSecondServe: false },
        { winner: 'a', type: 'double_fault', server: 'b', isSecondServe: true }
      ];

      const stats = calculateStats(history);

      expect(stats.players.a.pointsWon).toBe(3);
      expect(stats.players.a.pointsLost).toBe(0);
      expect(stats.players.a.pointsWonByWinners).toBe(2); // ace + winner
      expect(stats.players.b.pointsLostByErrors).toBe(1); // double fault
    });

    it('should calculate totals correctly', () => {
      const history = [
        { winner: 'a', type: 'ace', server: 'a', isSecondServe: false },
        { winner: 'a', type: 'winner', server: 'b', isSecondServe: false },
        { winner: 'b', type: 'forced_error', server: 'a', isSecondServe: false },
        { winner: 'b', type: 'unforced_error', server: 'a', isSecondServe: true }
      ];

      const stats = calculateStats(history);

      expect(stats.totals.points).toBe(4);
      expect(stats.totals.winningShots).toBe(2); // ace + winner
      expect(stats.totals.errorPoints).toBe(2); // forced + unforced
    });

    it('should handle complex match scenario', () => {
      const history = [
        // Set 1: Player A serves
        { winner: 'a', type: 'ace', server: 'a', isSecondServe: false, set: 1 },
        { winner: 'b', type: 'winner', server: 'a', isSecondServe: false, set: 1 },
        // Player B serves
        { winner: 'b', type: 'ace', server: 'b', isSecondServe: false, set: 1 },
        { winner: 'a', type: 'winner', server: 'b', isSecondServe: true, set: 1 },
        // Player A serves
        { winner: 'a', type: 'winner', server: 'a', isSecondServe: false, set: 1 },
        { winner: 'b', type: 'unforced_error', server: 'a', isSecondServe: false, set: 1 }
      ];

      const stats = calculateStats(history);

      expect(stats.totals.points).toBe(6);
      expect(stats.players.a.pointsWon).toBe(3);
      expect(stats.players.b.pointsWon).toBe(3);
      expect(stats.players.a.aces).toBe(1);
      expect(stats.players.b.aces).toBe(1);
      expect(stats.players.a.servicePoints).toBe(4);
      expect(stats.players.b.servicePoints).toBe(2);
    });
  });
});
