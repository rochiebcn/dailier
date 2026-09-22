package com.personal.dailier.daily.application;

import com.personal.dailier.daily.domain.DailyEntry;
import com.personal.dailier.daily.domain.port.DailyEntryRepository;
import com.personal.dailier.daily.domain.port.DailyEntryUseCase;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class DailyEntryService implements DailyEntryUseCase {

    private final DailyEntryRepository dailyEntryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DailyEntry> findAll() {
        return dailyEntryRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DailyEntry> findByDate(String date) {
        return dailyEntryRepository.findByDate(date);
    }

    @Override
    public DailyEntry save(DailyEntry entry) {
        return dailyEntryRepository.save(normalizeLineBreaks(entry));
    }

    @Override
    public DailyEntry update(Long id, DailyEntry entry) {
        dailyEntryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Daily entry not found with id: " + id));
        return dailyEntryRepository.save(normalizeLineBreaks(new DailyEntry(
                id,
                entry.date(),
                entry.didYesterday(),
                entry.willDoToday(),
                entry.blockers()
        )));
    }

    private DailyEntry normalizeLineBreaks(DailyEntry entry) {
        return new DailyEntry(
                entry.id(),
                entry.date(),
                normalizeLineBreaks(entry.didYesterday()),
                normalizeLineBreaks(entry.willDoToday()),
                normalizeLineBreaks(entry.blockers())
        );
    }

    private String normalizeLineBreaks(String value) {
        if (value == null) {
            return null;
        }

        return value.replace("\r\n", "\n").replace("\r", "\n");
    }
}

