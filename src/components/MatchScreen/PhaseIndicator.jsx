import { useThemeContext } from '../../themes/index.jsx';

const PhaseIndicator = ({ phase, isSecondServe, players, server }) => {
  const { currentTheme } = useThemeContext();
  const t = currentTheme.colors;

  return (
    <div className={`text-center ${t.textWhite} mb-4`}>
      {phase === 'serve' && (
        <span className={`${t.warning} px-4 py-1 rounded-full text-sm`}>
          {isSecondServe ? '2. Aufschlag' : '1. Aufschlag'} - {players[server]}
        </span>
      )}
      {phase === 'rally' && (
        <span className={`${t.info} px-4 py-1 rounded-full text-sm`}>Rally</span>
      )}
    </div>
  );
};

export default PhaseIndicator;
