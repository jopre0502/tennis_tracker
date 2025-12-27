import { useState, useEffect } from 'react';
import { calculateStats, formatStat } from '../utils/statistics';

/**
 * Custom Hook für Match-Logik und State-Management
 * @param {Function} showToast - Callback function to show toast notifications
 * @param {Object} rules - Game rules configuration
 * @returns {Object} Match state and functions
 */
export const useMatchLogic = (showToast, rules) => {
  // State
  const [players, setPlayers] = useState({ a: 'Spieler A', b: 'Spieler B' });
  const [editing, setEditing] = useState(true);
  const [score, setScore] = useState({ a: 0, b: 0 });
  const [sets, setSets] = useState({ a: 0, b: 0 });
  const [currentSet, setCurrentSet] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [server, setServer] = useState('a');
  const [setInitialServer, setSetInitialServer] = useState('a');
  const [phase, setPhase] = useState('serve');
  const [isSecondServe, setIsSecondServe] = useState(false);
  const [history, setHistory] = useState([]);
  const [matchOver, setMatchOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // LocalStorage Auto-Save - Load on mount
  useEffect(() => {
    const savedState = localStorage.getItem('tennolino-match-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setPlayers(parsed.players || { a: 'Spieler A', b: 'Spieler B' });
        setEditing(parsed.editing ?? true);
        setScore(parsed.score || { a: 0, b: 0 });
        setSets(parsed.sets || { a: 0, b: 0 });
        setCurrentSet(parsed.currentSet || 1);
        setTotalPoints(parsed.totalPoints || 0);
        setServer(parsed.server || 'a');
        setSetInitialServer(parsed.setInitialServer || 'a');
        setPhase(parsed.phase || 'serve');
        setIsSecondServe(parsed.isSecondServe || false);
        setHistory(parsed.history || []);
        setMatchOver(parsed.matchOver || false);
        setWinner(parsed.winner || null);
      } catch (e) {
        console.error('Failed to load saved state:', e);
        localStorage.removeItem('tennolino-match-state');
        showToast('Gespeicherter Stand konnte nicht geladen werden. Neues Match gestartet.', 'error');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LocalStorage Auto-Save - Save on state change
  useEffect(() => {
    const stateToSave = {
      players,
      editing,
      score,
      sets,
      currentSet,
      totalPoints,
      server,
      setInitialServer,
      phase,
      isSecondServe,
      history,
      matchOver,
      winner
    };
    localStorage.setItem('tennolino-match-state', JSON.stringify(stateToSave));
  }, [players, editing, score, sets, currentSet, totalPoints, server, setInitialServer, phase, isSecondServe, history, matchOver, winner]);

  // Helper Functions
  const getSetTarget = () => {
    const setIndex = currentSet - 1;
    return rules.setTargets[setIndex] || rules.setTargets[rules.setTargets.length - 1];
  };

  const getServerAfterPoints = (points, initialServer) => {
    const switches = Math.floor(points / rules.serveChangeInterval);
    return switches % 2 === 0 ? initialServer : (initialServer === 'a' ? 'b' : 'a');
  };

  const addPointToHistory = (pointData) => {
    setHistory(prev => [...prev, {
      ...pointData,
      set: currentSet,
      setInitialServer: setInitialServer,
      scoreAfter: { ...score, [pointData.winner]: score[pointData.winner] + 1 },
      setsAfter: { ...sets },
      timestamp: new Date().toISOString()
    }]);
  };

  const checkSetWin = (newScore) => {
    const target = getSetTarget();
    if (newScore.a >= target) return 'a';
    if (newScore.b >= target) return 'b';
    return null;
  };

  const checkMatchWin = (newSets) => {
    const setsNeeded = Math.ceil(rules.bestOf / 2);
    if (newSets.a >= setsNeeded) return 'a';
    if (newSets.b >= setsNeeded) return 'b';
    return null;
  };

  // Main Game Logic
  const awardPoint = (pointWinner, type, details) => {
    const pointData = {
      winner: pointWinner,
      type,
      details,
      server,
      isSecondServe
    };
    addPointToHistory(pointData);

    const newScore = { ...score, [pointWinner]: score[pointWinner] + 1 };
    const newTotalPoints = totalPoints + 1;

    const setWinnerPlayer = checkSetWin(newScore);

    if (setWinnerPlayer) {
      const newSets = { ...sets, [setWinnerPlayer]: sets[setWinnerPlayer] + 1 };
      setSets(newSets);

      const matchWinnerPlayer = checkMatchWin(newSets);
      if (matchWinnerPlayer) {
        setMatchOver(true);
        setWinner(matchWinnerPlayer);
        setScore(newScore);
        return;
      }

      setScore({ a: 0, b: 0 });
      setCurrentSet(currentSet + 1);
      setTotalPoints(0);
      const newSetInitialServer = setInitialServer === 'a' ? 'b' : 'a';
      setSetInitialServer(newSetInitialServer);
      setServer(newSetInitialServer);
    } else {
      setScore(newScore);
      setTotalPoints(newTotalPoints);
      setServer(getServerAfterPoints(newTotalPoints, setInitialServer));
    }

    setPhase('serve');
    setIsSecondServe(false);
  };

  const handleServe = (result) => {
    if (result === 'ace') {
      awardPoint(server, 'ace', { serve: isSecondServe ? 2 : 1 });
    } else if (result === 'fault') {
      if (isSecondServe) {
        const receiver = server === 'a' ? 'b' : 'a';
        awardPoint(receiver, 'double_fault', {});
      } else {
        setIsSecondServe(true);
      }
    } else if (result === 'in_play') {
      setPhase('rally');
    }
  };

  const handleRally = (pointWinner, type) => {
    awardPoint(pointWinner, type, { serve: isSecondServe ? 2 : 1 });
  };

  // Undo Functionality
  const undoLastPoint = () => {
    if (history.length === 0) return;

    const newHistory = [...history];
    const lastPoint = newHistory.pop();
    setHistory(newHistory);

    if (newHistory.length === 0) {
      setScore({ a: 0, b: 0 });
      setSets({ a: 0, b: 0 });
      setCurrentSet(1);
      setTotalPoints(0);
      setSetInitialServer(lastPoint.setInitialServer);
      setServer(lastPoint.setInitialServer);
    } else {
      const prevPoint = newHistory[newHistory.length - 1];
      setScore(prevPoint.scoreAfter);
      setSets(prevPoint.setsAfter);
      setCurrentSet(prevPoint.set);
      setSetInitialServer(prevPoint.setInitialServer);

      const pointsInSet = newHistory.filter(h => h.set === prevPoint.set).length;
      setTotalPoints(pointsInSet);
      setServer(getServerAfterPoints(pointsInSet, prevPoint.setInitialServer));
    }

    setPhase('serve');
    setIsSecondServe(false);
    setMatchOver(false);
    setWinner(null);
  };

  // Reset Match
  const resetMatch = () => {
    setPlayers({ a: 'Spieler A', b: 'Spieler B' });
    setScore({ a: 0, b: 0 });
    setSets({ a: 0, b: 0 });
    setCurrentSet(1);
    setTotalPoints(0);
    setServer('a');
    setSetInitialServer('a');
    setPhase('serve');
    setIsSecondServe(false);
    setHistory([]);
    setMatchOver(false);
    setWinner(null);
    setEditing(true);
    localStorage.removeItem('tennolino-match-state');
  };

  // Abort Match
  const abortMatch = () => {
    if (window.confirm('Match wirklich abbrechen? Der gesamte Fortschritt geht verloren.')) {
      resetMatch();
      showToast('Match abgebrochen', 'error');
    }
  };

  // Export Functions
  const exportCSV = () => {
    try {
      const headers = ['Set', 'Punktestand A', 'Punktestand B', 'Aufschlag', 'Typ', 'Gewinner', 'Zeitstempel'];
      const rows = history.map(h => [
        h.set,
        h.scoreAfter.a,
        h.scoreAfter.b,
        h.server === 'a' ? players.a : players.b,
        h.type,
        h.winner === 'a' ? players.a : players.b,
        h.timestamp
      ]);

      const stats = calculateStats(history);
      const totalPoints = stats.totals.points;
      const statRows = [
        [],
        ['Statistik', players.a, players.b],
        ['Gewonnene Punkte', formatStat(stats.players.a.pointsWon, totalPoints), formatStat(stats.players.b.pointsWon, totalPoints)],
        ['Gewonnene Punkte (Ass + Winner)', formatStat(stats.players.a.pointsWonByWinners, totalPoints), formatStat(stats.players.b.pointsWonByWinners, totalPoints)],
        ['Verlorene Punkte (Fehler)', formatStat(stats.players.a.pointsLostByErrors, totalPoints), formatStat(stats.players.b.pointsLostByErrors, totalPoints)],
        ['Aufschlagpunkte gewonnen', formatStat(stats.players.a.servicePointsWon, stats.players.a.servicePoints), formatStat(stats.players.b.servicePointsWon, stats.players.b.servicePoints)],
        ['Returnpunkte gewonnen', formatStat(stats.players.a.returnPointsWon, stats.players.a.returnPoints), formatStat(stats.players.b.returnPointsWon, stats.players.b.returnPoints)],
        ['1. Aufschlag Quote', formatStat(stats.players.a.firstServePoints, stats.players.a.servicePoints), formatStat(stats.players.b.firstServePoints, stats.players.b.servicePoints)],
        ['1. Aufschlag gewonnen', formatStat(stats.players.a.firstServePointsWon, stats.players.a.firstServePoints), formatStat(stats.players.b.firstServePointsWon, stats.players.b.firstServePoints)],
        ['2. Aufschlag Quote', formatStat(stats.players.a.secondServePoints, stats.players.a.servicePoints), formatStat(stats.players.b.secondServePoints, stats.players.b.servicePoints)],
        ['2. Aufschlag gewonnen', formatStat(stats.players.a.secondServePointsWon, stats.players.a.secondServePoints), formatStat(stats.players.b.secondServePointsWon, stats.players.b.secondServePoints)],
        ['Asse', formatStat(stats.players.a.aces, totalPoints), formatStat(stats.players.b.aces, totalPoints)],
        ['Doppelfehler', formatStat(stats.players.a.doubleFaults, totalPoints), formatStat(stats.players.b.doubleFaults, totalPoints)],
        ['Winner', formatStat(stats.players.a.winners, totalPoints), formatStat(stats.players.b.winners, totalPoints)],
        ['Erzw. Fehler', formatStat(stats.players.a.forcedErrors, totalPoints), formatStat(stats.players.b.forcedErrors, totalPoints)],
        ['Unerzw. Fehler', formatStat(stats.players.a.unforcedErrors, totalPoints), formatStat(stats.players.b.unforcedErrors, totalPoints)],
        ['Hinweis', 'Prozent: bei Aufschlag/Return bezogen auf eigene Aufschlag- bzw. Returnpunkte; sonst Anteil aller Punkte']
      ].map(row => row.concat(Array(headers.length - row.length).fill('')));

      const csv = [headers, ...rows, ...statRows].map(row => row.join(';')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tennolino_${players.a}_vs_${players.b}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('CSV erfolgreich exportiert');
    } catch (err) {
      console.error('CSV Export failed:', err);
      showToast('Export fehlgeschlagen. Bitte erneut versuchen.', 'error');
    }
  };

  const getStatsText = () => {
    const stats = calculateStats(history);
    const totalPoints = stats.totals.points;
    const lines = [
      `Match: ${players.a} vs ${players.b}`,
      `Ergebnis: ${sets.a} : ${sets.b}`,
      `Gewinner: ${winner ? players[winner] : '-'}`,
      `Gesamtpunkte: ${totalPoints}`,
      '',
      'Gesamt',
      `Gewinnschläge (Ass + Winner): ${formatStat(stats.totals.winningShots, totalPoints)}`,
      `Fehlerpunkte (Doppelfehler + Erzw. + Unerzw.): ${formatStat(stats.totals.errorPoints, totalPoints)}`,
      '',
      players.a,
      `Gewonnene Punkte: ${formatStat(stats.players.a.pointsWon, totalPoints)}`,
      `Gewonnene Punkte (Ass + Winner): ${formatStat(stats.players.a.pointsWonByWinners, totalPoints)}`,
      `Verlorene Punkte (Fehler): ${formatStat(stats.players.a.pointsLostByErrors, totalPoints)}`,
      `Aufschlagpunkte gewonnen: ${formatStat(stats.players.a.servicePointsWon, stats.players.a.servicePoints)}`,
      `Returnpunkte gewonnen: ${formatStat(stats.players.a.returnPointsWon, stats.players.a.returnPoints)}`,
      `1. Aufschlag Quote: ${formatStat(stats.players.a.firstServePoints, stats.players.a.servicePoints)}`,
      `1. Aufschlag gewonnen: ${formatStat(stats.players.a.firstServePointsWon, stats.players.a.firstServePoints)}`,
      `2. Aufschlag Quote: ${formatStat(stats.players.a.secondServePoints, stats.players.a.servicePoints)}`,
      `2. Aufschlag gewonnen: ${formatStat(stats.players.a.secondServePointsWon, stats.players.a.secondServePoints)}`,
      `Asse: ${formatStat(stats.players.a.aces, totalPoints)}`,
      `Doppelfehler: ${formatStat(stats.players.a.doubleFaults, totalPoints)}`,
      `Winner: ${formatStat(stats.players.a.winners, totalPoints)}`,
      `Erzw. Fehler: ${formatStat(stats.players.a.forcedErrors, totalPoints)}`,
      `Unerzw. Fehler: ${formatStat(stats.players.a.unforcedErrors, totalPoints)}`,
      '',
      players.b,
      `Gewonnene Punkte: ${formatStat(stats.players.b.pointsWon, totalPoints)}`,
      `Gewonnene Punkte (Ass + Winner): ${formatStat(stats.players.b.pointsWonByWinners, totalPoints)}`,
      `Verlorene Punkte (Fehler): ${formatStat(stats.players.b.pointsLostByErrors, totalPoints)}`,
      `Aufschlagpunkte gewonnen: ${formatStat(stats.players.b.servicePointsWon, stats.players.b.servicePoints)}`,
      `Returnpunkte gewonnen: ${formatStat(stats.players.b.returnPointsWon, stats.players.b.returnPoints)}`,
      `1. Aufschlag Quote: ${formatStat(stats.players.b.firstServePoints, stats.players.b.servicePoints)}`,
      `1. Aufschlag gewonnen: ${formatStat(stats.players.b.firstServePointsWon, stats.players.b.firstServePoints)}`,
      `2. Aufschlag Quote: ${formatStat(stats.players.b.secondServePoints, stats.players.b.servicePoints)}`,
      `2. Aufschlag gewonnen: ${formatStat(stats.players.b.secondServePointsWon, stats.players.b.secondServePoints)}`,
      `Asse: ${formatStat(stats.players.b.aces, totalPoints)}`,
      `Doppelfehler: ${formatStat(stats.players.b.doubleFaults, totalPoints)}`,
      `Winner: ${formatStat(stats.players.b.winners, totalPoints)}`,
      `Erzw. Fehler: ${formatStat(stats.players.b.forcedErrors, totalPoints)}`,
      `Unerzw. Fehler: ${formatStat(stats.players.b.unforcedErrors, totalPoints)}`,
      '',
      'Prozent: bei Aufschlag/Return bezogen auf eigene Aufschlag- bzw. Returnpunkte; sonst Anteil aller Punkte'
    ];

    return lines.join('\n');
  };

  const copyStatsToClipboard = async () => {
    const text = getStatsText();
    try {
      await navigator.clipboard.writeText(text);
      showToast('Statistik in die Zwischenablage kopiert');
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) {
        showToast('Statistik in die Zwischenablage kopiert');
      } else {
        showToast('Kopieren fehlgeschlagen. Bitte erneut versuchen', 'error');
      }
    }
  };

  // Return all state and functions
  return {
    // State
    players,
    setPlayers,
    editing,
    setEditing,
    score,
    sets,
    currentSet,
    totalPoints,
    server,
    setServer,
    setInitialServer,
    setSetInitialServer,
    phase,
    isSecondServe,
    history,
    matchOver,
    winner,

    // Functions
    getSetTarget,
    handleServe,
    handleRally,
    undoLastPoint,
    resetMatch,
    abortMatch,
    exportCSV,
    copyStatsToClipboard
  };
};
