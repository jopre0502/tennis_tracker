import Scoreboard from './Scoreboard';
import PhaseIndicator from './PhaseIndicator';
import ServeButtons from './ServeButtons';
import RallyButtons from './RallyButtons';
import packageJson from '../../../package.json';
import { useThemeContext } from '../../themes/index.jsx';

const MatchScreen = ({
  players,
  score,
  sets,
  server,
  currentSet,
  phase,
  isSecondServe,
  history,
  getSetTarget,
  handleServe,
  handleRally,
  undoLastPoint,
  onAbortMatch,
  onShowInfo
}) => {
  const { currentTheme } = useThemeContext();
  const t = currentTheme.colors;

  return (
    <div className={`min-h-screen ${t.bgPrimary} p-4`}>
      <div className="max-w-md mx-auto">
        {/* Scoreboard */}
        <Scoreboard
          players={players}
          score={score}
          sets={sets}
          server={server}
          currentSet={currentSet}
          getSetTarget={getSetTarget}
        />

        {/* Phase Indicator */}
        <PhaseIndicator
          phase={phase}
          isSecondServe={isSecondServe}
          players={players}
          server={server}
        />

        {/* Serve Buttons */}
        {phase === 'serve' && (
          <ServeButtons
            players={players}
            server={server}
            handleServe={handleServe}
          />
        )}

        {/* Rally Buttons */}
        {phase === 'rally' && (
          <RallyButtons
            players={players}
            handleRally={handleRally}
          />
        )}

        {/* Undo, Abort and Info Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={undoLastPoint}
            disabled={history.length === 0}
            className={`flex-1 p-3 ${t.bgCardDark} ${t.textWhite} rounded-lg font-medium disabled:opacity-50 focus:ring-4 ${t.secondaryRing} focus:outline-none hover:bg-slate-700`}
            aria-label={`Letzten Punkt rückgängig machen${history.length > 0 ? `, ${history.length} Punkte in der Historie` : ''}`}
          >
            Rückgängig {history.length > 0 && `(${history.length})`}
          </button>
          <button
            onClick={onAbortMatch}
            className={`p-3 ${t.warning} ${t.textWhite} rounded-lg font-medium ${t.warningHover} focus:ring-4 ${t.warningRing} focus:outline-none`}
            aria-label="Match abbrechen"
          >
            ⚠️
          </button>
          <button
            onClick={onShowInfo}
            className={`p-3 ${t.info} ${t.textWhite} rounded-lg font-medium focus:ring-4 ${t.infoRing} focus:outline-none ${t.infoHover}`}
            aria-label="Statistik-Erklärungen anzeigen"
          >
            ℹ️
          </button>
        </div>

        {/* Version */}
        <div className={`text-center mt-4 text-xs ${t.textMuted}`}>
          v{packageJson.version}
        </div>
      </div>
    </div>
  );
};

export default MatchScreen;
