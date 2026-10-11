import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from './counter.service';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('CounterService', () => {
  let service: CounterService;

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

  // Připraví obsah, který Preferences vrátí při načtení historie.
  function storeInPreferences(counters: SavedCounter[]): void {
    getMock.mockResolvedValue({ value: JSON.stringify(counters) });
  }

  beforeEach(() => {
    // Vynulujeme počty volání mocků z předchozího testu.
    vi.clearAllMocks();

    // Výchozí stav: v Preferences zatím není uložená historie.
    getMock.mockResolvedValue({ value: null });

    // Zápis i odstranění ve výchozím stavu úspěšně skončí.
    setMock.mockResolvedValue(undefined);
    removeMock.mockResolvedValue(undefined);

    // Pro každý test vytvoříme nové prostředí Angular dependency injection.
    TestBed.configureTestingModule({
      providers: [CounterService],
    });

    // Z testovacího injectoru získáme čerstvou instanci služby.
    service = TestBed.inject(CounterService);
  });

  it('should initialize only once', async () => {
    // Dvě volání bez čekání simulují souběžné požadavky na inicializaci.
    await Promise.all([service.initialize(), service.initialize()]);

    // Další volání proběhne až po dokončení první inicializace.
    await service.initialize();

    // Všechna volání musí sdílet jedinou operaci načtení Preferences.
    expect(getMock).toHaveBeenCalledTimes(1);

    // Služba dokončila inicializaci a při value: null má prázdnou historii.
    expect(service.initialized()).toBe(true);
    expect(service.counters()).toEqual([]);
  });

  it('should not be initialized before initialize() is called', () => {
    expect(service.initialized()).toBe(false);
    expect(service.counters()).toEqual([]);
    expect(getMock).not.toHaveBeenCalled();
  });

  // Scénář 1: načtení uložených dat
  it('should load stored counters into the signal', async () => {
    storeInPreferences([first, second]);

    await service.initialize();

    expect(service.counters()).toEqual([first, second]);
    expect(service.initialized()).toBe(true);
    expect(getMock).toHaveBeenCalledWith({ key: 'saved-counters' });
  });

  // Scénář 2: přidání záznamu
  it('should add a new counter to the beginning and persist it', async () => {
    storeInPreferences([first]);

    // add() si samo zajistí inicializaci, proto initialize() nevoláme.
    await service.add(second);

    expect(service.counters()).toEqual([second, first]);
    expect(setMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([second, first]),
    });
  });

  it('should persist the first counter into an empty history', async () => {
    await service.add(first);

    expect(service.counters()).toEqual([first]);
    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([first]),
    });
  });

  // Scénář 3: odstranění jednoho záznamu
  it('should remove only the matching counter and persist the rest', async () => {
    storeInPreferences([first, second]);

    await service.remove('first');

    expect(service.counters()).toEqual([second]);
    expect(setMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([second]),
    });
  });

  it('should keep the history unchanged when removing an unknown id', async () => {
    storeInPreferences([first, second]);

    await service.remove('does-not-exist');

    expect(service.counters()).toEqual([first, second]);
  });

  // Scénář 4: vymazání historie
  it('should clear the signal and remove only its own Preferences key', async () => {
    storeInPreferences([first, second]);

    await service.clear();

    expect(service.counters()).toEqual([]);
    expect(removeMock).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledWith({ key: 'saved-counters' });
    expect(setMock).not.toHaveBeenCalled();
  });

  // Scénář 5: poškozená uložená hodnota
  describe('with corrupted stored data', () => {
    let errorSpy: MockInstance<typeof console.error>;

    beforeEach(() => {
      // Spy musí vzniknout před initialize(), protože chyba se zapisuje během načítání.
      // mockImplementation zároveň potlačí očekávaný výpis v testovacím výstupu.
      errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
      // Vrátíme console.error do původního stavu i v případě, že očekávání selže.
      errorSpy.mockRestore();
    });

    it('should recover from invalid JSON', async () => {
      getMock.mockResolvedValue({ value: 'this is not a valid JSON' });

      await service.initialize();

      expect(service.counters()).toEqual([]);
      expect(service.initialized()).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        'Historii počítadel se nepodařilo načíst.',
        expect.any(Error),
      );
    });

    it('should recover from valid JSON that is not an array', async () => {
      getMock.mockResolvedValue({ value: JSON.stringify({ name: 'test' }) });

      await service.initialize();

      expect(service.counters()).toEqual([]);
      expect(service.initialized()).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        'Historii počítadel se nepodařilo načíst.',
        expect.any(Error),
      );
    });

    it('should recover when Preferences.get() itself fails', async () => {
      getMock.mockRejectedValue(new Error('storage unavailable'));

      await service.initialize();

      expect(service.counters()).toEqual([]);
      expect(service.initialized()).toBe(true);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
