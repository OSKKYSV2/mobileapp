import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add the newest saved counter to the beginning', () => {
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

    component.onSaved(first);
    component.onSaved(second);

    expect(component.savedCounters).toEqual([second, first]);
  });
});
