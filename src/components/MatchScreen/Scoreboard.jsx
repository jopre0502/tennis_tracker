import { useThemeContext } from '../../themes/index.jsx';

const Scoreboard = ({ players, score, sets, server, currentSet, getSetTarget }) => {
  const { currentTheme } = useThemeContext();
  const t = currentTheme.colors;

  return (
    <div className={`${t.bgCardDark} rounded-lg p-3 mb-4 ${t.textWhite}`}>
      <div className={`flex justify-between items-center mb-1 text-xs ${t.textMuted}`}>
        <span>Satz {currentSet} | bis {getSetTarget()}</span>
        <span>Sätze</span>
      </div>

      {['a', 'b'].map((p) => (
        <div key={p} className={`flex items-center py-2 ${p === 'a' ? `border-b ${t.border}` : ''}`}>
          <div className="flex items-center flex-1">
            {server === p && <span className={`w-2 h-2 ${t.accent} rounded-full mr-2`}></span>}
            {server !== p && <span className="w-2 mr-2"></span>}
            <span className="text-sm">{players[p]}</span>
          </div>
          <span className="text-2xl font-bold w-12 text-center">{score[p]}</span>
          <span className={`text-lg w-10 text-center ${t.textMuted}`}>{sets[p]}</span>
        </div>
      ))}
    </div>
  );
};

export default Scoreboard;
