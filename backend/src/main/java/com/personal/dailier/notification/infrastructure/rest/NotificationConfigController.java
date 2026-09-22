package com.personal.dailier.notification.infrastructure.rest;

import com.personal.dailier.notification.domain.NotificationConfig;
import com.personal.dailier.notification.domain.port.NotificationConfigUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification-config")
@RequiredArgsConstructor
public class NotificationConfigController {

    private final NotificationConfigUseCase notificationConfigUseCase;

    @GetMapping
    public ResponseEntity<NotificationConfig> getConfig() {
        return notificationConfigUseCase.getConfig()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationConfig save(@RequestBody NotificationConfig config) {
        return notificationConfigUseCase.save(config);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationConfig> update(@PathVariable Long id, @RequestBody NotificationConfig config) {
        try {
            return ResponseEntity.ok(notificationConfigUseCase.update(id, config));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

