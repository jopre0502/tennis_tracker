import { useState } from 'react';
import PlayerAnalysis from './PlayerAnalysis';
import StatsCharts from './StatsCharts';
import packageJson from '../../package.json';
import { useThemeContext } from '../themes/index.jsx';

const ResultsScreen = ({
  players,
  winner,
  sets,
  stats,
  formatStat,
  onShowInfo,
  onExportCSV,
  onCopyStats,
  onReset
}) => {
  const totalPoints = stats.totals.points;
  const [showCharts, setShowCharts] = useState(true);
  const { currentTheme } = useThemeContext();
  const t = currentTheme.colors;

  return (
    <div className={`min-h-screen ${t.bgPrimary} p-4`}>
      <div className={`${t.bgCard} rounded-lg p-6 max-w-md mx-auto shadow-xl`}>
        <h1 className={`text-2xl font-bold text-center mb-2 ${t.primaryText}`}>Match beendet</h1>
        <p className="text-center text-xl mb-6">{players[winner]} gewinnt!</p>

        <div className="text-center text-3xl font-bold mb-6">
          {sets.a} : {sets.b}
        </div>

        <div className={`text-center text-sm ${t.textSecondary} mb-4`}>
          Gesamtpunkte: {totalPoints}
        </div>

        {/* Player Analysis */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {['a', 'b'].map((p) => (
            <PlayerAnalysis
              key={p}
              player={p}
              playerName={players[p]}
              stats={stats.players[p]}
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
        {showCharts && <StatsCharts players={players} stats={stats} />}

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
            <tr><td className="py-1">Gewonnene Punkte</td><td className="text-center">{formatStat(stats.players.a.pointsWon, totalPoints)}</td><td className="text-center">{formatStat(stats.players.b.pointsWon, totalPoints)}</td></tr>
            <tr><td className="py-1">Gewonnene Punkte (Ass + Winner)</td><td className="text-center">{formatStat(stats.players.a.pointsWonByWinners, totalPoints)}</td><td className="text-center">{formatStat(stats.players.b.pointsWonByWinners, totalPoints)}</td></tr>
            <tr><td className="py-1">Verlorene Punkte (Fehler)</td><td className="text-center">{formatStat(stats.players.a.pointsLostByErrors, totalPoints)}</td><td className="text-center">{formatStat(stats.players.b.pointsLostByErrors, totalPoints)}</td></tr>
            <tr><td className="py-1">Aufschlagpunkte gewonnen</td><td className="text-center">{formatStat(stats.players.a.servicePointsWon, stats.players.a.servicePoints)}</td><td className="text-center">{formatStat(stats.players.b.servicePointsWon, stats.players.b.servicePoints)}</td></tr>
            <tr><td className="py-1">Returnpunkte gewonnen</td><td className="text-center">{formatStat(stats.players.a.returnPointsWon, stats.players.a.returnPoints)}</td><td className="text-center">{formatStat(stats.players.b.returnPointsWon, stats.players.b.returnPoints)}</td></tr>
            <tr><td className="py-1">1. Aufschlag Quote</td><td className="text-center">{formatStat(stats.players.a.firstServePoints, stats.players.a.servicePoints)}</td><td className="text-center">{formatStat(stats.players.b.firstServePoints, stats.players.b.servicePoints)}</td></tr>
            <tr><td className="py-1">1. Aufschlag gewonnen</td><td className="text-center">{formatStat(stats.players.a.firstServePointsWon, stats.players.a.firstServePoints)}</td><td className="text-center">{formatStat(stats.players.b.firstServePointsWon, stats.players.b.firstServePoints)}</td></tr>
            <tr><td className="py-1">2. Aufschlag Quote</td><td className="text-center">{formatStat(stats.players.a.secondServePoints, stats.players.a.servicePoints)}</td><td className="text-center">{formatStat(stats.players.b.secondServePoints, stats.players.b.servicePoints)}</td></tr>
            <tr><td className="py-1">2. Aufschlag gewonnen</td><td className="text-center">{formatStat(stats.players.a.secondServePointsWon, stats.players.a.secondServePoints)}</td><td className="text-center">{formatStat(stats.players.b.secondServePointsWon, stats.players.b.secondServePoints)}</td></tr>
            <tr><td className="py-1">Asse</td><td className="text-center">{formatStat(stats.players.a.aces, totalPoints)}</td><td className="text-center">{formatStat(stats.players.b.aces, totalPoints)}</td></tr>
            <tr><td className="py-1">Doppelfehler</td><td className="text-center">{formatStat(stats.players.a.doubleFaults, totalPoints)}</td><td className="text-center">{formatStat(stats.players.b.doubleFaults, totalPoints)}</td></tr>
            <tr><td className="py-1">Winner</td><td className="text-center">{formatStat(stats.players.a.winners, totalPoints)}</td><td className="text-center">{formatStat(stats.players.b.winners, totalPoints)}</td></tr>
            <tr><td className="py-1">Erzw. Fehler</td><td className="text-center">{formatStat(stats.players.a.forcedErrors, totalPoints)}</td><td className="text-center">{formatStat(stats.players.b.forcedErrors, totalPoints)}</td></tr>
            <tr><td className="py-1">Unerzw. Fehler</td><td className="text-center">{formatStat(stats.players.a.unforcedErrors, totalPoints)}</td><td className="text-center">{formatStat(stats.players.b.unforcedErrors, totalPoints)}</td></tr>
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
