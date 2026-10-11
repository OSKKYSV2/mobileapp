import { describe, expect, it } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { filterByName, sortCounters, sumValues } from './counter-list';

function counter(id: string, name: string, value: number, createdAt: string): SavedCounter {
  return { id, name, value, createdAt };
}

const apple = counter('apple', 'Jablka', 5, '2026-09-17T08:00:00.000Z');
const pear = counter('pear', 'hrušky', 12, '2026-09-17T10:00:00.000Z');
const plum = counter('plum', 'Švestky', 0, '2026-09-17T09:00:00.000Z');
const all = [apple, pear, plum];

describe('sumValues', () => {
  it('should return 0 for an empty list', () => {
    expect(sumValues([])).toBe(0);
  });

  it('should add the values of all counters', () => {
    expect(sumValues(all)).toBe(17);
  });
});

describe('filterByName', () => {
  it('should return every counter for an empty or blank query', () => {
    expect(filterByName(all, '')).toEqual(all);
    expect(filterByName(all, '   ')).toEqual(all);
  });

  it('should ignore letter case', () => {
    expect(filterByName(all, 'JABL')).toEqual([apple]);
  });

  it('should ignore diacritics in both the name and the query', () => {
    expect(filterByName(all, 'hrusky')).toEqual([pear]);
    expect(filterByName(all, 'svěst')).toEqual([plum]);
  });

  it('should match a part of the name anywhere', () => {
    expect(filterByName(all, 'ky')).toEqual([pear, plum]);
  });

  it('should return an empty list when nothing matches', () => {
    expect(filterByName(all, 'banány')).toEqual([]);
  });
});

describe('sortCounters', () => {
  it('should sort by creation time, newest first', () => {
    expect(sortCounters(all, 'newest')).toEqual([pear, plum, apple]);
  });

  it('should sort by creation time, oldest first', () => {
    expect(sortCounters(all, 'oldest')).toEqual([apple, plum, pear]);
  });

  it('should sort by name regardless of letter case', () => {
    expect(sortCounters(all, 'name')).toEqual([pear, apple, plum]);
  });

  it('should sort by value in descending order', () => {
    expect(sortCounters(all, 'value-desc')).toEqual([pear, apple, plum]);
  });

  it('should sort by value in ascending order', () => {
    expect(sortCounters(all, 'value-asc')).toEqual([plum, apple, pear]);
  });

  it('should not modify the original array', () => {
    const original = [...all];

    sortCounters(all, 'value-asc');

    expect(all).toEqual(original);
  });
});
