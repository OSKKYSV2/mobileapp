import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { CounterService } from '../services/counter.service';
import { filterByName, SortOrder, sortCounters, sumValues } from '../utils/counter-list';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    FormsModule,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);

  readonly sortOptions: { value: SortOrder; label: string }[] = [
    { value: 'newest', label: 'Od nejnovějších' },
    { value: 'oldest', label: 'Od nejstarších' },
    { value: 'name', label: 'Podle názvu' },
    { value: 'value-desc', label: 'Podle hodnoty (sestupně)' },
    { value: 'value-asc', label: 'Podle hodnoty (vzestupně)' },
  ];

  readonly searchTerm = signal('');
  readonly sortOrder = signal<SortOrder>('newest');

  // Součet se počítá ze všech záznamů, hledání ho neovlivňuje.
  readonly total = computed(() => sumValues(this.counterService.counters()));

  readonly visibleCounters = computed(() =>
    sortCounters(filterByName(this.counterService.counters(), this.searchTerm()), this.sortOrder()),
  );

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
  }

  async clear(): Promise<void> {
    await this.counterService.clear();
  }
}
