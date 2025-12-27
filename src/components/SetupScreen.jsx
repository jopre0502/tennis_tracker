import packageJson from '../../package.json';
import { useThemeContext } from '../themes/index.jsx';

const SetupScreen = ({ players, setPlayers, server, setServer, setSetInitialServer, onStart, onShowRules }) => {
  const { currentTheme } = useThemeContext();
  const t = currentTheme.colors; // Shorthand

  return (
    <div className={`min-h-screen ${t.bgPrimary} p-4 flex flex-col items-center justify-center`}>
      <div className={`${t.bgCard} rounded-lg p-6 w-full max-w-md shadow-xl`}>
        <h1 className={`text-2xl font-bold text-center mb-6 ${t.primaryText}`}>Tennolino Tracker</h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="player-a-input" className={`block text-sm font-medium ${t.textSecondary} mb-1`}>Spieler A</label>
            <input
              id="player-a-input"
              type="text"
              value={players.a}
              onChange={(e) => setPlayers({...players, a: e.target.value})}
              className={`w-full p-3 border-2 ${t.border} rounded-lg text-lg focus:ring-4 ${t.primaryRing} focus:outline-none ${t.borderFocus}`}
              aria-label="Name von Spieler A"
            />
          </div>
          <div>
            <label htmlFor="player-b-input" className={`block text-sm font-medium ${t.textSecondary} mb-1`}>Spieler B</label>
            <input
              id="player-b-input"
              type="text"
              value={players.b}
              onChange={(e) => setPlayers({...players, b: e.target.value})}
              className={`w-full p-3 border-2 ${t.border} rounded-lg text-lg focus:ring-4 ${t.primaryRing} focus:outline-none ${t.borderFocus}`}
              aria-label="Name von Spieler B"
            />
          </div>
          <div>
            <label id="server-selection-label" className={`block text-sm font-medium ${t.textSecondary} mb-2`}>Erster Aufschlag</label>
            <div className="flex gap-2" role="group" aria-labelledby="server-selection-label">
              <button
                onClick={() => { setServer('a'); setSetInitialServer('a'); }}
                className={`flex-1 p-3 rounded-lg font-medium focus:ring-4 ${t.primaryRing} focus:outline-none ${server === 'a' ? `${t.primary} ${t.textWhite}` : t.secondary}`}
                aria-pressed={server === 'a'}
                aria-label={`${players.a} beginnt mit Aufschlag`}
              >
                {players.a}
              </button>
              <button
                onClick={() => { setServer('b'); setSetInitialServer('b'); }}
                className={`flex-1 p-3 rounded-lg font-medium focus:ring-4 ${t.primaryRing} focus:outline-none ${server === 'b' ? `${t.primary} ${t.textWhite}` : t.secondary}`}
                aria-pressed={server === 'b'}
                aria-label={`${players.b} beginnt mit Aufschlag`}
              >
                {players.b}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className={`w-full mt-6 p-4 ${t.primary} ${t.textWhite} rounded-lg text-xl font-bold focus:ring-4 ${t.primaryRing} focus:outline-none ${t.primaryHover}`}
          aria-label="Match mit ausgewählten Spielern starten"
        >
          Match starten
        </button>

        <button
          onClick={onShowRules}
          className={`w-full mt-3 p-3 ${t.secondary} ${t.secondaryText} rounded-lg font-medium ${t.secondaryHover} focus:ring-4 ${t.secondaryRing} focus:outline-none`}
          aria-label="Spielregeln anpassen"
        >
          ⚙️ Spielregeln
        </button>

        <div className={`text-center mt-4 text-xs ${t.textMuted}`}>
          v{packageJson.version}
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
