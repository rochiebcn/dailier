package com.personal.dailier.daily.infrastructure.persistence;

import com.personal.dailier.daily.domain.DailyEntry;
import com.personal.dailier.daily.domain.port.DailyEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DailyEntryRepositoryAdapter implements DailyEntryRepository {

    private final DailyEntryJpaRepository jpaRepository;

    @Override
    public List<DailyEntry> findAll() {
        return jpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<DailyEntry> findLatest() {
        return jpaRepository.findTopByOrderByDateDesc().map(this::toDomain);
    }

    @Override
    public Optional<DailyEntry> findByDate(String date) {
        return jpaRepository.findByDate(date).map(this::toDomain);
    }

    @Override
    public Optional<DailyEntry> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public DailyEntry save(DailyEntry entry) {
        return toDomain(jpaRepository.save(toEntity(entry)));
    }

    private DailyEntry toDomain(DailyEntryEntity entity) {
        return new DailyEntry(entity.getId(), entity.getDate(), entity.getDidYesterday(), entity.getWillDoToday(), entity.getBlockers());
    }

    private DailyEntryEntity toEntity(DailyEntry domain) {
        return DailyEntryEntity.builder()
                .id(domain.id())
                .date(domain.date())
                .didYesterday(domain.didYesterday())
                .willDoToday(domain.willDoToday())
                .blockers(domain.blockers())
                .build();
    }
}

