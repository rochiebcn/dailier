package com.personal.dailier.settings.application;

import com.personal.dailier.settings.domain.Settings;
import com.personal.dailier.settings.domain.port.SettingsRepository;
import com.personal.dailier.settings.domain.port.SettingsUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class SettingsService implements SettingsUseCase {

    private final SettingsRepository settingsRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<Settings> getSettings() {
        return settingsRepository.findByUserId(DEFAULT_USER_ID);
    }

    @Override
    public Settings save(Settings settings) {
        var existing = settingsRepository.findByUserId(DEFAULT_USER_ID).orElse(null);
        var id = existing == null ? settings.id() : existing.id();

        return settingsRepository.save(new Settings(
                id,
                DEFAULT_USER_ID,
                settings.notificationTime(),
                settings.dailyHour(),
                settings.sendTime(),
                settings.emailAddress()
        ));
    }
}

