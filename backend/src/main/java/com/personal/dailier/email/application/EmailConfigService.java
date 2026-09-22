package com.personal.dailier.email.application;

import com.personal.dailier.email.domain.EmailConfig;
import com.personal.dailier.email.domain.port.EmailConfigRepository;
import com.personal.dailier.email.domain.port.EmailConfigUseCase;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class EmailConfigService implements EmailConfigUseCase {

    private final EmailConfigRepository emailConfigRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<EmailConfig> getConfig() {
        return emailConfigRepository.findFirst();
    }

    @Override
    public EmailConfig save(EmailConfig config) {
        return emailConfigRepository.save(config);
    }

    @Override
    public EmailConfig update(Long id, EmailConfig config) {
        emailConfigRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Email config not found with id: " + id));
        return emailConfigRepository.save(new EmailConfig(id, config.sendTime(), config.emailAddress()));
    }
}

