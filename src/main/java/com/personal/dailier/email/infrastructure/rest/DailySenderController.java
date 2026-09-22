package com.personal.dailier.email.infrastructure.rest;

import com.personal.dailier.email.domain.port.DailySenderUseCase;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email/send")
@RequiredArgsConstructor
public class DailySenderController {

    private final DailySenderUseCase dailySenderUseCase;

    @PostMapping
    public ResponseEntity<Void> sendScheduledDaily() {
        try {
            dailySenderUseCase.sendScheduledDaily();
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{date}")
    public ResponseEntity<Void> sendDailyForDate(@PathVariable String date) {
        try {
            dailySenderUseCase.sendDailyForDate(date);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

