package com.personal.dailier.settings.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettingsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true, length = 100)
    private String userId;

    @Column(name = "notification_time", length = 5)
    private String notificationTime;

    @Column(name = "daily_hour", length = 5)
    private String dailyHour;

    @Column(name = "send_time", length = 5)
    private String sendTime;

    @Column(name = "email_address")
    private String emailAddress;

    @Column(name = "mail_host")
    private String mailHost;

    @Column(name = "mail_port")
    private Integer mailPort;
}

