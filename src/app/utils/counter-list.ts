import { SavedCounter } from '../models/saved-counter';

export type SortOrder = 'newest' | 'oldest' | 'name' | 'value-desc' | 'value-asc';

/** Součet hodnot všech počítadel. Pro prázdný seznam vrací 0. */
export function sumValues(counters: readonly SavedCounter[]): number {
  return counters.reduce((sum, counter) => sum + counter.value, 0);
}

/** Převede text na tvar vhodný pro porovnávání: bez diakritiky a malými písmeny. */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Vrátí počítadla, jejichž název obsahuje hledaný text (bez ohledu na velikost písmen a diakritiku). */
export function filterByName(counters: readonly SavedCounter[], query: string): SavedCounter[] {
  const needle = normalize(query.trim());

  if (!needle) {
    return [...counters];
  }

  return counters.filter((counter) => normalize(counter.name).includes(needle));
}

function timestamp(counter: SavedCounter): number {
  const time = Date.parse(counter.createdAt);
  return Number.isNaN(time) ? 0 : time;
}

/** Vrátí seřazenou kopii seznamu, původní pole se nemění. */
export function sortCounters(counters: readonly SavedCounter[], order: SortOrder): SavedCounter[] {
  const sorted = [...counters];

  switch (order) {
    case 'newest':
      return sorted.sort((a, b) => timestamp(b) - timestamp(a));
    case 'oldest':
      return sorted.sort((a, b) => timestamp(a) - timestamp(b));
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'cs', { sensitivity: 'base' }));
    case 'value-desc':
      return sorted.sort((a, b) => b.value - a.value);
    case 'value-asc':
      return sorted.sort((a, b) => a.value - b.value);
  }
}
