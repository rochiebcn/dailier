import {Component, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {DailyService} from '../../service/daily.service';
import {DailyEntry} from '../../model/daily-entry.model';
import {I18nPipe} from '../../../shared/i18n/i18n.pipe';
import {SettingsService} from '../../../settings/service/settings.service';
import {switchMap} from 'rxjs';

@Component({
  selector: 'app-daily-form',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    I18nPipe
  ],
  templateUrl: './daily-form.html',
  styleUrl: './daily-form.scss'
})
export class DailyFormComponent implements OnInit {
  private readonly dailyService = inject(DailyService);
  private readonly settingsService = inject(SettingsService);

  protected readonly today = this.toIsoDate(new Date());
  protected readonly previousEntry = signal<DailyEntry | null>(null);
  protected readonly isSaving = signal(false);
  protected readonly savedSuccessfully = signal(false);
  protected readonly isSendingAndSaving = signal(false);
  protected readonly sendAndSaveResult = signal<'success' | 'not-found' | 'error' | null>(null);
  protected readonly sendAndSaveError = signal<string | null>(null);
  protected readonly isEditingExisting = signal(false);
  protected readonly showTomorrowNotice = signal(false);
  protected readonly didYesterdayLabelKey = signal('dailyForm.field.didYesterday');

  protected entry: DailyEntry = {
    date: this.today,
    didYesterday: '',
    willDoToday: '',
    blockers: ''
  };
  protected selectedDate = this.toDate(this.today);

  private existingEntryId: number | undefined;

  ngOnInit(): void {
    this.settingsService.get().subscribe({
      next: (settings) => this.loadForDate(this.getInitialEntryDate(settings.dailyHour)),
      error: () => this.loadForDate(this.today)
    });
  }

  protected onDateChange(selectedDate: Date | null): void {
    if (!selectedDate) return;

    const date = this.toIsoDate(selectedDate);
    this.entry = {...this.entry, date};
    this.selectedDate = this.toDate(date);
    this.savedSuccessfully.set(false);
    this.sendAndSaveResult.set(null);
    this.sendAndSaveError.set(null);
    this.loadForDate(date);
  }

  protected save(): void {
    this.isSaving.set(true);
    this.savedSuccessfully.set(false);

    const request$ = this.existingEntryId
      ? this.dailyService.update(this.existingEntryId, this.entry)
      : this.dailyService.save(this.entry);

    request$.subscribe({
      next: (saved) => {
        this.existingEntryId = saved.id;
        this.isEditingExisting.set(true);
        this.isSaving.set(false);
        this.savedSuccessfully.set(true);
      },
      error: () => this.isSaving.set(false)
    });
  }

  protected saveAndSend(): void {
    this.isSendingAndSaving.set(true);
    this.savedSuccessfully.set(false);
    this.sendAndSaveResult.set(null);
    this.sendAndSaveError.set(null);

    const save$ = this.existingEntryId
      ? this.dailyService.update(this.existingEntryId, this.entry)
      : this.dailyService.save(this.entry);

    save$.pipe(
      switchMap((saved) => {
        this.existingEntryId = saved.id;
        this.isEditingExisting.set(true);
        return this.settingsService.sendForDate(saved.date);
      })
    ).subscribe({
      next: () => {
        this.isSendingAndSaving.set(false);
        this.sendAndSaveResult.set('success');
      },
      error: (err) => {
        this.isSendingAndSaving.set(false);
        if (err.status === 404) {
          this.sendAndSaveResult.set('not-found');
        } else {
          this.sendAndSaveResult.set('error');
          this.sendAndSaveError.set(err.error ? String(err.error) : null);
        }
      }
    });
  }

  protected formatDisplayDate(dateStr: string): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(this.toDate(dateStr));
  }

  private loadForDate(date: string): void {
    this.previousEntry.set(null);
    this.showTomorrowNotice.set(false);
    this.updateDidYesterdayLabel(date);

    const prevWorkday = this.getPreviousWorkdayOf(date);
    this.dailyService.getByDate(prevWorkday).subscribe({
      next: (prev) => this.previousEntry.set(prev),
      error: () => this.previousEntry.set(null)
    });

    this.dailyService.getByDate(date).subscribe({
      next: (existing) => {
        this.existingEntryId = existing.id;
        this.isEditingExisting.set(true);
        this.showTomorrowNotice.set(false);
        this.entry = {...existing};
        this.selectedDate = this.toDate(existing.date);
      },
      error: () => {
        this.existingEntryId = undefined;
        this.isEditingExisting.set(false);
        this.showTomorrowNotice.set(this.isTomorrowDate(date));
        this.entry = {date, didYesterday: '', willDoToday: '', blockers: ''};
        this.selectedDate = this.toDate(date);
      }
    });
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toDate(dateStr: string): Date {
    // Midday avoids timezone offset edge-cases around midnight.
    return new Date(`${dateStr}T12:00:00`);
  }

  private getInitialEntryDate(dailyHour?: string): string {
    const now = new Date();

    if (!this.hasDailyHourPassed(now, dailyHour)) {
      return this.toIsoDate(now);
    }

    return this.toIsoDate(this.getNextWorkday(now));
  }

  private hasDailyHourPassed(now: Date, dailyHour?: string): boolean {
    if (!dailyHour) {
      return false;
    }

    const [hoursPart, minutesPart = '0'] = dailyHour.split(':');
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart);

    if (
      !Number.isInteger(hours)
      || !Number.isInteger(minutes)
      || hours < 0
      || hours > 23
      || minutes < 0
      || minutes > 59
    ) {
      return false;
    }

    const dailyCutoff = new Date(now);
    dailyCutoff.setHours(hours, minutes, 0, 0);
    return now.getTime() > dailyCutoff.getTime();
  }

  private isTomorrowDate(date: string): boolean {
    return date === this.toIsoDate(this.getNextWorkday(new Date()));
  }

  private updateDidYesterdayLabel(date: string): void {
    const day = new Date(`${date}T12:00:00`).getDay();
    const key = day === 5 ? 'dailyForm.field.didFriday' : 'dailyForm.field.didYesterday';
    this.didYesterdayLabelKey.set(key);
  }

  private getNextWorkday(date: Date): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    if (next.getDay() === 6) next.setDate(next.getDate() + 2);
    else if (next.getDay() === 0) next.setDate(next.getDate() + 1);
    return next;
  }

  private getPreviousWorkdayOf(dateStr: string): string {
    const date = new Date(dateStr + 'T12:00:00');
    date.setDate(date.getDate() - (date.getDay() === 1 ? 3 : 1));
    return date.toISOString().split('T')[0];
  }
}
