import { useState } from 'react';
import ToastContainer from './components/ToastContainer';
import SetupScreen from './components/SetupScreen';
import InfoScreen from './components/InfoScreen';
import ResultsScreen from './components/ResultsScreen';
import MatchScreen from './components/MatchScreen';
import RulesScreen from './components/RulesScreen';
import { calculateStats, formatStat } from './utils/statistics';
import { useMatchLogic } from './hooks/useMatchLogic';
import { useRules } from './hooks/useRules';

const TennolinoTracker = () => {
  // UI State (nicht im Hook)
  const [showInfo, setShowInfo] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Rules Hook
  const { rules, updateRules } = useRules();

  // Match Logic Hook
  const {
    players,
    setPlayers,
    editing,
    setEditing,
    score,
    sets,
    currentSet,
    server,
    setServer,
    setInitialServer,
    setSetInitialServer,
    phase,
    isSecondServe,
    history,
    matchOver,
    winner,
    getSetTarget,
    handleServe,
    handleRally,
    undoLastPoint,
    resetMatch,
    abortMatch,
    exportCSV,
    copyStatsToClipboard
  } = useMatchLogic(showToast, rules);

  // Render
  if (showRules) {
    return (
      <>
        <RulesScreen
          rules={rules}
          onSave={updateRules}
          onClose={() => setShowRules(false)}
        />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

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
          onShowRules={() => setShowRules(true)}
        />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  if (matchOver) {
    const stats = calculateStats(history);
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
        onAbortMatch={abortMatch}
        onShowInfo={() => setShowInfo(true)}
      />
      <ToastContainer toasts={toasts} />
    </>
  );
};

export default TennolinoTracker;
