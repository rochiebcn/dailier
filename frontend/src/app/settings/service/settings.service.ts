import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Settings } from '../model/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/settings';
  private readonly sendUrl = '/api/email/send';

  get(): Observable<Settings> {
    return this.http.get<Settings>(this.apiUrl);
  }

  save(settings: Settings): Observable<Settings> {
    return this.http.put<Settings>(this.apiUrl, settings);
  }

  sendNow(): Observable<void> {
    return this.http.post<void>(this.sendUrl, null);
  }

  sendForDate(date: string): Observable<void> {
    return this.http.post<void>(`${this.sendUrl}/${date}`, null);
  }
}

