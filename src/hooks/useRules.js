import { useState, useEffect } from 'react';

/**
 * Default Tennolino Midcourt Rules
 */
export const DEFAULT_RULES = {
  setTargets: [7, 7, 5],    // Punkte für Satz 1, 2, 3
  bestOf: 3,                 // Best of X (wer zuerst 2 Sätze gewinnt)
  serveChangeInterval: 2     // Aufschlagwechsel alle X Punkte
};

/**
 * Custom Hook für Regelverwaltung
 * @returns {Object} Rules state and functions
 */
export const useRules = () => {
  const [rules, setRules] = useState(DEFAULT_RULES);

  // Load rules from localStorage on mount
  useEffect(() => {
    const savedRules = localStorage.getItem('tennolino-rules');
    if (savedRules) {
      try {
        const parsed = JSON.parse(savedRules);
        setRules({
          setTargets: parsed.setTargets || DEFAULT_RULES.setTargets,
          bestOf: parsed.bestOf || DEFAULT_RULES.bestOf,
          serveChangeInterval: parsed.serveChangeInterval || DEFAULT_RULES.serveChangeInterval
        });
      } catch (e) {
        console.error('Failed to load rules:', e);
        localStorage.removeItem('tennolino-rules');
      }
    }
  }, []);

  // Save rules to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tennolino-rules', JSON.stringify(rules));
  }, [rules]);

  const updateRules = (newRules) => {
    setRules(newRules);
  };

  const resetRules = () => {
    setRules(DEFAULT_RULES);
  };

  return {
    rules,
    updateRules,
    resetRules
  };
};
