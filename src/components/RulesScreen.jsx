import { useState } from 'react';
import { DEFAULT_RULES } from '../hooks/useRules';
import packageJson from '../../package.json';

const RulesScreen = ({ rules, onSave, onClose }) => {
  const [localRules, setLocalRules] = useState(rules);

  const handleSave = () => {
    onSave(localRules);
    onClose();
  };

  const handleReset = () => {
    setLocalRules(DEFAULT_RULES);
  };

  return (
    <div className="min-h-screen bg-green-900 p-4 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-4 text-green-800">Spielregeln</h1>

        <div className="space-y-6">
          {/* Set Targets */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Satz-Ziele</h2>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label htmlFor="set1-target" className="text-sm font-medium text-gray-700 w-20">Satz 1:</label>
                <input
                  id="set1-target"
                  type="number"
                  min="1"
                  max="21"
                  value={localRules.setTargets[0]}
                  onChange={(e) => setLocalRules({
                    ...localRules,
                    setTargets: [parseInt(e.target.value) || 1, localRules.setTargets[1], localRules.setTargets[2]]
                  })}
                  className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-green-400 focus:outline-none focus:border-green-600"
                  aria-label="Punkte für Satz 1"
                />
                <span className="text-sm text-gray-600">Punkte</span>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor="set2-target" className="text-sm font-medium text-gray-700 w-20">Satz 2:</label>
                <input
                  id="set2-target"
                  type="number"
                  min="1"
                  max="21"
                  value={localRules.setTargets[1]}
                  onChange={(e) => setLocalRules({
                    ...localRules,
                    setTargets: [localRules.setTargets[0], parseInt(e.target.value) || 1, localRules.setTargets[2]]
                  })}
                  className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-green-400 focus:outline-none focus:border-green-600"
                  aria-label="Punkte für Satz 2"
                />
                <span className="text-sm text-gray-600">Punkte</span>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor="set3-target" className="text-sm font-medium text-gray-700 w-20">Satz 3:</label>
                <input
                  id="set3-target"
                  type="number"
                  min="1"
                  max="21"
                  value={localRules.setTargets[2]}
                  onChange={(e) => setLocalRules({
                    ...localRules,
                    setTargets: [localRules.setTargets[0], localRules.setTargets[1], parseInt(e.target.value) || 1]
                  })}
                  className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-green-400 focus:outline-none focus:border-green-600"
                  aria-label="Punkte für Satz 3"
                />
                <span className="text-sm text-gray-600">Punkte</span>
              </div>
            </div>
          </div>

          {/* Best Of */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Satzmodus</h2>
            <div className="flex items-center gap-3">
              <label htmlFor="best-of" className="text-sm font-medium text-gray-700">Best of:</label>
              <input
                id="best-of"
                type="number"
                min="1"
                max="5"
                step="2"
                value={localRules.bestOf}
                onChange={(e) => setLocalRules({
                  ...localRules,
                  bestOf: parseInt(e.target.value) || 1
                })}
                className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-green-400 focus:outline-none focus:border-green-600"
                aria-label="Best of X Sätze"
              />
              <span className="text-sm text-gray-600">Sätze (ungerade Zahl)</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Gewinner: Wer zuerst {Math.ceil(localRules.bestOf / 2)} Sätze gewinnt
            </p>
          </div>

          {/* Serve Change Interval */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Aufschlagwechsel</h2>
            <div className="flex items-center gap-3">
              <label htmlFor="serve-change" className="text-sm font-medium text-gray-700">Alle:</label>
              <input
                id="serve-change"
                type="number"
                min="1"
                max="5"
                value={localRules.serveChangeInterval}
                onChange={(e) => setLocalRules({
                  ...localRules,
                  serveChangeInterval: parseInt(e.target.value) || 1
                })}
                className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-green-400 focus:outline-none focus:border-green-600"
                aria-label="Aufschlagwechsel Intervall"
              />
              <span className="text-sm text-gray-600">Punkte</span>
            </div>
          </div>

          {/* Standard Tennolino Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-800 font-medium">Standard Tennolino Midcourt:</p>
            <ul className="text-xs text-green-700 mt-1 space-y-1">
              <li>• Satz 1 & 2: 7 Punkte</li>
              <li>• Satz 3: 5 Punkte</li>
              <li>• Best of 3</li>
              <li>• Aufschlagwechsel alle 2 Punkte</li>
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleReset}
            className="flex-1 p-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 focus:ring-4 focus:ring-gray-400 focus:outline-none"
            aria-label="Regeln auf Standard zurücksetzen"
          >
            Standard
          </button>
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 focus:ring-4 focus:ring-gray-300 focus:outline-none"
            aria-label="Regeländerungen verwerfen"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="flex-1 p-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-400 focus:outline-none"
            aria-label="Regeln speichern"
          >
            Speichern
          </button>
        </div>

        <div className="text-center mt-4 text-xs text-gray-500">
          v{packageJson.version}
        </div>
      </div>
    </div>
  );
};

export default RulesScreen;
