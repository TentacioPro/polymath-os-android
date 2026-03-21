/**
 * useOptimisticList — Generic optimistic list management hook (web)
 * Mirror of frontend/utils/useOptimisticList.ts for the Next.js app.
 *
 * For server-state (TanStack Query), prefer the onMutate/onError pattern
 * in individual query hooks. Use this hook for purely local-state lists.
 */

'use client';

import { useState, useCallback } from 'react';

export interface OptimisticList<T> {
  list: T[];
  setList: React.Dispatch<React.SetStateAction<T[]>>;
  prepend: (item: T) => () => void;
  remove: (predicate: (item: T) => boolean) => () => void;
  update: (predicate: (item: T) => boolean, updater: (item: T) => T) => () => void;
  replace: (predicate: (item: T) => boolean, realItem: T) => void;
}

export function useOptimisticList<T>(initial: T[]): OptimisticList<T> {
  const [list, setList] = useState<T[]>(initial);

  const prepend = useCallback((item: T) => {
    setList(prev => [item, ...prev]);
    return () => setList(prev => prev.filter(x => x !== item));
  }, []);

  const remove = useCallback((predicate: (item: T) => boolean) => {
    let snapshot: T[] = [];
    setList(prev => {
      snapshot = prev;
      return prev.filter(x => !predicate(x));
    });
    return () => setList(snapshot);
  }, []);

  const update = useCallback((predicate: (item: T) => boolean, updater: (item: T) => T) => {
    let snapshot: T[] = [];
    setList(prev => {
      snapshot = prev;
      return prev.map(x => predicate(x) ? updater(x) : x);
    });
    return () => setList(snapshot);
  }, []);

  const replace = useCallback((predicate: (item: T) => boolean, realItem: T) => {
    setList(prev => prev.map(x => predicate(x) ? realItem : x));
  }, []);

  return { list, setList, prepend, remove, update, replace };
}
