import { useState } from 'react';
import { DEFAULT_RULES } from '../hooks/useRules';
import { useThemeContext } from '../themes/index.jsx';
import packageJson from '../../package.json';

const RulesScreen = ({ rules, onSave, onClose }) => {
  const [localRules, setLocalRules] = useState(rules);
  const { currentThemeId, changeTheme, availableThemes, currentTheme } = useThemeContext();
  const t = currentTheme.colors;

  const handleSave = () => {
    onSave(localRules);
    onClose();
  };

  const handleReset = () => {
    setLocalRules(DEFAULT_RULES);
  };

  return (
    <div className={`min-h-screen ${t.bgPrimary} p-4 flex flex-col items-center justify-center`}>
      <div className={`${t.bgCard} rounded-lg p-6 w-full max-w-md shadow-xl`}>
        <h1 className={`text-2xl font-bold text-center mb-4 ${t.primaryText}`}>Spielregeln</h1>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <h2 className={`text-lg font-semibold ${t.textSecondary} mb-3`}>Design / Theme</h2>
            <div className="grid grid-cols-2 gap-2">
              {availableThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => changeTheme(theme.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    currentThemeId === theme.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  aria-label={`Theme ${theme.name} auswählen`}
                >
                  <div className="font-medium text-sm">{theme.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{theme.description}</div>
                  {/* Color Preview */}
                  <div className="flex gap-1 mt-2">
                    <div className={`w-4 h-4 rounded ${theme.colors.primary}`}></div>
                    <div className={`w-4 h-4 rounded ${theme.colors.accent}`}></div>
                    <div className={`w-4 h-4 rounded ${theme.colors.success}`}></div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Theme wird sofort angewendet und gespeichert
            </p>
          </div>

          {/* Set Targets */}
          <div>
            <h2 className={`text-lg font-semibold ${t.textSecondary} mb-3`}>Satz-Ziele</h2>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label htmlFor="set1-target" className={`text-sm font-medium ${t.textSecondary} w-20`}>Satz 1:</label>
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
                <label htmlFor="set2-target" className={`text-sm font-medium ${t.textSecondary} w-20`}>Satz 2:</label>
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
                <label htmlFor="set3-target" className={`text-sm font-medium ${t.textSecondary} w-20`}>Satz 3:</label>
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
            <h2 className={`text-lg font-semibold ${t.textSecondary} mb-3`}>Satzmodus</h2>
            <div className="flex items-center gap-3">
              <label htmlFor="best-of" className={`text-sm font-medium ${t.textSecondary}`}>Best of:</label>
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
            <h2 className={`text-lg font-semibold ${t.textSecondary} mb-3`}>Aufschlagwechsel</h2>
            <div className="flex items-center gap-3">
              <label htmlFor="serve-change" className={`text-sm font-medium ${t.textSecondary}`}>Alle:</label>
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
          <div className={`bg-gray-50 border ${t.border} rounded-lg p-3`}>
            <p className={`text-xs ${t.primaryText} font-medium`}>Standard Tennolino Midcourt:</p>
            <ul className={`text-xs ${t.textSecondary} mt-1 space-y-1`}>
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
            className={`flex-1 p-3 ${t.secondary} ${t.secondaryText} rounded-lg font-medium ${t.secondaryHover} focus:ring-4 ${t.secondaryRing} focus:outline-none`}
            aria-label="Regeln auf Standard zurücksetzen"
          >
            Standard
          </button>
          <button
            onClick={onClose}
            className={`flex-1 p-3 ${t.secondary} ${t.secondaryText} rounded-lg font-medium ${t.secondaryHover} focus:ring-4 ${t.secondaryRing} focus:outline-none`}
            aria-label="Regeländerungen verwerfen"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 p-3 ${t.primary} ${t.textWhite} rounded-lg font-medium ${t.primaryHover} focus:ring-4 ${t.primaryRing} focus:outline-none`}
            aria-label="Regeln speichern"
          >
            Speichern
          </button>
        </div>

        <div className={`text-center mt-4 text-xs ${t.textMuted}`}>
          v{packageJson.version}
        </div>
      </div>
    </div>
  );
};

export default RulesScreen;
