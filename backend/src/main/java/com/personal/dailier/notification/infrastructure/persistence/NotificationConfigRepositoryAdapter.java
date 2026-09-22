package com.personal.dailier.notification.infrastructure.persistence;

import com.personal.dailier.notification.domain.NotificationConfig;
import com.personal.dailier.notification.domain.port.NotificationConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class NotificationConfigRepositoryAdapter implements NotificationConfigRepository {

    private final NotificationConfigJpaRepository jpaRepository;

    @Override
    public Optional<NotificationConfig> findFirst() {
        return jpaRepository.findFirstBy().map(this::toDomain);
    }

    @Override
    public Optional<NotificationConfig> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public NotificationConfig save(NotificationConfig config) {
        return toDomain(jpaRepository.save(toEntity(config)));
    }

    private NotificationConfig toDomain(NotificationConfigEntity entity) {
        return new NotificationConfig(entity.getId(), entity.getNotificationTime());
    }

    private NotificationConfigEntity toEntity(NotificationConfig domain) {
        return NotificationConfigEntity.builder()
                .id(domain.id())
                .notificationTime(domain.notificationTime())
                .build();
    }
}

