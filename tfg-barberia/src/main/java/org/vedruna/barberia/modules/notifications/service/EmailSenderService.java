package org.vedruna.barberia.modules.notifications.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
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
        EmailView view = resolveEmailView(subject, body);
        ParsedBody parsedBody = parseBody(body);
        String safeSubject = escapeHtml(subject);
        String introHtml = buildIntroHtml(parsedBody.introLines());
        String detailsHtml = buildDetailsHtml(parsedBody.detailRows());
        String closingHtml = buildClosingHtml(parsedBody.closingLines());

        return """
            <!doctype html>
            <html lang="es">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
              </head>
              <body style="margin:0;padding:0;background:#f3eee7;font-family:Arial,Helvetica,sans-serif;color:#241b15;">
                <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">%s</div>
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#f3eee7;padding:32px 12px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fffaf7;border:1px solid #e2d4c2;border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(42,31,23,0.12);">
                        <tr>
                          <td style="background:#201712;padding:28px 30px 24px;border-bottom:5px solid %s;">
                            <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#d9b46f;font-weight:700;">Harmony Studio</div>
                            <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;color:#fff8ef;font-weight:700;">%s</h1>
                            <div style="margin-top:16px;display:inline-block;background:%s;color:%s;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;">%s</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:30px 30px 10px;font-size:15px;line-height:1.7;color:#2f241d;">
                            %s
                            %s
                            %s
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 30px 26px;">
                            <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#f7efe4;border:1px solid #eadfce;border-radius:14px;">
                              <tr>
                                <td style="padding:18px 20px;font-size:13px;line-height:1.55;color:#6b5949;">
                                  <strong style="display:block;color:#2f241d;margin-bottom:4px;">%s</strong>
                                  %s
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 30px 28px;">
                            <div style="border-top:1px solid #e8dccb;padding-top:16px;font-size:12px;line-height:1.55;color:#7b6a58;">
                              Este correo se ha generado automaticamente desde Harmony Studio. Si tienes dudas, contacta directamente con tu barberia.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
            """.formatted(
                safeSubject,
                escapeHtml(view.preheader()),
                view.accentColor(),
                escapeHtml(view.title()),
                view.badgeBackground(),
                view.badgeColor(),
                escapeHtml(view.badge()),
                introHtml,
                detailsHtml,
                closingHtml,
                escapeHtml(view.noteTitle()),
                escapeHtml(view.note())
            );
    }

    /**
     * Define el tono visual y textual segun el tipo de correo.
     */
    private EmailView resolveEmailView(String subject, String body) {
        String text = ((subject == null ? "" : subject) + " " + (body == null ? "" : body)).toLowerCase(Locale.ROOT);

        if (text.contains("cancelada") || text.contains("cancelacion")) {
            return new EmailView(
                "Actualizacion importante sobre tu reserva.",
                "Reserva cancelada",
                "Cancelacion",
                "#c2410c",
                "#fff1e7",
                "#9a3412",
                "Que debes saber",
                "La cita ya no figura como activa. Revisa los detalles y, si necesitas una nueva hora, vuelve a reservar desde la aplicacion."
            );
        }
        if (text.contains("recordatorio")) {
            return new EmailView(
                "Te recordamos los datos de tu cita.",
                "Recordatorio de cita",
                "Recordatorio",
                "#2563eb",
                "#eaf1ff",
                "#1d4ed8",
                "Antes de venir",
                "Te recomendamos llegar con unos minutos de margen para mantener la agenda puntual."
            );
        }
        if (text.contains("nuevo comunicado") || text.contains("nuevo anuncio")) {
            return new EmailView(
                "Hemos publicado una novedad para clientes de Harmony Studio.",
                "Nuevo comunicado",
                "Comunicado",
                "#d99b2b",
                "#fff5df",
                "#9a6700",
                "Informacion para clientes",
                "Consulta la pagina principal de la aplicacion para ver el comunicado completo."
            );
        }
        if (text.contains("hueco") || text.contains("disponible") || text.contains("franja de agenda")) {
            return new EmailView(
                "Se ha liberado una franja de agenda.",
                "Nueva hora disponible",
                "Disponibilidad",
                "#16a34a",
                "#eaf8ef",
                "#15803d",
                "Disponibilidad limitada",
                "La franja se asignara al primer cliente que complete la reserva mientras siga disponible."
            );
        }
        if (text.contains("solicitud de registro")) {
            return new EmailView(
                "Hay una solicitud pendiente de revision.",
                "Nueva solicitud de registro",
                "Revision",
                "#7c3aed",
                "#f1eaff",
                "#6d28d9",
                "Siguiente paso",
                "Revisa la solicitud desde el panel y apruebala o rechazala cuando hayas comprobado los datos."
            );
        }
        if (text.contains("bloqueada") || text.contains("no presentarte")) {
            return new EmailView(
                "Hay una incidencia relacionada con tu cuenta.",
                "Aviso sobre tu cuenta",
                "Cuenta",
                "#b91c1c",
                "#fee2e2",
                "#991b1b",
                "Importante",
                "Contacta con Harmony Studio para aclarar la situacion y revisar los siguientes pasos."
            );
        }
        if (text.contains("nueva reserva pendiente")) {
            return new EmailView(
                "Ha entrado una nueva reserva en tu agenda.",
                "Nueva reserva recibida",
                "Agenda",
                "#d99b2b",
                "#fff5df",
                "#9a6700",
                "Gestion de agenda",
                "Revisa los datos desde tu panel para mantener la agenda organizada."
            );
        }
        if (text.contains("cita ha sido asignada") || text.contains("cita asignada") || text.contains("ya tiene hora asignada")) {
            return new EmailView(
                "Ya se ha asignado una hora para la cita.",
                "Cita asignada",
                "Agenda",
                "#d99b2b",
                "#fff5df",
                "#9a6700",
                "Gestion de la cita",
                "Conserva este correo como referencia y revisa la aplicacion si necesitas consultar la cita."
            );
        }
        if (text.contains("reserva") && text.contains("ha sido creada")) {
            return new EmailView(
                "Tu cita se ha registrado correctamente.",
                "Reserva confirmada",
                "Reserva",
                "#d99b2b",
                "#fff5df",
                "#9a6700",
                "Gestion de la cita",
                "Conserva este correo como justificante y revisa la aplicacion si necesitas consultar o gestionar la reserva."
            );
        }
        return new EmailView(
            "Tienes una nueva notificacion de Harmony Studio.",
            "Notificacion de Harmony Studio",
            "Informacion",
            "#d99b2b",
            "#fff5df",
            "#9a6700",
            "Informacion",
            "Puedes consultar mas detalles desde tu panel de usuario en la aplicacion."
        );
    }

    /**
     * Separa el mensaje en introduccion, detalles clave y cierre.
     */
    private ParsedBody parseBody(String body) {
        List<String> introLines = new ArrayList<>();
        List<DetailRow> detailRows = new ArrayList<>();
        List<String> closingLines = new ArrayList<>();
        boolean foundDetails = false;

        if (body == null || body.isBlank()) {
            return new ParsedBody(introLines, detailRows, closingLines);
        }

        for (String rawLine : body.split("\\R")) {
            String line = rawLine.trim();
            if (line.isBlank()) {
                continue;
            }

            int colonIndex = line.indexOf(':');
            if (colonIndex > 0 && colonIndex < line.length() - 1) {
                foundDetails = true;
                detailRows.add(new DetailRow(line.substring(0, colonIndex).trim(), line.substring(colonIndex + 1).trim()));
            } else if (foundDetails) {
                closingLines.add(line);
            } else {
                introLines.add(line);
            }
        }

        return new ParsedBody(introLines, detailRows, closingLines);
    }

    /**
     * Renderiza parrafos introductorios.
     */
    private String buildIntroHtml(List<String> lines) {
        if (lines.isEmpty()) {
            return "";
        }
        StringBuilder html = new StringBuilder();
        for (String line : lines) {
            html.append("<p style=\"margin:0 0 14px;font-size:16px;line-height:1.65;color:#2f241d;\">")
                .append(escapeHtml(line))
                .append("</p>");
        }
        return html.toString();
    }

    /**
     * Renderiza los pares clave-valor como ficha de detalles.
     */
    private String buildDetailsHtml(List<DetailRow> rows) {
        if (rows.isEmpty()) {
            return "";
        }

        StringBuilder html = new StringBuilder("""
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0 18px;background:#ffffff;border:1px solid #eadfce;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="padding:16px 18px 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#8a6a37;font-weight:700;">Detalles</td>
              </tr>
            """);
        for (DetailRow row : rows) {
            html.append("""
              <tr>
                <td style="padding:0 18px 12px;">
                  <div style="font-size:12px;line-height:1.4;color:#8b7a6a;text-transform:uppercase;letter-spacing:.5px;font-weight:700;">%s</div>
                  <div style="font-size:15px;line-height:1.55;color:#2f241d;font-weight:600;">%s</div>
                </td>
              </tr>
                """.formatted(escapeHtml(row.label()), escapeHtml(row.value())));
        }
        html.append("</table>");
        return html.toString();
    }

    /**
     * Renderiza el cierre del mensaje.
     */
    private String buildClosingHtml(List<String> lines) {
        if (lines.isEmpty()) {
            return "";
        }
        StringBuilder html = new StringBuilder();
        for (String line : lines) {
            html.append("<p style=\"margin:0 0 14px;font-size:15px;line-height:1.65;color:#4c3d31;\">")
                .append(escapeHtml(line))
                .append("</p>");
        }
        return html.toString();
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

    /**
     * Configuracion visual y textual aplicada a una familia de correos.
     */
    private record EmailView(
        String preheader,
        String title,
        String badge,
        String accentColor,
        String badgeBackground,
        String badgeColor,
        String noteTitle,
        String note
    ) {
    }

    /**
     * Resultado de dividir el cuerpo del correo en introduccion, detalles y cierre.
     */
    private record ParsedBody(
        List<String> introLines,
        List<DetailRow> detailRows,
        List<String> closingLines
    ) {
    }

    /**
     * Fila clave-valor que se renderiza dentro de la tarjeta de detalles del correo.
     */
    private record DetailRow(String label, String value) {
    }
}
