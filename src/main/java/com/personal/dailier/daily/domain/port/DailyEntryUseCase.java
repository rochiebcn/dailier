package com.personal.dailier.daily.domain.port;

import com.personal.dailier.daily.domain.DailyEntry;

import java.util.List;
import java.util.Optional;

public interface DailyEntryUseCase {

    List<DailyEntry> findAll();

    Optional<DailyEntry> findByDate(String date);

    DailyEntry save(DailyEntry entry);

    DailyEntry update(Long id, DailyEntry entry);
}

