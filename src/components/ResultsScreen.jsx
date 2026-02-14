import { useState, useMemo } from 'react';
import PlayerAnalysis from './PlayerAnalysis';
import StatsCharts from './StatsCharts';
import packageJson from '../../package.json';
import { useThemeContext } from '../themes/index.jsx';
import { calculateStats } from '../utils/statistics';

const ResultsScreen = ({
  players,
  winner,
  sets,
  history,
  stats,
  formatStat,
  onShowInfo,
  onExportCSV,
  onCopyStats,
  onReset
}) => {
  const [showCharts, setShowCharts] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = Gesamt, 1+ = Satz
  const { currentTheme } = useThemeContext();
  const t = currentTheme.colors;

  // Compute final score for each set from history
  const setScores = [];
  const setNumbers = [];
  if (history && history.length > 0) {
    const uniqueSets = [...new Set(history.map(h => h.set))].sort((a, b) => a - b);
    for (const setNum of uniqueSets) {
      setNumbers.push(setNum);
      const setPoints = history.filter(h => h.set === setNum);
      const lastPoint = setPoints[setPoints.length - 1];
      setScores.push({ set: setNum, a: lastPoint.scoreAfter.a, b: lastPoint.scoreAfter.b });
    }
  }

  // Calculate stats for active tab (0 = full match, 1+ = per set)
  const activeStats = useMemo(() => {
    if (activeTab === 0) return stats;
    const setNum = setNumbers[activeTab - 1];
    if (setNum === undefined) return stats;
    const filteredHistory = history.filter(h => h.set === setNum);
    return calculateStats(filteredHistory);
  }, [activeTab, history, stats, setNumbers]);

  const totalPoints = activeStats.totals.points;

  // Tab labels
  const tabs = [
    { label: 'Gesamt', key: 0 },
    ...setNumbers.map((setNum, i) => ({ label: `Satz ${setNum}`, key: i + 1 }))
  ];

  return (
    <div className={`min-h-screen ${t.bgPrimary} p-4`}>
      <div className={`${t.bgCard} rounded-lg p-6 max-w-md mx-auto shadow-xl`}>
        <h1 className={`text-2xl font-bold text-center mb-2 ${t.primaryText}`}>Match beendet</h1>
        <p className="text-center text-xl mb-6">{players[winner]} gewinnt!</p>

        <div className="text-center text-3xl font-bold mb-2">
          {sets.a} : {sets.b}
        </div>

        {setScores.length > 0 && (
          <div className={`text-center text-sm ${t.textSecondary} mb-4`}>
            {setScores.map((s, i) => (
              <span key={s.set}>
                {i > 0 && '  ·  '}{s.a}:{s.b}
              </span>
            ))}
          </div>
        )}

        <div className={`text-center text-sm ${t.textSecondary} mb-4`}>
          {activeTab === 0 ? 'Gesamtpunkte' : `Punkte Satz ${setNumbers[activeTab - 1]}`}: {totalPoints}
        </div>

        {/* Statistik-Tabs */}
        {setNumbers.length > 1 && (
          <div className="flex gap-1 mb-4 overflow-x-auto" role="tablist" aria-label="Statistik-Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 ${t.primaryRing} ${
                  activeTab === tab.key
                    ? `${t.primary} ${t.textWhite}`
                    : `${t.secondary} ${t.secondaryText} ${t.secondaryHover}`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Player Analysis */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {['a', 'b'].map((p) => (
            <PlayerAnalysis
              key={`${p}-${activeTab}`}
              player={p}
              playerName={players[p]}
              stats={activeStats.players[p]}
              totalPoints={totalPoints}
            />
          ))}
        </div>

        {/* Toggle Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={`px-4 py-2 ${t.secondary} ${t.secondaryText} rounded-lg font-medium ${t.secondaryHover} focus:ring-4 ${t.secondaryRing} focus:outline-none`}
            aria-label={showCharts ? 'Zur Tabellen-Ansicht wechseln' : 'Zur Grafik-Ansicht wechseln'}
          >
            {showCharts ? '📊 → 📋 Tabelle' : '📋 → 📊 Grafiken'}
          </button>
        </div>

        {/* Charts View */}
        {showCharts && <StatsCharts players={players} stats={activeStats} />}

        {/* Table View */}
        {!showCharts && (
          <>
            <table className="w-full text-sm mb-6" role="table" aria-label="Match-Statistiken">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2" scope="col">Statistik</th>
              <th className="text-center py-2" scope="col">{players.a}</th>
              <th className="text-center py-2" scope="col">{players.b}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="py-1">Gewonnene Punkte</td><td className="text-center">{formatStat(activeStats.players.a.pointsWon, totalPoints)}</td><td className="text-center">{formatStat(activeStats.players.b.pointsWon, totalPoints)}</td></tr>
            <tr><td className="py-1">Gewonnene Punkte (Ass + Winner)</td><td className="text-center">{formatStat(activeStats.players.a.pointsWonByWinners, totalPoints)}</td><td className="text-center">{formatStat(activeStats.players.b.pointsWonByWinners, totalPoints)}</td></tr>
            <tr><td className="py-1">Verlorene Punkte (Fehler)</td><td className="text-center">{formatStat(activeStats.players.a.pointsLostByErrors, totalPoints)}</td><td className="text-center">{formatStat(activeStats.players.b.pointsLostByErrors, totalPoints)}</td></tr>
            <tr><td className="py-1">Aufschlagpunkte gewonnen</td><td className="text-center">{formatStat(activeStats.players.a.servicePointsWon, activeStats.players.a.servicePoints)}</td><td className="text-center">{formatStat(activeStats.players.b.servicePointsWon, activeStats.players.b.servicePoints)}</td></tr>
            <tr><td className="py-1">Returnpunkte gewonnen</td><td className="text-center">{formatStat(activeStats.players.a.returnPointsWon, activeStats.players.a.returnPoints)}</td><td className="text-center">{formatStat(activeStats.players.b.returnPointsWon, activeStats.players.b.returnPoints)}</td></tr>
            <tr><td className="py-1">1. Aufschlag Quote</td><td className="text-center">{formatStat(activeStats.players.a.firstServePoints, activeStats.players.a.servicePoints)}</td><td className="text-center">{formatStat(activeStats.players.b.firstServePoints, activeStats.players.b.servicePoints)}</td></tr>
            <tr><td className="py-1">1. Aufschlag gewonnen</td><td className="text-center">{formatStat(activeStats.players.a.firstServePointsWon, activeStats.players.a.firstServePoints)}</td><td className="text-center">{formatStat(activeStats.players.b.firstServePointsWon, activeStats.players.b.firstServePoints)}</td></tr>
            <tr><td className="py-1">2. Aufschlag Quote</td><td className="text-center">{formatStat(activeStats.players.a.secondServePoints, activeStats.players.a.servicePoints)}</td><td className="text-center">{formatStat(activeStats.players.b.secondServePoints, activeStats.players.b.servicePoints)}</td></tr>
            <tr><td className="py-1">2. Aufschlag gewonnen</td><td className="text-center">{formatStat(activeStats.players.a.secondServePointsWon, activeStats.players.a.secondServePoints)}</td><td className="text-center">{formatStat(activeStats.players.b.secondServePointsWon, activeStats.players.b.secondServePoints)}</td></tr>
            <tr><td className="py-1">Asse</td><td className="text-center">{formatStat(activeStats.players.a.aces, totalPoints)}</td><td className="text-center">{formatStat(activeStats.players.b.aces, totalPoints)}</td></tr>
            <tr><td className="py-1">Doppelfehler</td><td className="text-center">{formatStat(activeStats.players.a.doubleFaults, totalPoints)}</td><td className="text-center">{formatStat(activeStats.players.b.doubleFaults, totalPoints)}</td></tr>
            <tr><td className="py-1">Winner</td><td className="text-center">{formatStat(activeStats.players.a.winners, totalPoints)}</td><td className="text-center">{formatStat(activeStats.players.b.winners, totalPoints)}</td></tr>
            <tr><td className="py-1">Erzw. Fehler</td><td className="text-center">{formatStat(activeStats.players.a.forcedErrors, totalPoints)}</td><td className="text-center">{formatStat(activeStats.players.b.forcedErrors, totalPoints)}</td></tr>
            <tr><td className="py-1">Unerzw. Fehler</td><td className="text-center">{formatStat(activeStats.players.a.unforcedErrors, totalPoints)}</td><td className="text-center">{formatStat(activeStats.players.b.unforcedErrors, totalPoints)}</td></tr>
          </tbody>
            </table>

            <div className={`text-xs ${t.textSecondary} mb-6`}>
              Prozent: bei Aufschlag/Return bezogen auf eigene Aufschlag- bzw. Returnpunkte; sonst Anteil aller Punkte
            </div>
          </>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={onShowInfo}
            className={`flex-1 p-3 ${t.info} ${t.textWhite} rounded-lg font-medium focus:ring-4 ${t.infoRing} focus:outline-none ${t.infoHover}`}
            aria-label="Statistik-Erklärungen und Trainer-Metriken anzeigen"
          >
            📊 Statistik-Erklärungen
          </button>
          <button
            onClick={onExportCSV}
            className={`flex-1 p-3 ${t.info} ${t.textWhite} rounded-lg font-medium focus:ring-4 ${t.infoRing} focus:outline-none ${t.infoHover}`}
            aria-label="Match-Daten als CSV-Datei exportieren"
          >
            CSV Export
          </button>
          <button
            onClick={onCopyStats}
            className={`flex-1 p-3 ${t.success} ${t.textWhite} rounded-lg font-medium focus:ring-4 ${t.successRing} focus:outline-none ${t.successHover}`}
            aria-label="Statistiken in Zwischenablage kopieren"
          >
            Stats kopieren
          </button>
          <button
            onClick={onReset}
            className={`flex-1 p-3 ${t.secondary} ${t.secondaryText} rounded-lg font-medium focus:ring-4 ${t.secondaryRing} focus:outline-none ${t.secondaryHover}`}
            aria-label="Neues Match beginnen und aktuelles Match zurücksetzen"
          >
            Neues Match
          </button>
        </div>

        <div className={`text-center mt-4 text-xs ${t.textMuted}`}>
          v{packageJson.version}
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
