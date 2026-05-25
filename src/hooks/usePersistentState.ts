import { useState, useEffect, useCallback } from 'react';

interface PersistentStateConfig<T> {
  key: string;
  defaultValue: T;
  storage?: 'localStorage' | 'sessionStorage';
  validate?: (data: unknown) => data is T;
}

const getStorage = (type: 'localStorage' | 'sessionStorage') => {
  try {
    return window[type];
  } catch {
    return null;
  }
};

export function usePersistentState<T>({
  key,
  defaultValue,
  storage: storageType = 'localStorage',
  validate,
}: PersistentStateConfig<T>): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(() => {
    const storage = getStorage(storageType);
    if (!storage) return defaultValue;

    try {
      const saved = storage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (validate && !validate(parsed)) {
          return defaultValue;
        }
        return parsed;
      }
    } catch {
      // Ignore parsing errors
    }
    return defaultValue;
  });

  useEffect(() => {
    const storage = getStorage(storageType);
    if (!storage) return;

    try {
      storage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [key, state, storageType]);

  const reset = useCallback(() => {
    const storage = getStorage(storageType);
    if (storage) {
      try {
        storage.removeItem(key);
      } catch {
        // Ignore
      }
    }
    setState(defaultValue);
  }, [key, defaultValue, storageType]);

  return [state, setState, reset];
}

export function useAppState() {
  interface AppState {
    currentRoute: string;
    lastVisitedAt: number;
  }

  const validate = (data: unknown): data is AppState => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof (data as AppState).currentRoute === 'string' &&
      typeof (data as AppState).lastVisitedAt === 'number'
    );
  };

  return usePersistentState<AppState>({
    key: 'word-memory-app-state',
    defaultValue: { currentRoute: '/', lastVisitedAt: Date.now() },
    validate,
  });
}

export function useHomeState() {
  interface HomeState {
    currentIndex: number;
    showAnswer: boolean;
  }

  const validate = (data: unknown): data is HomeState => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof (data as HomeState).currentIndex === 'number' &&
      typeof (data as HomeState).showAnswer === 'boolean'
    );
  };

  return usePersistentState<HomeState>({
    key: 'word-memory-home-state',
    defaultValue: { currentIndex: 0, showAnswer: false },
    validate,
  });
}

export function useWordListState() {
  interface WordListState {
    searchQuery: string;
    scrollPosition: number;
    expandedWordId: string | null;
  }

  const validate = (data: unknown): data is WordListState => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof (data as WordListState).searchQuery === 'string' &&
      typeof (data as WordListState).scrollPosition === 'number' &&
      ((data as WordListState).expandedWordId === null || 
       typeof (data as WordListState).expandedWordId === 'string')
    );
  };

  return usePersistentState<WordListState>({
    key: 'word-memory-wordlist-state',
    defaultValue: { searchQuery: '', scrollPosition: 0, expandedWordId: null },
    validate,
  });
}

export function resetAllPersistentState() {
  const keysToRemove = [
    'word-memory-app-state',
    'word-memory-home-state', 
    'word-memory-wordlist-state',
    'word-learning-stats',
    'custom-words'
  ];

  const localStorage = getStorage('localStorage');
  const sessionStorage = getStorage('sessionStorage');

  keysToRemove.forEach(key => {
    if (localStorage) {
      try { localStorage.removeItem(key); } catch {}
    }
    if (sessionStorage) {
      try { sessionStorage.removeItem(key); } catch {}
    }
  });
}
