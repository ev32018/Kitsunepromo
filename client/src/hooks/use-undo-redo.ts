import { useState, useCallback, useRef } from "react";

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T, maxHistory = 50) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });
  
  const skipNextRef = useRef(false);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback((newPresent: T | ((prev: T) => T), skipHistory = false) => {
    setState(currentState => {
      const resolvedPresent = typeof newPresent === "function"
        ? (newPresent as (prev: T) => T)(currentState.present)
        : newPresent;

      if (JSON.stringify(resolvedPresent) === JSON.stringify(currentState.present)) {
        return currentState;
      }

      if (skipHistory || skipNextRef.current) {
        skipNextRef.current = false;
        return {
          ...currentState,
          present: resolvedPresent,
        };
      }

      const newPast = [...currentState.past, currentState.present].slice(-maxHistory);

      return {
        past: newPast,
        present: resolvedPresent,
        future: [],
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setState(currentState => {
      if (currentState.past.length === 0) return currentState;

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(currentState => {
      if (currentState.future.length === 0) return currentState;

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    setState({
      past: [],
      present: newPresent,
      future: [],
    });
  }, []);

  const skipNext = useCallback(() => {
    skipNextRef.current = true;
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    skipNext,
    historyLength: state.past.length,
    futureLength: state.future.length,
  };
}
