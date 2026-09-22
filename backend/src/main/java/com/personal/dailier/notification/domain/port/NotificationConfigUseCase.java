package com.personal.dailier.notification.domain.port;

import com.personal.dailier.notification.domain.NotificationConfig;

import java.util.Optional;

public interface NotificationConfigUseCase {

    Optional<NotificationConfig> getConfig();

    NotificationConfig save(NotificationConfig config);

    NotificationConfig update(Long id, NotificationConfig config);
}

