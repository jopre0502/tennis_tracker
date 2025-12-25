const PhaseIndicator = ({ phase, isSecondServe, players, server }) => {
  return (
    <div className="text-center text-white mb-4">
      {phase === 'serve' && (
        <span className="bg-yellow-600 px-4 py-1 rounded-full text-sm">
          {isSecondServe ? '2. Aufschlag' : '1. Aufschlag'} - {players[server]}
        </span>
      )}
      {phase === 'rally' && (
        <span className="bg-blue-600 px-4 py-1 rounded-full text-sm">Rally</span>
      )}
    </div>
  );
};

export default PhaseIndicator;
