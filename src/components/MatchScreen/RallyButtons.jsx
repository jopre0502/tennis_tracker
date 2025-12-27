import { useThemeContext } from '../../themes/index.jsx';

const RallyButtons = ({ players, handleRally }) => {
  const { currentTheme } = useThemeContext();
  const t = currentTheme.colors;

  return (
    <div className="grid grid-cols-2 gap-3">
      {['a', 'b'].map((p) => (
        <div key={p} className={`${t.bgCardDark} rounded-lg p-2`}>
          <div className={`${t.textWhite} text-xs mb-2 font-medium text-center`}>{players[p]}</div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleRally(p, 'winner')}
              className={`p-5 ${t.success} ${t.textWhite} rounded-lg text-lg font-bold ${t.successHover} focus:ring-4 ${t.successRing} focus:outline-none`}
              aria-label={`Winner für ${players[p]}`}
            >
              Winner
            </button>
            <button
              onClick={() => handleRally(p === 'a' ? 'b' : 'a', 'forced_error')}
              className={`p-5 ${t.warning} ${t.textWhite} rounded-lg text-lg font-bold ${t.warningHover} focus:ring-4 ${t.warningRing} focus:outline-none`}
              aria-label={`Erzwungener Fehler von ${players[p]}`}
            >
              Erzwungen
            </button>
            <button
              onClick={() => handleRally(p === 'a' ? 'b' : 'a', 'unforced_error')}
              className={`p-5 ${t.danger} ${t.textWhite} rounded-lg text-lg font-bold ${t.dangerHover} focus:ring-4 ${t.dangerRing} focus:outline-none`}
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
