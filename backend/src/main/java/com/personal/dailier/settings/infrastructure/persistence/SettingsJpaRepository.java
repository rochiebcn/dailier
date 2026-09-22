package com.personal.dailier.settings.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SettingsJpaRepository extends JpaRepository<SettingsEntity, Long> {

    Optional<SettingsEntity> findByUserId(String userId);

    Optional<SettingsEntity> findFirstByOrderByIdAsc();
}

