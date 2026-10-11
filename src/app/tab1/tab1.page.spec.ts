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
});
