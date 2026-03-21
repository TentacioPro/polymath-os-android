/**
 * useOptimisticList — Generic optimistic list management hook
 *
 * Wraps a piece of list state and exposes `prepend`, `remove`, and `update`
 * operations that apply *instantly* to the UI and each return a rollback
 * function to revert the mutation if the subsequent API call fails.
 *
 * Usage:
 *   const { list, setList, prepend, remove } = useOptimisticList(initial);
 *
 *   const handleDelete = async (id: string) => {
 *     const rollback = remove(item => item.id === id);
 *     try {
 *       await api.delete(id);
 *     } catch {
 *       rollback(); // restore the removed item
 *     }
 *   };
 */

import { useState, useCallback } from 'react';

export interface OptimisticList<T> {
  list: T[];
  setList: React.Dispatch<React.SetStateAction<T[]>>;
  /** Instantly prepend an item. Returns a rollback fn that removes it. */
  prepend: (item: T) => () => void;
  /** Instantly remove items matching predicate. Returns a rollback fn. */
  remove: (predicate: (item: T) => boolean) => () => void;
  /** Instantly update items matching predicate. Returns a rollback fn. */
  update: (predicate: (item: T) => boolean, updater: (item: T) => T) => () => void;
  /** Replace a temp item (matched by predicate) with a real one. */
  replace: (predicate: (item: T) => boolean, realItem: T) => void;
}

export function useOptimisticList<T>(initial: T[]): OptimisticList<T> {
  const [list, setList] = useState<T[]>(initial);

  const prepend = useCallback((item: T) => {
    setList(prev => [item, ...prev]);
    // Rollback: remove the prepended item by reference equality
    return () => setList(prev => prev.filter(x => x !== item));
  }, []);

  const remove = useCallback((predicate: (item: T) => boolean) => {
    // Capture snapshot inside the functional update for atomic read
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
