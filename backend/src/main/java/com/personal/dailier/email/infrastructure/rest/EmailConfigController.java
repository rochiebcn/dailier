package com.personal.dailier.email.infrastructure.rest;

import com.personal.dailier.email.domain.EmailConfig;
import com.personal.dailier.email.domain.port.EmailConfigUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email-config")
@RequiredArgsConstructor
public class EmailConfigController {

    private final EmailConfigUseCase emailConfigUseCase;

    @GetMapping
    public ResponseEntity<EmailConfig> getConfig() {
        return emailConfigUseCase.getConfig()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmailConfig save(@RequestBody EmailConfig config) {
        return emailConfigUseCase.save(config);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmailConfig> update(@PathVariable Long id, @RequestBody EmailConfig config) {
        try {
            return ResponseEntity.ok(emailConfigUseCase.update(id, config));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

