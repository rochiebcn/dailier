package com.personal.dailier.email.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "email_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailConfigEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "send_time", nullable = false, length = 5)
    private String sendTime;

    @Column(name = "email_address", nullable = false)
    private String emailAddress;
}

