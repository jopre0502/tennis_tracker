const PlayerAnalysis = ({ player, playerName, stats, totalPoints }) => {
  const winnerUERate = stats.unforcedErrors > 0
    ? stats.winners / stats.unforcedErrors
    : (stats.winners > 0 ? 10 : 0); // High value when no UE but has winners
  const aggressiveMargin = (stats.winners + stats.forcedErrors) - stats.unforcedErrors;
  const uePercent = Math.round((stats.unforcedErrors / totalPoints) * 100);

  return (
    <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
      <div className="font-bold text-sm mb-2 text-center text-green-800">{playerName}</div>

      <div className="space-y-2 text-xs">
        {/* Unforced Errors */}
        <div className={`p-2 rounded ${uePercent > 30 ? 'bg-red-100' : uePercent > 20 ? 'bg-yellow-100' : 'bg-green-100'}`}>
          <div className="font-semibold">Unerzw. Fehler</div>
          <div className="text-lg font-bold">{stats.unforcedErrors} ({uePercent}%)</div>
          <div className="text-xs text-gray-600">Ziel: &lt;30%</div>
        </div>

        {/* Winner:UE Ratio */}
        <div className={`p-2 rounded ${winnerUERate < 0.8 ? 'bg-red-100' : winnerUERate < 1 ? 'bg-yellow-100' : 'bg-green-100'}`}>
          <div className="font-semibold">Winner:Unerzw. Fehler</div>
          <div className="text-lg font-bold">{stats.winners}:{stats.unforcedErrors}</div>
          <div className="text-xs text-gray-600">Ziel: ≥1:1</div>
        </div>

        {/* Aggressive Margin */}
        <div className={`p-2 rounded ${aggressiveMargin < 0 ? 'bg-red-100' : aggressiveMargin < 3 ? 'bg-yellow-100' : 'bg-green-100'}`}>
          <div className="font-semibold">Aggressivitäts-Saldo</div>
          <div className="text-lg font-bold">{aggressiveMargin > 0 ? '+' : ''}{aggressiveMargin}</div>
          <div className="text-xs text-gray-600">Ziel: &gt;0</div>
        </div>

        {/* Points lost by errors */}
        <div className="p-2 rounded bg-gray-100">
          <div className="font-semibold">Punkte verloren</div>
          <div className="text-sm">durch Fehler: {stats.pointsLostByErrors} ({Math.round((stats.pointsLostByErrors / stats.pointsLost) * 100)}%)</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerAnalysis;
