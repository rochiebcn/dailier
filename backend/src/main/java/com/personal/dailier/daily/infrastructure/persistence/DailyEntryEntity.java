package com.personal.dailier.daily.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "daily_entry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyEntryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String date;

    @Column(name = "did_yesterday", nullable = false, columnDefinition = "TEXT")
    private String didYesterday;

    @Column(name = "will_do_today", nullable = false, columnDefinition = "TEXT")
    private String willDoToday;

    @Column(columnDefinition = "TEXT")
    private String blockers;
}

