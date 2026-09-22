package com.personal.dailier.email.infrastructure.mail;

import com.personal.dailier.daily.domain.DailyEntry;
import com.personal.dailier.email.domain.port.DailySenderPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SmtpDailySenderAdapter implements DailySenderPort {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Override
    public void send(String toEmail, DailyEntry entry) {
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Daily Scrum - " + entry.date());
            helper.setText(buildEmailBody(entry), true);

            mailSender.send(message);
            log.info("Daily entry for {} sent successfully to {}", entry.date(), toEmail);
        } catch (Exception e) {
            log.error("Failed to send daily entry for {} to {}: {}", entry.date(), toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send daily email", e);
        }
    }

    private String buildEmailBody(DailyEntry entry) {
        return """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                        📋 Daily Scrum — %s
                    </h2>
                    <div style="background: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 15px 0; border-radius: 4px;">
                        <h3 style="color: #2980b9; margin-top: 0;">✅ ¿Qué hice ayer?</h3>
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
                entry.date(),
                escapeHtml(nullToEmpty(entry.didYesterday())),
                escapeHtml(nullToEmpty(entry.willDoToday())),
                escapeHtml(nullToEmpty(entry.blockers()))
        );
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
}

