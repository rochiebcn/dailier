package com.personal.dailier.email.infrastructure.scheduler;

import com.personal.dailier.email.domain.port.DailySenderUseCase;
import com.personal.dailier.email.domain.port.EmailConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class DailySendScheduler {

    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private final EmailConfigRepository emailConfigRepository;
    private final DailySenderUseCase dailySenderUseCase;

    @Scheduled(cron = "0 * * * * *")
    public void checkAndSendDaily() {
        String currentTime = LocalTime.now().format(HH_MM);

        emailConfigRepository.findFirst().ifPresent(config -> {
            if (currentTime.equals(config.sendTime())) {
                log.info("Scheduled send triggered at {} for email {}", currentTime, config.emailAddress());
                try {
                    dailySenderUseCase.sendScheduledDaily();
                } catch (Exception e) {
                    log.error("Scheduled daily send failed: {}", e.getMessage(), e);
                }
            }
        });
    }
}

