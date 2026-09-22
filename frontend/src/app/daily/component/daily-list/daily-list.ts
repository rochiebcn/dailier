import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { DailyService } from '../../service/daily.service';
import { DailyEntry } from '../../model/daily-entry.model';
import { SettingsService } from '../../../settings/service/settings.service';
import { I18nPipe } from '../../../shared/i18n/i18n.pipe';
import { I18nService } from '../../../shared/i18n/i18n.service';

@Component({
  selector: 'app-daily-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    I18nPipe,
  ],
  templateUrl: './daily-list.html',
  styleUrl: './daily-list.scss',
})
export class DailyListComponent implements OnInit {
  private readonly dailyService = inject(DailyService);
  private readonly settingsService = inject(SettingsService);
  private readonly i18n = inject(I18nService);

  protected readonly isLoading = signal(true);
  protected readonly entries = signal<DailyEntry[]>([]);
  protected readonly previewDate = signal<string | null>(null);
  protected readonly sendingDate = signal<string | null>(null);
  protected readonly sendFeedback = signal<{
    date: string;
    status: 'success' | 'error' | 'not-found';
  } | null>(null);

  ngOnInit(): void {
    this.dailyService.getAll().subscribe({
      next: (all) => {
        const sorted = [...all].sort((a, b) => b.date.localeCompare(a.date));
        this.entries.set(sorted);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  protected togglePreview(date: string): void {
    this.previewDate.set(this.previewDate() === date ? null : date);
  }

  protected formatDisplayDate(date: string): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
  }

  protected formatDailyPreview(entry: DailyEntry): string {
    const blockers = entry.blockers?.trim() ? entry.blockers : '-';
    return [
      this.i18n.t('dailyPreview.title', { date: this.formatDisplayDate(entry.date) }),
      '',
      this.i18n.t('dailyPreview.did'),
      entry.didYesterday,
      '',
      this.i18n.t('dailyPreview.willDo'),
      entry.willDoToday,
      '',
      this.i18n.t('dailyPreview.blockers'),
      blockers,
    ].join('\n');
  }

  protected sendDailyByEmail(date: string): void {
    this.sendingDate.set(date);
    this.sendFeedback.set(null);

    this.settingsService.sendForDate(date).subscribe({
      next: () => {
        this.sendingDate.set(null);
        this.sendFeedback.set({ date, status: 'success' });
      },
      error: (err) => {
        this.sendingDate.set(null);
        this.sendFeedback.set({
          date,
          status: err.status === 404 ? 'not-found' : 'error',
        });
      },
    });
  }
}
