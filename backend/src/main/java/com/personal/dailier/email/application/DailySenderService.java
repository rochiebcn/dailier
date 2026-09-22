package com.personal.dailier.email.application;

import com.personal.dailier.daily.domain.port.DailyEntryRepository;
import com.personal.dailier.email.domain.port.DailySenderPort;
import com.personal.dailier.email.domain.port.DailySenderUseCase;
import com.personal.dailier.settings.domain.port.SettingsRepository;
import com.personal.dailier.settings.domain.port.SettingsUseCase;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DailySenderService implements DailySenderUseCase {

    private final SettingsRepository settingsRepository;
    private final DailyEntryRepository dailyEntryRepository;
    private final DailySenderPort dailySenderPort;

    @Override
    public void sendScheduledDaily() {
        var latestDailyEntry = dailyEntryRepository.findLatest()
                .orElseThrow(() -> new EntityNotFoundException("No daily entry found"));

        sendDailyForDate(latestDailyEntry.date());
    }

    @Override
    public void sendDailyForDate(String date) {
        var settings = settingsRepository.findByUserId(SettingsUseCase.DEFAULT_USER_ID)
                .orElseThrow(() -> new EntityNotFoundException("No settings found"));

        if (settings.emailAddress() == null || settings.emailAddress().isBlank()) {
            throw new EntityNotFoundException("No email address configured");
        }

        var dailyEntry = dailyEntryRepository.findByDate(date)
                .orElseThrow(() -> new EntityNotFoundException("No daily entry found for date: " + date));

        log.info("Sending daily entry for date {} to {}", date, settings.emailAddress());
        dailySenderPort.send(settings.emailAddress(), dailyEntry);
    }
}

