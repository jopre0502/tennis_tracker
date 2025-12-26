const RallyButtons = ({ players, handleRally }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {['a', 'b'].map((p) => (
        <div key={p} className="bg-gray-800 rounded-lg p-2">
          <div className="text-white text-xs mb-2 font-medium text-center">{players[p]}</div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleRally(p, 'winner')}
              className="p-5 bg-green-600 text-white rounded-lg text-lg font-bold active:bg-green-700"
              aria-label={`Winner für ${players[p]}`}
            >
              Winner
            </button>
            <button
              onClick={() => handleRally(p === 'a' ? 'b' : 'a', 'forced_error')}
              className="p-5 bg-orange-600 text-white rounded-lg text-lg font-bold active:bg-orange-700"
              aria-label={`Erzwungener Fehler von ${players[p]}`}
            >
              Erzwungen
            </button>
            <button
              onClick={() => handleRally(p === 'a' ? 'b' : 'a', 'unforced_error')}
              className="p-5 bg-red-600 text-white rounded-lg text-lg font-bold active:bg-red-700"
              aria-label={`Unerzwungener Fehler von ${players[p]}`}
            >
              Unerzw.
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RallyButtons;
