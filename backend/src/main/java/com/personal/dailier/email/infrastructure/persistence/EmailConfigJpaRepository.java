package com.personal.dailier.email.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailConfigJpaRepository extends JpaRepository<EmailConfigEntity, Long> {

    Optional<EmailConfigEntity> findFirstBy();
}

