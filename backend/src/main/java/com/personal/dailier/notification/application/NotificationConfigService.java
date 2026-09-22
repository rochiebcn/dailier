package com.personal.dailier.notification.application;

import com.personal.dailier.notification.domain.NotificationConfig;
import com.personal.dailier.notification.domain.port.NotificationConfigRepository;
import com.personal.dailier.notification.domain.port.NotificationConfigUseCase;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationConfigService implements NotificationConfigUseCase {

    private final NotificationConfigRepository notificationConfigRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<NotificationConfig> getConfig() {
        return notificationConfigRepository.findFirst();
    }

    @Override
    public NotificationConfig save(NotificationConfig config) {
        return notificationConfigRepository.save(config);
    }

    @Override
    public NotificationConfig update(Long id, NotificationConfig config) {
        notificationConfigRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification config not found with id: " + id));
        return notificationConfigRepository.save(new NotificationConfig(id, config.notificationTime()));
    }
}

