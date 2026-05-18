package org.vedruna.barberia.modules.notifications.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
     * Envia correo con plantilla HTML y alternativa de texto plano.
     */
    public void send(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            if (from != null && !from.isBlank()) {
                helper.setFrom(from);
            }
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, buildHtmlBody(subject, body));
            mailSender.send(message);
            log.info("Email sent to={} subject={}", to, subject);
        } catch (MessagingException ex) {
            throw new IllegalStateException("No se pudo preparar el correo", ex);
        }
    }

    /**
     * Construye una plantilla HTML comun para todas las notificaciones.
     */
    private String buildHtmlBody(String subject, String body) {
        String safeSubject = escapeHtml(subject);
        String formattedBody = escapeHtml(body).replace("\n", "<br>");

        return """
            <!doctype html>
            <html lang="es">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
              </head>
              <body style="margin:0;padding:0;background:#f4efe7;font-family:Arial,Helvetica,sans-serif;color:#2b2118;">
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#f4efe7;padding:28px 12px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffaf2;border:1px solid #e4d2b5;border-radius:14px;overflow:hidden;">
                        <tr>
                          <td style="background:#1f1712;padding:24px 28px;">
                            <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#d8b36a;font-weight:700;">Harmony Studio</div>
                            <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#fffaf2;">%s</h1>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:28px;font-size:15px;line-height:1.65;color:#2b2118;">
                            <div style="background:#ffffff;border:1px solid #ecdcc5;border-radius:10px;padding:20px;">%s</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 28px 28px;">
                            <div style="border-top:1px solid #eadbc8;padding-top:16px;font-size:12px;line-height:1.5;color:#7b6a58;">
                              Este correo se ha generado automaticamente desde Harmony Studio. Si tienes dudas, contacta con tu barberia.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
            """.formatted(safeSubject, safeSubject, formattedBody);
    }

    /**
     * Escapa contenido dinamico para evitar inyectar HTML en los correos.
     */
    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }
}
