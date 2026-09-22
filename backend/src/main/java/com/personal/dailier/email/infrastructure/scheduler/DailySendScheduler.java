package com.personal.dailier.email.infrastructure.scheduler;

import com.personal.dailier.email.domain.port.DailySenderUseCase;
import com.personal.dailier.settings.domain.port.SettingsRepository;
import com.personal.dailier.settings.domain.port.SettingsUseCase;
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

    private final SettingsRepository settingsRepository;
    private final DailySenderUseCase dailySenderUseCase;

    @Scheduled(cron = "0 * * * * *")
    public void checkAndSendDaily() {
        String currentTime = LocalTime.now().format(HH_MM);

        settingsRepository.findByUserId(SettingsUseCase.DEFAULT_USER_ID).ifPresent(settings -> {
            if (currentTime.equals(settings.sendTime())) {
                log.info("Scheduled send triggered at {} for email {}", currentTime, settings.emailAddress());
                try {
                    dailySenderUseCase.sendScheduledDaily();
                } catch (Exception e) {
                    log.error("Scheduled daily send failed: {}", e.getMessage(), e);
                }
            }
        });
    }
}

