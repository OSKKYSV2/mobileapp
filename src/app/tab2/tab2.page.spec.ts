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
    expect(items[0].textContent).toContain('První');
    expect(items[1].textContent).toContain('Druhé');
    expect(element().textContent).toContain('Počet záznamů: 2');
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
