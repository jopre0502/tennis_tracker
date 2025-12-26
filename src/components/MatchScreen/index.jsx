import Scoreboard from './Scoreboard';
import PhaseIndicator from './PhaseIndicator';
import ServeButtons from './ServeButtons';
import RallyButtons from './RallyButtons';

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
  onShowInfo
}) => {
  return (
    <div className="min-h-screen bg-green-900 p-4">
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

        {/* Undo and Info Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={undoLastPoint}
            disabled={history.length === 0}
            className="flex-1 p-3 bg-gray-700 text-white rounded-lg font-medium disabled:opacity-50"
            aria-label={`Letzten Punkt rückgängig machen${history.length > 0 ? `, ${history.length} Punkte in der Historie` : ''}`}
          >
            Rückgängig {history.length > 0 && `(${history.length})`}
          </button>
          <button
            onClick={onShowInfo}
            className="p-3 bg-purple-600 text-white rounded-lg font-medium"
            aria-label="Statistik-Erklärungen anzeigen"
          >
            ℹ️
          </button>
        </div>

        {/* Version */}
        <div className="text-center mt-4 text-xs text-gray-400">
          v1.15
        </div>
      </div>
    </div>
  );
};

export default MatchScreen;
