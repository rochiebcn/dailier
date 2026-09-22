package com.personal.dailier.email.domain.port;

import com.personal.dailier.email.domain.EmailConfig;

import java.util.Optional;

public interface EmailConfigUseCase {

    Optional<EmailConfig> getConfig();

    EmailConfig save(EmailConfig config);

    EmailConfig update(Long id, EmailConfig config);
}

