package org.vedruna.barberia.modules.notifications.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Servicio de envio de correo SMTP.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailSenderService {

    /** Cliente de envio JavaMail. */
    private final JavaMailSender mailSender;

    /** Remitente por defecto. */
    @Value("${app.notifications.from:}")
    private String from;

    /**
     * Envia correo de texto plano.
     */
    public void send(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (from != null && !from.isBlank()) {
            message.setFrom(from);
        }
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
        log.info("Email sent to={} subject={}", to, subject);
    }
}
