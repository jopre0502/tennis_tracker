const SetupScreen = ({ players, setPlayers, server, setServer, setSetInitialServer, onStart }) => {
  return (
    <div className="min-h-screen bg-green-900 p-4 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-green-800">Tennolino Tracker</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spieler A</label>
            <input
              type="text"
              value={players.a}
              onChange={(e) => setPlayers({...players, a: e.target.value})}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spieler B</label>
            <input
              type="text"
              value={players.b}
              onChange={(e) => setPlayers({...players, b: e.target.value})}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Erster Aufschlag</label>
            <div className="flex gap-2">
              <button
                onClick={() => { setServer('a'); setSetInitialServer('a'); }}
                className={`flex-1 p-3 rounded-lg font-medium ${server === 'a' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
              >
                {players.a}
              </button>
              <button
                onClick={() => { setServer('b'); setSetInitialServer('b'); }}
                className={`flex-1 p-3 rounded-lg font-medium ${server === 'b' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
              >
                {players.b}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full mt-6 p-4 bg-green-600 text-white rounded-lg text-xl font-bold"
        >
          Match starten
        </button>

        <div className="text-center mt-4 text-xs text-gray-500">
          v1.8
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
