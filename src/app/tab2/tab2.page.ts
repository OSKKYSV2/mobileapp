import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertButton,
  IonAlert,
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
  IonToast,
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
    IonAlert,
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
    IonToast,
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

  readonly clearAlertButtons: AlertButton[] = [
    { text: 'Zrušit', role: 'cancel' },
    { text: 'Vymazat vše', role: 'confirm' },
  ];

  readonly searchTerm = signal('');
  readonly sortOrder = signal<SortOrder>('newest');

  readonly clearAlertOpen = signal(false);
  readonly toastOpen = signal(false);
  readonly toastMessage = signal('');
  readonly toastColor = signal<'success' | 'danger'>('success');

  // Součet se počítá ze všech záznamů, hledání ho neovlivňuje.
  readonly total = computed(() => sumValues(this.counterService.counters()));

  readonly visibleCounters = computed(() =>
    sortCounters(filterByName(this.counterService.counters(), this.searchTerm()), this.sortOrder()),
  );

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  async remove(id: string): Promise<void> {
    try {
      await this.counterService.remove(id);
      this.showToast('Záznam byl odstraněn.', 'success');
    } catch (error) {
      console.error('Záznam se nepodařilo odstranit.', error);
      this.showToast('Záznam se nepodařilo odstranit.', 'danger');
    }
  }

  /** Jen otevře potvrzovací dialog, samotné vymazání proběhne až po potvrzení. */
  requestClear(): void {
    this.clearAlertOpen.set(true);
  }

  async onClearAlertDismissed(event: CustomEvent<{ role?: string }>): Promise<void> {
    this.clearAlertOpen.set(false);

    if (event.detail.role === 'confirm') {
      await this.clear();
    }
  }

  async clear(): Promise<void> {
    try {
      await this.counterService.clear();
      this.showToast('Historie byla vymazána.', 'success');
    } catch (error) {
      console.error('Historii se nepodařilo vymazat.', error);
      this.showToast('Historii se nepodařilo vymazat.', 'danger');
    }
  }

  private showToast(message: string, color: 'success' | 'danger'): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.toastOpen.set(true);
  }
}
