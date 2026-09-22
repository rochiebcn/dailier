package com.personal.dailier.email.infrastructure.persistence;

import com.personal.dailier.email.domain.EmailConfig;
import com.personal.dailier.email.domain.port.EmailConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class EmailConfigRepositoryAdapter implements EmailConfigRepository {

    private final EmailConfigJpaRepository jpaRepository;

    @Override
    public Optional<EmailConfig> findFirst() {
        return jpaRepository.findFirstBy().map(this::toDomain);
    }

    @Override
    public Optional<EmailConfig> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public EmailConfig save(EmailConfig config) {
        return toDomain(jpaRepository.save(toEntity(config)));
    }

    private EmailConfig toDomain(EmailConfigEntity entity) {
        return new EmailConfig(entity.getId(), entity.getSendTime(), entity.getEmailAddress());
    }

    private EmailConfigEntity toEntity(EmailConfig domain) {
        return EmailConfigEntity.builder()
                .id(domain.id())
                .sendTime(domain.sendTime())
                .emailAddress(domain.emailAddress())
                .build();
    }
}

