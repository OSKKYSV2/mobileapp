import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';
import { Tab2Page } from './tab2.page';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;

  const getMock = vi.mocked(Preferences.get);
  const setMock = vi.mocked(Preferences.set);
  const removeMock = vi.mocked(Preferences.remove);

  const first: SavedCounter = {
    id: 'first',
    name: 'První',
    value: 1,
    createdAt: '2026-09-17T08:00:00.000Z',
  };

  const second: SavedCounter = {
    id: 'second',
    name: 'Druhé',
    value: 2,
    createdAt: '2026-09-17T09:00:00.000Z',
  };

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;

  // Vytvoří stránku, počká na dokončení načtení historie a překreslí šablonu.
  async function createPage(stored: SavedCounter[] | null): Promise<void> {
    getMock.mockResolvedValue({ value: stored === null ? null : JSON.stringify(stored) });

    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();

    await TestBed.inject(CounterService).initialize();
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.clearAllMocks();
    setMock.mockResolvedValue(undefined);
    removeMock.mockResolvedValue(undefined);
  });

  it('should create', async () => {
    await createPage(null);

    expect(component).toBeTruthy();
  });

  it('should show a loading state until the history is loaded', () => {
    getMock.mockReturnValue(new Promise(() => undefined));

    fixture = TestBed.createComponent(Tab2Page);
    fixture.detectChanges();

    expect(element().querySelector('ion-spinner')).not.toBeNull();
    expect(element().textContent).toContain('Načítám historii');
  });

  it('should show an empty state when there is no history', async () => {
    await createPage(null);

    expect(element().textContent).toContain('Historie je zatím prázdná.');
    expect(element().querySelectorAll('ion-item')).toHaveLength(0);
  });

  it('should list the stored counters with their values', async () => {
    await createPage([first, second]);

    const items = element().querySelectorAll('ion-item');

    expect(items).toHaveLength(2);
    // Výchozí řazení je od nejnovějšího záznamu.
    expect(items[0].textContent).toContain('Druhé');
    expect(items[1].textContent).toContain('První');
    expect(element().textContent).toMatch(/Počet záznamů:\s*2/);
  });

  it('should show the sum of the values of all stored counters', async () => {
    await createPage([first, second]);

    expect(component.total()).toBe(3);
    expect(element().textContent).toMatch(/Součet hodnot:\s*3/);
  });

  it('should update the sum when a record is removed', async () => {
    await createPage([first, second]);

    await component.remove('second');
    fixture.detectChanges();

    expect(component.total()).toBe(1);
    expect(element().textContent).toMatch(/Součet hodnot:\s*1/);
  });

  describe('search and sorting', () => {
    const third: SavedCounter = {
      id: 'third',
      name: 'Čaj',
      value: 10,
      createdAt: '2026-09-17T07:00:00.000Z',
    };

    const names = (): string[] =>
      Array.from(element().querySelectorAll('ion-item h2')).map((h2) => h2.textContent ?? '');

    it('should list the newest records first by default', async () => {
      await createPage([first, second, third]);

      expect(names()).toEqual(['Druhé', 'První', 'Čaj']);
    });

    it('should sort by name', async () => {
      await createPage([first, second, third]);

      component.sortOrder.set('name');
      fixture.detectChanges();

      expect(names()).toEqual(['Čaj', 'Druhé', 'První']);
    });

    it('should sort by value in both directions', async () => {
      await createPage([first, second, third]);

      component.sortOrder.set('value-desc');
      fixture.detectChanges();
      expect(names()).toEqual(['Čaj', 'Druhé', 'První']);

      component.sortOrder.set('value-asc');
      fixture.detectChanges();
      expect(names()).toEqual(['První', 'Druhé', 'Čaj']);
    });

    it('should filter the list by name without changing the stored data', async () => {
      await createPage([first, second, third]);

      component.searchTerm.set('caj');
      fixture.detectChanges();

      expect(names()).toEqual(['Čaj']);
      expect(component.counterService.counters()).toHaveLength(3);
      expect(component.total()).toBe(13);
      expect(setMock).not.toHaveBeenCalled();
    });

    it('should tell the user when no record matches the search', async () => {
      await createPage([first, second, third]);

      component.searchTerm.set('neexistuje');
      fixture.detectChanges();

      expect(element().querySelectorAll('ion-item')).toHaveLength(0);
      expect(element().textContent).toContain('Žádný záznam neodpovídá hledání.');
    });
  });

  it('should remove a single record and keep the others', async () => {
    await createPage([first, second]);

    await component.remove('first');
    fixture.detectChanges();

    const items = element().querySelectorAll('ion-item');

    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('Druhé');
    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([second]),
    });
  });

  it('should clear the whole history and show the empty state', async () => {
    await createPage([first, second]);

    await component.clear();
    fixture.detectChanges();

    expect(element().textContent).toContain('Historie je zatím prázdná.');
    expect(removeMock).toHaveBeenCalledWith({ key: 'saved-counters' });
  });
});
