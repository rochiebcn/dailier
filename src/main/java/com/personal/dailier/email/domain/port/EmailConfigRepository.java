package com.personal.dailier.email.domain.port;

import com.personal.dailier.email.domain.EmailConfig;

import java.util.Optional;

public interface EmailConfigRepository {

    Optional<EmailConfig> findFirst();

    Optional<EmailConfig> findById(Long id);

    EmailConfig save(EmailConfig config);
}

