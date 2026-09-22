package com.personal.dailier.notification.domain.port;

import com.personal.dailier.notification.domain.NotificationConfig;

import java.util.Optional;

public interface NotificationConfigRepository {

    Optional<NotificationConfig> findFirst();

    Optional<NotificationConfig> findById(Long id);

    NotificationConfig save(NotificationConfig config);
}

