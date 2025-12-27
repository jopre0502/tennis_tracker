import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMatchLogic } from './useMatchLogic';

describe('useMatchLogic', () => {
  let showToast;

  beforeEach(() => {
    showToast = vi.fn();
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      expect(result.current.players).toEqual({ a: 'Spieler A', b: 'Spieler B' });
      expect(result.current.score).toEqual({ a: 0, b: 0 });
      expect(result.current.sets).toEqual({ a: 0, b: 0 });
      expect(result.current.currentSet).toBe(1);
      expect(result.current.server).toBe('a');
      expect(result.current.phase).toBe('serve');
      expect(result.current.matchOver).toBe(false);
      expect(result.current.winner).toBe(null);
      expect(result.current.history).toEqual([]);
    });

    it('should load state from localStorage if available', () => {
      const savedState = {
        players: { a: 'Roger', b: 'Rafael' },
        score: { a: 3, b: 2 },
        sets: { a: 1, b: 0 },
        currentSet: 2,
        editing: false,
        server: 'b',
        setInitialServer: 'a',
        phase: 'rally',
        isSecondServe: true,
        history: [{ winner: 'a', type: 'ace' }],
        matchOver: false,
        winner: null
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useMatchLogic(showToast));

      expect(result.current.players).toEqual({ a: 'Roger', b: 'Rafael' });
      expect(result.current.score).toEqual({ a: 3, b: 2 });
      expect(result.current.sets).toEqual({ a: 1, b: 0 });
      expect(result.current.currentSet).toBe(2);
      expect(result.current.server).toBe('b');
      expect(result.current.phase).toBe('rally');
    });

    it('should handle corrupt localStorage data', () => {
      localStorage.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => useMatchLogic(showToast));

      expect(result.current.players).toEqual({ a: 'Spieler A', b: 'Spieler B' });
      expect(showToast).toHaveBeenCalledWith(
        'Gespeicherter Stand konnte nicht geladen werden. Neues Match gestartet.',
        'error'
      );
    });
  });

  describe('Tennolino Rules', () => {
    it('should return correct set target (7 for sets 1 and 2)', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      expect(result.current.getSetTarget()).toBe(7);

      act(() => {
        result.current.setPlayers({ a: 'A', b: 'B' });
      });
      expect(result.current.getSetTarget()).toBe(7);
    });

    it('should detect set win at 7 points in first two sets', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      // Simulate 7 aces for player A
      act(() => {
        for (let i = 0; i < 7; i++) {
          result.current.handleServe('ace');
        }
      });

      expect(result.current.sets.a).toBe(1);
      expect(result.current.sets.b).toBe(0);
      expect(result.current.score).toEqual({ a: 0, b: 0 }); // Score resets for new set
      expect(result.current.currentSet).toBe(2);
    });

    it('should detect match win at 2 sets', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      // Win set 1 (7 aces)
      act(() => {
        for (let i = 0; i < 7; i++) {
          result.current.handleServe('ace');
        }
      });

      expect(result.current.sets.a).toBe(1);
      expect(result.current.currentSet).toBe(2);

      // Win set 2 (7 aces)
      act(() => {
        for (let i = 0; i < 7; i++) {
          result.current.handleServe('ace');
        }
      });

      expect(result.current.sets.a).toBe(2);
      expect(result.current.matchOver).toBe(true);
      expect(result.current.winner).toBe('a');
    });

    it('should switch server every 2 points', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      expect(result.current.server).toBe('a');

      // Point 1 - still A
      act(() => {
        result.current.handleServe('ace');
      });
      expect(result.current.server).toBe('a');

      // Point 2 - still A
      act(() => {
        result.current.handleServe('ace');
      });
      expect(result.current.server).toBe('b'); // Switch to B

      // Point 3 - B
      act(() => {
        result.current.handleServe('ace');
      });
      expect(result.current.server).toBe('b');

      // Point 4 - B
      act(() => {
        result.current.handleServe('ace');
      });
      expect(result.current.server).toBe('a'); // Switch back to A
    });

    it('should alternate initial server for each set', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      expect(result.current.setInitialServer).toBe('a');

      // Win set 1
      act(() => {
        for (let i = 0; i < 7; i++) {
          result.current.handleServe('ace');
        }
      });

      expect(result.current.setInitialServer).toBe('b'); // Set 2 starts with B
      expect(result.current.server).toBe('b');
    });
  });

  describe('Serve Logic', () => {
    it('should award point on ace', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      act(() => {
        result.current.handleServe('ace');
      });

      expect(result.current.score.a).toBe(1);
      expect(result.current.history.length).toBe(1);
      expect(result.current.history[0].type).toBe('ace');
      expect(result.current.history[0].winner).toBe('a');
    });

    it('should move to second serve on fault', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      expect(result.current.isSecondServe).toBe(false);

      act(() => {
        result.current.handleServe('fault');
      });

      expect(result.current.isSecondServe).toBe(true);
      expect(result.current.score).toEqual({ a: 0, b: 0 }); // No point awarded
    });

    it('should award double fault on second fault', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      act(() => {
        result.current.handleServe('fault'); // First fault
      });

      expect(result.current.isSecondServe).toBe(true);

      act(() => {
        result.current.handleServe('fault'); // Second fault = double fault
      });

      expect(result.current.score.b).toBe(1); // Opponent gets point
      expect(result.current.history[0].type).toBe('double_fault');
      expect(result.current.isSecondServe).toBe(false); // Reset for next point
    });

    it('should move to rally phase on in_play', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      expect(result.current.phase).toBe('serve');

      act(() => {
        result.current.handleServe('in_play');
      });

      expect(result.current.phase).toBe('rally');
      expect(result.current.score).toEqual({ a: 0, b: 0 }); // No point awarded yet
    });
  });

  describe('Rally Logic', () => {
    it('should award point on winner', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      act(() => {
        result.current.handleServe('in_play');
        result.current.handleRally('a', 'winner');
      });

      expect(result.current.score.a).toBe(1);
      expect(result.current.history[0].type).toBe('winner');
      expect(result.current.phase).toBe('serve'); // Back to serve phase
    });

    it('should award point on forced error', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      act(() => {
        result.current.handleServe('in_play');
        result.current.handleRally('a', 'forced_error');
      });

      expect(result.current.score.a).toBe(1);
      expect(result.current.history[0].type).toBe('forced_error');
    });

    it('should award point on unforced error', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      act(() => {
        result.current.handleServe('in_play');
        result.current.handleRally('b', 'unforced_error');
      });

      expect(result.current.score.b).toBe(1);
      expect(result.current.history[0].type).toBe('unforced_error');
    });
  });

  describe('Undo Functionality', () => {
    it('should undo last point', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      act(() => {
        result.current.handleServe('ace');
      });

      expect(result.current.score.a).toBe(1);
      expect(result.current.history.length).toBe(1);

      act(() => {
        result.current.undoLastPoint();
      });

      expect(result.current.score).toEqual({ a: 0, b: 0 });
      expect(result.current.history.length).toBe(0);
    });

    it('should undo multiple points', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      act(() => {
        result.current.handleServe('ace');
        result.current.handleServe('ace');
        result.current.handleServe('ace');
      });

      expect(result.current.score.a).toBe(3);

      act(() => {
        result.current.undoLastPoint();
        result.current.undoLastPoint();
      });

      expect(result.current.score.a).toBe(1);
      expect(result.current.history.length).toBe(1);
    });

    it('should handle undo with no history', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      act(() => {
        result.current.undoLastPoint();
      });

      expect(result.current.score).toEqual({ a: 0, b: 0 });
      expect(result.current.history.length).toBe(0);
    });

    it('should restore correct server after undo', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      // Play 2 points to trigger server switch
      act(() => {
        result.current.handleServe('ace'); // Point 1, server A
        result.current.handleServe('ace'); // Point 2, server A -> switches to B
      });

      expect(result.current.server).toBe('b');

      // Undo last point
      act(() => {
        result.current.undoLastPoint();
      });

      expect(result.current.server).toBe('a'); // Should be back to A
    });
  });

  describe('Reset/Abort Match', () => {
    it('should reset match to initial state', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      // Play some points
      act(() => {
        result.current.setPlayers({ a: 'Roger', b: 'Rafael' });
        result.current.handleServe('ace');
        result.current.handleServe('ace');
      });

      expect(result.current.score.a).toBe(2);

      act(() => {
        result.current.resetMatch();
      });

      expect(result.current.score).toEqual({ a: 0, b: 0 });
      expect(result.current.sets).toEqual({ a: 0, b: 0 });
      expect(result.current.history).toEqual([]);
      expect(result.current.matchOver).toBe(false);
      expect(result.current.winner).toBe(null);
      expect(result.current.editing).toBe(true);
    });

    it('should abort match with confirmation', () => {
      global.confirm = vi.fn(() => true);
      const { result } = renderHook(() => useMatchLogic(showToast));

      act(() => {
        result.current.handleServe('ace');
      });

      expect(result.current.score.a).toBe(1);

      act(() => {
        result.current.abortMatch();
      });

      expect(global.confirm).toHaveBeenCalled();
      expect(result.current.score).toEqual({ a: 0, b: 0 });
      expect(showToast).toHaveBeenCalledWith('Match abgebrochen', 'error');
    });

    it('should not abort match if user cancels', () => {
      global.confirm = vi.fn(() => false);
      const { result } = renderHook(() => useMatchLogic(showToast));

      act(() => {
        result.current.handleServe('ace');
      });

      expect(result.current.score.a).toBe(1);

      act(() => {
        result.current.abortMatch();
      });

      expect(global.confirm).toHaveBeenCalled();
      expect(result.current.score.a).toBe(1); // Score unchanged
      expect(showToast).not.toHaveBeenCalled();
    });
  });

  describe('LocalStorage Auto-Save', () => {
    it('should save state to localStorage on change', () => {
      const { result } = renderHook(() => useMatchLogic(showToast));

      act(() => {
        result.current.handleServe('ace');
      });

      expect(localStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorage.setItem.mock.calls[localStorage.setItem.mock.calls.length - 1][1]);
      expect(savedData.score.a).toBe(1);
    });
  });
});
