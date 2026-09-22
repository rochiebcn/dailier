package com.personal.dailier.settings.infrastructure.persistence;

import com.personal.dailier.settings.domain.Settings;
import com.personal.dailier.settings.domain.port.SettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SettingsRepositoryAdapter implements SettingsRepository {

    private final SettingsJpaRepository jpaRepository;

    @Override
    public Optional<Settings> findFirst() {
        return jpaRepository.findFirstByOrderByIdAsc().map(this::toDomain);
    }

    @Override
    public Optional<Settings> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Settings> findByUserId(String userId) {
        return jpaRepository.findByUserId(userId).map(this::toDomain);
    }

    @Override
    public Settings save(Settings settings) {
        return toDomain(jpaRepository.save(toEntity(settings)));
    }

    private Settings toDomain(SettingsEntity entity) {
        return new Settings(
                entity.getId(),
                entity.getUserId(),
                entity.getNotificationTime(),
                entity.getDailyHour(),
                entity.getSendTime(),
                entity.getEmailAddress()
        );
    }

    private SettingsEntity toEntity(Settings domain) {
        return SettingsEntity.builder()
                .id(domain.id())
                .userId(domain.userId())
                .notificationTime(domain.notificationTime())
                .dailyHour(domain.dailyHour())
                .sendTime(domain.sendTime())
                .emailAddress(domain.emailAddress())
                .build();
    }
}

