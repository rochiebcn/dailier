package com.personal.dailier.settings.domain.port;

import com.personal.dailier.settings.domain.Settings;

import java.util.Optional;

public interface SettingsRepository {

    Optional<Settings> findFirst();

    Optional<Settings> findById(Long id);

    Optional<Settings> findByUserId(String userId);

    Settings save(Settings settings);
}

