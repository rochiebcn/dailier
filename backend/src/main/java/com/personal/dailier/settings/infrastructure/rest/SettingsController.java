package com.personal.dailier.settings.infrastructure.rest;

import com.personal.dailier.settings.domain.Settings;
import com.personal.dailier.settings.domain.port.SettingsUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsUseCase settingsUseCase;

    @GetMapping
    public ResponseEntity<Settings> getSettings() {
        return settingsUseCase.getSettings()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<Settings> upsert(@RequestBody Settings settings) {
        return ResponseEntity.ok(settingsUseCase.save(settings));
    }

    @ResponseStatus(HttpStatus.CREATED)
    @org.springframework.web.bind.annotation.PostMapping
    public Settings create(@RequestBody Settings settings) {
        return settingsUseCase.save(settings);
    }
}

