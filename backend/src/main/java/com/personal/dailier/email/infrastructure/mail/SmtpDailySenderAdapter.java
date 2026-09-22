package com.personal.dailier.email.infrastructure.mail;

import com.personal.dailier.daily.domain.DailyEntry;
import com.personal.dailier.email.domain.port.DailySenderPort;
import com.personal.dailier.settings.domain.port.SettingsRepository;
import com.personal.dailier.settings.domain.port.SettingsUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Properties;

@Slf4j
@Component
@RequiredArgsConstructor
public class SmtpDailySenderAdapter implements DailySenderPort {

    private static final int DEFAULT_MAIL_PORT = 25;
    private static final DateTimeFormatter DISPLAY_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final SettingsRepository settingsRepository;

    @Value("${spring.mail.from}")
    private String fromAddress;

    @Override
    public void send(String toEmail, DailyEntry entry) {
        var settings = settingsRepository.findByUserId(SettingsUseCase.DEFAULT_USER_ID);
        String mailHost = settings.map(s -> s.mailHost()).filter(h -> h != null && !h.isBlank()).orElse("localhost");
        int mailPort = settings.flatMap(s -> java.util.Optional.ofNullable(s.mailPort())).orElse(DEFAULT_MAIL_PORT);

        try {
            var mailSender = buildMailSender(mailHost, mailPort);
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Daily Scrum - " + formatDisplayDate(entry.date()));
            helper.setText(buildEmailBody(entry), true);

            mailSender.send(message);
            log.info("Daily entry for {} sent successfully to {}", entry.date(), toEmail);
        } catch (Exception e) {
            Throwable root = rootCause(e);
            if (root instanceof java.net.ConnectException || root instanceof java.net.SocketTimeoutException) {
                log.error("Cannot reach SMTP server {}:{} — check connectivity. Cause: {}",
                        mailHost, mailPort, root.getMessage());
            } else {
                log.error("Failed to send daily entry for {} to {}: {}", entry.date(), toEmail, e.getMessage(), e);
            }
            throw new RuntimeException("Failed to send daily email: " + root.getMessage(), e);
        }
    }

    private JavaMailSenderImpl buildMailSender(String mailHost, int mailPort) {
        var sender = new JavaMailSenderImpl();
        sender.setHost(mailHost);
        sender.setPort(mailPort);

        var props = new Properties();
        props.put("mail.smtp.auth", false);
        props.put("mail.smtp.starttls.enable", false);
        props.put("mail.smtp.connectiontimeout", 5000);
        props.put("mail.smtp.timeout", 5000);
        props.put("mail.smtp.writetimeout", 5000);
        sender.setJavaMailProperties(props);

        return sender;
    }

    private Throwable rootCause(Throwable t) {
        Throwable cause = t;
        while (cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        return cause;
    }

    private String buildEmailBody(DailyEntry entry) {
        String displayDate = formatDisplayDate(entry.date());
        return """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                        📋 Daily Scrum — %s
                    </h2>
                    <div style="background: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 15px 0; border-radius: 4px;">
                        <h3 style="color: #2980b9; margin-top: 0;">✅ ¿Qué hice el último día?</h3>
                        <p style="white-space: pre-wrap; margin: 0;">%s</p>
                    </div>
                    <div style="background: #f8f9fa; border-left: 4px solid #27ae60; padding: 15px; margin: 15px 0; border-radius: 4px;">
                        <h3 style="color: #27ae60; margin-top: 0;">🎯 ¿Qué haré hoy?</h3>
                        <p style="white-space: pre-wrap; margin: 0;">%s</p>
                    </div>
                    <div style="background: #f8f9fa; border-left: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 4px;">
                        <h3 style="color: #c0392b; margin-top: 0;">🚧 Impedimentos</h3>
                        <p style="white-space: pre-wrap; margin: 0;">%s</p>
                    </div>
                </body>
                </html>
                """.formatted(
                displayDate,
                formatMultilineHtml(entry.didYesterday()),
                formatMultilineHtml(entry.willDoToday()),
                formatMultilineHtml(entry.blockers())
        );
    }

    private String formatDisplayDate(String isoDate) {
        return LocalDate.parse(isoDate).format(DISPLAY_DATE_FORMAT);
    }

    private String nullToEmpty(String value) {
        return value != null ? value : "";
    }

    private String escapeHtml(String text) {
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    private String formatMultilineHtml(String text) {
        return escapeHtml(nullToEmpty(text))
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .replace("\n", "<br/>");
    }
}
