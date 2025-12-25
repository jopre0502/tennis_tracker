const ServeButtons = ({ players, server, handleServe }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {['a', 'b'].map((p) => (
        <div key={p} className="bg-gray-800 rounded-lg p-2">
          <div className="text-white text-xs mb-1 font-medium text-center">
            {players[p]}
          </div>
          <div className="text-white text-xs mb-2 text-center text-gray-400">
            {server === p ? '(Aufschlag)' : '(Rückschlag)'}
          </div>
          {server === p ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleServe('ace')}
                className="p-5 bg-green-600 text-white rounded-lg text-lg font-bold active:bg-green-700"
              >
                Ass
              </button>
              <button
                onClick={() => handleServe('fault')}
                className="p-5 bg-red-600 text-white rounded-lg text-lg font-bold active:bg-red-700"
              >
                Fehler
              </button>
              <button
                onClick={() => handleServe('in_play')}
                className="p-5 bg-blue-600 text-white rounded-lg text-lg font-bold active:bg-blue-700"
              >
                Im Spiel
              </button>
            </div>
          ) : (
            <div className="h-48"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ServeButtons;
