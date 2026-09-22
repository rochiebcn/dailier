package com.personal.dailier.settings.domain.port;

import com.personal.dailier.settings.domain.Settings;

import java.util.Optional;

public interface SettingsUseCase {

    String DEFAULT_USER_ID = "USER_ID";

    Optional<Settings> getSettings();

    Settings save(Settings settings);
}

