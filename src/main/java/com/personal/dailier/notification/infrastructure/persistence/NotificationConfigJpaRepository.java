package com.personal.dailier.notification.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationConfigJpaRepository extends JpaRepository<NotificationConfigEntity, Long> {

    Optional<NotificationConfigEntity> findFirstBy();
}

