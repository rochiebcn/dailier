package com.personal.dailier.email.domain.port;

public interface DailySenderUseCase {

    void sendScheduledDaily();

    void sendDailyForDate(String date);
}

