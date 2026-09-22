import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyEntry } from '../model/daily-entry.model';

@Injectable({ providedIn: 'root' })
export class DailyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/daily-entries';

  getAll(): Observable<DailyEntry[]> {
    return this.http.get<DailyEntry[]>(this.apiUrl);
  }

  getByDate(date: string): Observable<DailyEntry> {
    return this.http.get<DailyEntry>(`${this.apiUrl}/${date}`);
  }

  save(entry: DailyEntry): Observable<DailyEntry> {
    return this.http.post<DailyEntry>(this.apiUrl, entry);
  }

  update(id: number, entry: DailyEntry): Observable<DailyEntry> {
    return this.http.put<DailyEntry>(`${this.apiUrl}/${id}`, entry);
  }
}

