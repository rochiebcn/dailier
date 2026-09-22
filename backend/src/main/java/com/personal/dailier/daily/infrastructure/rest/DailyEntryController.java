package com.personal.dailier.daily.infrastructure.rest;

import com.personal.dailier.daily.domain.DailyEntry;
import com.personal.dailier.daily.domain.port.DailyEntryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/daily-entries")
@RequiredArgsConstructor
public class DailyEntryController {

    private final DailyEntryUseCase dailyEntryUseCase;

    @GetMapping
    public List<DailyEntry> findAll() {
        return dailyEntryUseCase.findAll();
    }

    @GetMapping("/{date}")
    public ResponseEntity<DailyEntry> findByDate(@PathVariable String date) {
        return dailyEntryUseCase.findByDate(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DailyEntry save(@RequestBody DailyEntry entry) {
        return dailyEntryUseCase.save(entry);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DailyEntry> update(@PathVariable Long id, @RequestBody DailyEntry entry) {
        try {
            return ResponseEntity.ok(dailyEntryUseCase.update(id, entry));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

