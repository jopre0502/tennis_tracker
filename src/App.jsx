import { useState, useEffect } from 'react';
import ToastContainer from './components/ToastContainer';
import SetupScreen from './components/SetupScreen';
import InfoScreen from './components/InfoScreen';
import ResultsScreen from './components/ResultsScreen';
import MatchScreen from './components/MatchScreen';

const TennolinoTracker = () => {
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
  const [showInfo, setShowInfo] = useState(false);
  const [toasts, setToasts] = useState([]);

  // LocalStorage Auto-Save
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
      }
    }
  }, []);

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
  const getSetTarget = () => currentSet === 3 ? 5 : 7;

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const getServerAfterPoints = (points, initialServer) => {
    const switches = Math.floor(points / 2);
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
    if (newSets.a >= 2) return 'a';
    if (newSets.b >= 2) return 'b';
    return null;
  };

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

  const exportCSV = () => {
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

    const stats = getStats();
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
  };

  const getStatsText = () => {
    const stats = getStats();
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

  const getStats = () => {
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

  const formatStat = (count, total) => {
    if (total === 0) return `${count} (0%)`;
    const pct = Math.round((count / total) * 100);
    return `${count} (${pct}%)`;
  };

  const resetMatch = () => {
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

  // Render
  if (showInfo) {
    return (
      <>
        <InfoScreen onClose={() => setShowInfo(false)} />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  if (editing) {
    return (
      <>
        <SetupScreen
          players={players}
          setPlayers={setPlayers}
          server={server}
          setServer={setServer}
          setSetInitialServer={setSetInitialServer}
          onStart={() => setEditing(false)}
        />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  if (matchOver) {
    const stats = getStats();
    return (
      <>
        <ResultsScreen
          players={players}
          winner={winner}
          sets={sets}
          stats={stats}
          formatStat={formatStat}
          onShowInfo={() => setShowInfo(true)}
          onExportCSV={exportCSV}
          onCopyStats={copyStatsToClipboard}
          onReset={resetMatch}
        />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  return (
    <>
      <MatchScreen
        players={players}
        score={score}
        sets={sets}
        server={server}
        currentSet={currentSet}
        phase={phase}
        isSecondServe={isSecondServe}
        history={history}
        getSetTarget={getSetTarget}
        handleServe={handleServe}
        handleRally={handleRally}
        undoLastPoint={undoLastPoint}
        onShowInfo={() => setShowInfo(true)}
      />
      <ToastContainer toasts={toasts} />
    </>
  );
};

export default TennolinoTracker;
