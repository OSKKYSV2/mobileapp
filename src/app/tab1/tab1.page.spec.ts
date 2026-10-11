import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';
import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;

  const addMock = vi.fn<(counter: SavedCounter) => Promise<void>>();

  const counter: SavedCounter = {
    id: 'first',
    name: 'První',
    value: 1,
    createdAt: '2026-09-17T08:00:00.000Z',
  };

  beforeEach(() => {
    addMock.mockReset();
    addMock.mockResolvedValue(undefined);

    // Stránka nesmí sahat na úložiště, proto jí podstrčíme falešnou službu.
    TestBed.configureTestingModule({
      providers: [{ provide: CounterService, useValue: { add: addMock } }],
    });

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass the saved counter to the service', async () => {
    await component.onSaved(counter);

    expect(addMock).toHaveBeenCalledTimes(1);
    expect(addMock).toHaveBeenCalledWith(counter);
  });

  it('should not show a toast before anything is saved', () => {
    expect(component.toastOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('ion-toast')).not.toBeNull();
  });

  it('should show a success toast after the counter was saved', async () => {
    await component.onSaved(counter);

    expect(component.toastOpen()).toBe(true);
    expect(component.toastColor()).toBe('success');
    expect(component.toastMessage()).toBe('Počítadlo bylo uloženo.');
  });

  it('should show an error toast when saving fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    addMock.mockRejectedValue(new Error('storage unavailable'));

    try {
      await component.onSaved(counter);

      expect(component.toastOpen()).toBe(true);
      expect(component.toastColor()).toBe('danger');
      expect(component.toastMessage()).toBe('Počítadlo se nepodařilo uložit.');
      expect(errorSpy).toHaveBeenCalledTimes(1);
    } finally {
      errorSpy.mockRestore();
    }
  });
});
