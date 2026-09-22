package com.personal.dailier.email.application;

import com.personal.dailier.daily.domain.port.DailyEntryRepository;
import com.personal.dailier.email.domain.port.DailySenderPort;
import com.personal.dailier.email.domain.port.DailySenderUseCase;
import com.personal.dailier.email.domain.port.EmailConfigRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DailySenderService implements DailySenderUseCase {

    private final EmailConfigRepository emailConfigRepository;
    private final DailyEntryRepository dailyEntryRepository;
    private final DailySenderPort dailySenderPort;

    @Override
    public void sendScheduledDaily() {
        String tomorrow = LocalDate.now().plusDays(1).toString();
        sendDailyForDate(tomorrow);
    }

    @Override
    public void sendDailyForDate(String date) {
        var emailConfig = emailConfigRepository.findFirst()
                .orElseThrow(() -> new EntityNotFoundException("No email configuration found"));

        var dailyEntry = dailyEntryRepository.findByDate(date)
                .orElseThrow(() -> new EntityNotFoundException("No daily entry found for date: " + date));

        log.info("Sending daily entry for date {} to {}", date, emailConfig.emailAddress());
        dailySenderPort.send(emailConfig.emailAddress(), dailyEntry);
    }
}

