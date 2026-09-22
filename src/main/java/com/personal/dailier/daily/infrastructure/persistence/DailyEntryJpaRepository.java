package com.personal.dailier.daily.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DailyEntryJpaRepository extends JpaRepository<DailyEntryEntity, Long> {

    Optional<DailyEntryEntity> findByDate(String date);
}

