package com.personal.dailier.daily.domain.port;

import com.personal.dailier.daily.domain.DailyEntry;

import java.util.List;
import java.util.Optional;

public interface DailyEntryRepository {

    List<DailyEntry> findAll();

    Optional<DailyEntry> findLatest();

    Optional<DailyEntry> findByDate(String date);

    Optional<DailyEntry> findById(Long id);

    DailyEntry save(DailyEntry entry);
}

