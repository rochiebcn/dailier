package com.personal.dailier.email.domain.port;

import com.personal.dailier.daily.domain.DailyEntry;

public interface DailySenderPort {

    void send(String toEmail, DailyEntry entry);
}

