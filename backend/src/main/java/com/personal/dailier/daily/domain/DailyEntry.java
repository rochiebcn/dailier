package com.personal.dailier.daily.domain;

public record DailyEntry(Long id, String date, String didYesterday, String willDoToday, String blockers) {
}

