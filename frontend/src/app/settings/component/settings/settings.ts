import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { I18nPipe } from '../../../shared/i18n/i18n.pipe';
import { I18nService } from '../../../shared/i18n/i18n.service';
import { Settings } from '../../model/settings.model';
import { SettingsService } from '../../service/settings.service';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    NgxMatTimepickerModule,
    I18nPipe,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);
  private readonly i18n = inject(I18nService);

  protected readonly isSaving = signal(false);
  protected readonly savedSuccessfully = signal(false);
  protected readonly isSending = signal(false);
  protected readonly sendResult = signal<'success' | 'not-found' | null>(null);
  protected readonly sendError = signal<string | null>(null);

  protected readonly settings = signal<Settings>({
    userId: 'USER_ID',
    notificationTime: '17:00',
    dailyHour: '10:00',
    sendTime: '08:00',
    emailAddress: '',
    mailHost: '',
    mailPort: 25,
  });

  protected t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }

  ngOnInit(): void {
    this.settingsService.get().subscribe({
      next: (existing) => this.settings.set(existing),
      error: () => {},
    });
  }

  protected onNotificationTimeChange(notificationTime: string): void {
    this.settings.update((current) => ({ ...current, notificationTime }));
  }

  protected onDailyHourChange(dailyHour: string): void {
    this.settings.update((current) => ({ ...current, dailyHour }));
  }

  protected onSendTimeChange(sendTime: string): void {
    this.settings.update((current) => ({ ...current, sendTime }));
  }

  protected onEmailAddressChange(emailAddress: string): void {
    this.settings.update((current) => ({ ...current, emailAddress }));
  }

  protected onMailHostChange(mailHost: string): void {
    this.settings.update((current) => ({ ...current, mailHost }));
  }

  protected onMailPortChange(mailPort: number): void {
    this.settings.update((current) => ({ ...current, mailPort }));
  }

  protected save(): void {
    this.isSaving.set(true);
    this.savedSuccessfully.set(false);

    this.settingsService.save(this.settings()).subscribe({
      next: (saved) => {
        this.settings.set(saved);
        this.isSaving.set(false);
        this.savedSuccessfully.set(true);
      },
      error: () => this.isSaving.set(false),
    });
  }

  protected sendNow(): void {
    this.isSending.set(true);
    this.sendResult.set(null);
    this.sendError.set(null);

    this.settingsService.sendNow().subscribe({
      next: () => {
        this.isSending.set(false);
        this.sendResult.set('success');
      },
      error: (err) => {
        this.isSending.set(false);
        if (err.status === 404) {
          this.sendResult.set('not-found');
        } else {
          this.sendResult.set(null);
          this.sendError.set(err.error ? String(err.error) : '');
        }
      },
    });
  }
}

