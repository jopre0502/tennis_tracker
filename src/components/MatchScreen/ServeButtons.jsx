import { useThemeContext } from '../../themes/index.jsx';

const ServeButtons = ({ players, server, handleServe }) => {
  const { currentTheme } = useThemeContext();
  const t = currentTheme.colors;

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {['a', 'b'].map((p) => (
        <div key={p} className={`${t.bgCardDark} rounded-lg p-2`}>
          <div className={`${t.textWhite} text-xs mb-1 font-medium text-center`}>
            {players[p]}
          </div>
          <div className={`${t.textWhite} text-xs mb-2 text-center ${t.textMuted}`}>
            {server === p ? '(Aufschlag)' : '(Rückschlag)'}
          </div>
          {server === p ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleServe('ace')}
                className={`p-5 ${t.success} ${t.textWhite} rounded-lg text-lg font-bold ${t.successHover} focus:ring-4 ${t.successRing} focus:outline-none`}
                aria-label={`Ass für ${players[p]}`}
              >
                Ass
              </button>
              <button
                onClick={() => handleServe('fault')}
                className={`p-5 ${t.danger} ${t.textWhite} rounded-lg text-lg font-bold ${t.dangerHover} focus:ring-4 ${t.dangerRing} focus:outline-none`}
                aria-label={`Aufschlagfehler für ${players[p]}`}
              >
                Fehler
              </button>
              <button
                onClick={() => handleServe('in_play')}
                className={`p-5 ${t.info} ${t.textWhite} rounded-lg text-lg font-bold ${t.infoHover} focus:ring-4 ${t.infoRing} focus:outline-none`}
                aria-label={`Ball im Spiel nach Aufschlag von ${players[p]}`}
              >
                Im Spiel
              </button>
            </div>
          ) : (
            <div className="h-48" aria-hidden="true"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ServeButtons;
