package com.personal.dailier.email.application;

import com.personal.dailier.daily.domain.DailyEntry;
import com.personal.dailier.daily.domain.port.DailyEntryRepository;
import com.personal.dailier.email.domain.port.DailySenderPort;
import com.personal.dailier.settings.domain.Settings;
import com.personal.dailier.settings.domain.port.SettingsRepository;
import com.personal.dailier.settings.domain.port.SettingsUseCase;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DailySenderServiceTest {

    @Mock
    private SettingsRepository settingsRepository;

    @Mock
    private DailyEntryRepository dailyEntryRepository;

    @Mock
    private DailySenderPort dailySenderPort;

    @InjectMocks
    private DailySenderService dailySenderService;

    @Test
    void sendScheduledDaily_shouldSendLatestDailyEntry() {
        var latestDailyEntry = new DailyEntry(1L, "2026-05-30", "did", "will", "none");
        var settings = new Settings(1L, SettingsUseCase.DEFAULT_USER_ID, "17:00", "10:00", "09:00", "team@company.com", "mail.company.com", 25);

        when(dailyEntryRepository.findLatest()).thenReturn(Optional.of(latestDailyEntry));
        when(settingsRepository.findByUserId(SettingsUseCase.DEFAULT_USER_ID)).thenReturn(Optional.of(settings));
        when(dailyEntryRepository.findByDate(latestDailyEntry.date())).thenReturn(Optional.of(latestDailyEntry));

        dailySenderService.sendScheduledDaily();

        verify(dailyEntryRepository).findLatest();
        verify(dailyEntryRepository).findByDate(latestDailyEntry.date());
        verify(dailySenderPort).send(settings.emailAddress(), latestDailyEntry);
    }

    @Test
    void sendScheduledDaily_shouldThrowWhenThereIsNoDailyEntry() {
        when(dailyEntryRepository.findLatest()).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> dailySenderService.sendScheduledDaily());
    }
}

