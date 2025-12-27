import packageJson from '../../package.json';

const SetupScreen = ({ players, setPlayers, server, setServer, setSetInitialServer, onStart, onShowRules }) => {
  return (
    <div className="min-h-screen bg-green-900 p-4 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-green-800">Tennolino Tracker</h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="player-a-input" className="block text-sm font-medium text-gray-700 mb-1">Spieler A</label>
            <input
              id="player-a-input"
              type="text"
              value={players.a}
              onChange={(e) => setPlayers({...players, a: e.target.value})}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-4 focus:ring-green-400 focus:outline-none focus:border-green-600"
              aria-label="Name von Spieler A"
            />
          </div>
          <div>
            <label htmlFor="player-b-input" className="block text-sm font-medium text-gray-700 mb-1">Spieler B</label>
            <input
              id="player-b-input"
              type="text"
              value={players.b}
              onChange={(e) => setPlayers({...players, b: e.target.value})}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-4 focus:ring-green-400 focus:outline-none focus:border-green-600"
              aria-label="Name von Spieler B"
            />
          </div>
          <div>
            <label id="server-selection-label" className="block text-sm font-medium text-gray-700 mb-2">Erster Aufschlag</label>
            <div className="flex gap-2" role="group" aria-labelledby="server-selection-label">
              <button
                onClick={() => { setServer('a'); setSetInitialServer('a'); }}
                className={`flex-1 p-3 rounded-lg font-medium focus:ring-4 focus:ring-green-400 focus:outline-none ${server === 'a' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                aria-pressed={server === 'a'}
                aria-label={`${players.a} beginnt mit Aufschlag`}
              >
                {players.a}
              </button>
              <button
                onClick={() => { setServer('b'); setSetInitialServer('b'); }}
                className={`flex-1 p-3 rounded-lg font-medium focus:ring-4 focus:ring-green-400 focus:outline-none ${server === 'b' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
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
          className="w-full mt-6 p-4 bg-green-600 text-white rounded-lg text-xl font-bold focus:ring-4 focus:ring-green-400 focus:outline-none hover:bg-green-700"
          aria-label="Match mit ausgewählten Spielern starten"
        >
          Match starten
        </button>

        <button
          onClick={onShowRules}
          className="w-full mt-3 p-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 focus:outline-none"
          aria-label="Spielregeln anpassen"
        >
          ⚙️ Spielregeln
        </button>

        <div className="text-center mt-4 text-xs text-gray-500">
          v{packageJson.version}
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
