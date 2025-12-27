import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useThemeContext } from '../themes/index.jsx';

const StatsCharts = ({ players, stats }) => {
  const { currentTheme } = useThemeContext();
  const t = currentTheme.colors;
  // Punkteverteilung Chart Data
  const pointDistributionData = [
    {
      name: 'Asse',
      [players.a]: stats.players.a.aces,
      [players.b]: stats.players.b.aces,
    },
    {
      name: 'Winner',
      [players.a]: stats.players.a.winners,
      [players.b]: stats.players.b.winners,
    },
    {
      name: 'Erzw. Fehler',
      [players.a]: stats.players.a.forcedErrors,
      [players.b]: stats.players.b.forcedErrors,
    },
    {
      name: 'Unerzw. Fehler',
      [players.a]: stats.players.a.unforcedErrors,
      [players.b]: stats.players.b.unforcedErrors,
    },
    {
      name: 'Doppelfehler',
      [players.a]: stats.players.a.doubleFaults,
      [players.b]: stats.players.b.doubleFaults,
    },
  ];

  // Aufschlag-Statistiken Chart Data
  const serveStatsData = [
    {
      name: '1. Aufschlag %',
      [players.a]: stats.players.a.servicePoints > 0
        ? Math.round((stats.players.a.firstServePoints / stats.players.a.servicePoints) * 100)
        : 0,
      [players.b]: stats.players.b.servicePoints > 0
        ? Math.round((stats.players.b.firstServePoints / stats.players.b.servicePoints) * 100)
        : 0,
    },
    {
      name: '1. Aufschlag gewonnen %',
      [players.a]: stats.players.a.firstServePoints > 0
        ? Math.round((stats.players.a.firstServePointsWon / stats.players.a.firstServePoints) * 100)
        : 0,
      [players.b]: stats.players.b.firstServePoints > 0
        ? Math.round((stats.players.b.firstServePointsWon / stats.players.b.firstServePoints) * 100)
        : 0,
    },
    {
      name: '2. Aufschlag gewonnen %',
      [players.a]: stats.players.a.secondServePoints > 0
        ? Math.round((stats.players.a.secondServePointsWon / stats.players.a.secondServePoints) * 100)
        : 0,
      [players.b]: stats.players.b.secondServePoints > 0
        ? Math.round((stats.players.b.secondServePointsWon / stats.players.b.secondServePoints) * 100)
        : 0,
    },
  ];

  // Punktegewinn-Vergleich Chart Data
  const pointWinData = [
    {
      name: 'Aufschlag',
      [players.a]: stats.players.a.servicePointsWon,
      [players.b]: stats.players.b.servicePointsWon,
    },
    {
      name: 'Return',
      [players.a]: stats.players.a.returnPointsWon,
      [players.b]: stats.players.b.returnPointsWon,
    },
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* Punkteverteilung */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className={`text-sm font-bold ${t.textSecondary} mb-3 text-center`}>Punkteverteilung</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={pointDistributionData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey={players.a} fill="#10b981" />
            <Bar dataKey={players.b} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Aufschlag-Statistiken */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className={`text-sm font-bold ${t.textSecondary} mb-3 text-center`}>Aufschlag-Statistiken</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={serveStatsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey={players.a} fill="#10b981" />
            <Bar dataKey={players.b} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Punktegewinn Aufschlag vs Return */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className={`text-sm font-bold ${t.textSecondary} mb-3 text-center`}>Punkte gewonnen: Aufschlag vs Return</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={pointWinData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey={players.a} fill="#10b981" />
            <Bar dataKey={players.b} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsCharts;
