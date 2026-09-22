package com.personal.dailier.settings.domain;

public record Settings(
        Long id,
        String userId,
        String notificationTime,
        String dailyHour,
        String sendTime,
        String emailAddress
) {
}

