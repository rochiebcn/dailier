import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { DailyEntry } from '../../model/daily-entry.model';
import { DailyService } from '../../service/daily.service';
import { SettingsService } from '../../../settings/service/settings.service';
import { DailyFormComponent } from './daily-form';

describe('DailyFormComponent', () => {
  let dailyService: {
    getByDate: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let settingsService: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();

    dailyService = {
      getByDate: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    settingsService = {
      get: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: DailyService, useValue: dailyService },
        { provide: SettingsService, useValue: settingsService },
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createComponent(): DailyFormComponent {
    return TestBed.runInInjectionContext(() => new DailyFormComponent());
  }

  function mockMissingDailyFor(date: string, previousEntry?: DailyEntry): void {
    dailyService.getByDate.mockImplementation((requestedDate: string) => {
      if (previousEntry && requestedDate === previousEntry.date) {
        return of(previousEntry);
      }

      if (requestedDate === date) {
        return throwError(() => ({ status: 404 }));
      }

      return throwError(() => ({ status: 404 }));
    });
  }

  it('loads tomorrow when the current time is after dailyHour', () => {
    vi.setSystemTime(new Date('2026-05-26T11:30:00'));
    settingsService.get.mockReturnValue(of({
      notificationTime: '17:00',
      dailyHour: '10:00',
      sendTime: '08:00',
      emailAddress: 'team@example.com',
    }));
    mockMissingDailyFor('2026-05-27', {
      id: 10,
      date: '2026-05-26',
      didYesterday: 'Closed PRs',
      willDoToday: 'Prepare tomorrow daily',
      blockers: '',
    });

    const component = createComponent();
    component.ngOnInit();

    expect(settingsService.get).toHaveBeenCalledOnce();
    expect(dailyService.getByDate).toHaveBeenNthCalledWith(1, '2026-05-26');
    expect(dailyService.getByDate).toHaveBeenNthCalledWith(2, '2026-05-27');
    expect((component as any).entry.date).toBe('2026-05-27');
    expect((component as any).selectedDate.toISOString().startsWith('2026-05-27')).toBe(true);
    expect((component as any).isEditingExisting()).toBe(false);
    expect((component as any).showTomorrowNotice()).toBe(true);
  });

  it('keeps today when the current time is exactly dailyHour', () => {
    vi.setSystemTime(new Date('2026-05-26T10:00:00'));
    settingsService.get.mockReturnValue(of({
      notificationTime: '17:00',
      dailyHour: '10:00',
      sendTime: '08:00',
      emailAddress: 'team@example.com',
    }));
    mockMissingDailyFor('2026-05-26', {
      id: 11,
      date: '2026-05-25',
      didYesterday: 'Worked on setup',
      willDoToday: 'Continue implementation',
      blockers: '',
    });

    const component = createComponent();
    component.ngOnInit();

    expect(dailyService.getByDate).toHaveBeenNthCalledWith(1, '2026-05-25');
    expect(dailyService.getByDate).toHaveBeenNthCalledWith(2, '2026-05-26');
    expect((component as any).entry.date).toBe('2026-05-26');
    expect((component as any).isEditingExisting()).toBe(false);
    expect((component as any).showTomorrowNotice()).toBe(false);
  });

  it('falls back to today when settings cannot be loaded', () => {
    vi.setSystemTime(new Date('2026-05-26T23:15:00'));
    settingsService.get.mockReturnValue(throwError(() => ({ status: 500 })));
    mockMissingDailyFor('2026-05-26');

    const component = createComponent();
    component.ngOnInit();

    expect(dailyService.getByDate).toHaveBeenNthCalledWith(1, '2026-05-25');
    expect(dailyService.getByDate).toHaveBeenNthCalledWith(2, '2026-05-26');
    expect((component as any).entry.date).toBe('2026-05-26');
    expect((component as any).showTomorrowNotice()).toBe(false);
  });

  it('hides the tomorrow notice when a daily for tomorrow already exists', () => {
    vi.setSystemTime(new Date('2026-05-26T11:30:00'));
    settingsService.get.mockReturnValue(of({
      notificationTime: '17:00',
      dailyHour: '10:00',
      sendTime: '08:00',
      emailAddress: 'team@example.com',
    }));
    dailyService.getByDate.mockImplementation((requestedDate: string) => {
      if (requestedDate === '2026-05-26') {
        return of({
          id: 10,
          date: '2026-05-26',
          didYesterday: 'Closed PRs',
          willDoToday: 'Prepare tomorrow daily',
          blockers: '',
        });
      }

      if (requestedDate === '2026-05-27') {
        return of({
          id: 12,
          date: '2026-05-27',
          didYesterday: 'Reviewed backlog',
          willDoToday: 'Ship release',
          blockers: '',
        });
      }

      return throwError(() => ({ status: 404 }));
    });

    const component = createComponent();
    component.ngOnInit();

    expect((component as any).isEditingExisting()).toBe(true);
    expect((component as any).showTomorrowNotice()).toBe(false);
    expect((component as any).entry.date).toBe('2026-05-27');
  });
});

