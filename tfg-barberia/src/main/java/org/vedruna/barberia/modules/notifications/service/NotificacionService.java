package org.vedruna.barberia.modules.notifications.service;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.vedruna.barberia.modules.notifications.converter.NotificacionConverter;
import org.vedruna.barberia.modules.notifications.dto.NotificacionDto;
import org.vedruna.barberia.modules.notifications.entity.CanalNotificacion;
import org.vedruna.barberia.modules.notifications.entity.Notificacion;
import org.vedruna.barberia.modules.notifications.entity.TipoNotificacion;
import org.vedruna.barberia.modules.notifications.repository.NotificacionRepository;
import org.vedruna.barberia.modules.reservas.entity.Reserva;
import org.vedruna.barberia.modules.users.entity.Usuario;

/**
 * Servicio de gestión de notificaciones persistidas.
 * Gestiona creación de notificaciones, listado y envío por correo electrónico.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacionService {

    /** Repositorio de notificaciones. */
    private final NotificacionRepository notificacionRepository;

    /** Converter a DTO. */
    private final NotificacionConverter converter;

    /** Servicio SMTP real. */
    private final EmailSenderService emailSenderService;

    /** Flag global para habilitar/deshabilitar envio de correos. */
    @Value("${app.notifications.email-enabled:false}")
    private boolean emailEnabled;

    /**
     * Lista las notificaciones del usuario autenticado.
     * Retorna notificaciones ordenadas por fecha más reciente primero.
     *
     * @param usuario Usuario autenticado
     * @return Lista de notificaciones del usuario como DTOs
     */
    @Transactional(readOnly = true)
    public List<NotificacionDto> listMine(Usuario usuario) {
        log.info("List notifications for userId={}", usuario.getId());
        return notificacionRepository.findByUsuarioIdOrderByFechaProgramadaDesc(usuario.getId())
            .stream()
            .map(converter::toDto)
            .toList();
    }

    /**
     * Procesa notificaciones pendientes vencidas y envía correos electrónicos.
     * Marca comme enviadas las notificaciones procesadas con éxito.
     * Si el envío falla, registra el error en la notificación.
     * Solo ejecuta si está habilitado mediante property app.notifications.email-enabled.
     *
     * @return Número de notificaciones procesadas y enviadas exitosamente
     */
    @Transactional
    public int processPending() {
        if (!emailEnabled) {
            return 0;
        }

        LocalDateTime now = LocalDateTime.now();
        List<Notificacion> pending = notificacionRepository.findPendingToSend(now);
        int sent = 0;

        for (Notificacion n : pending) {
            try {
                String to = n.getUsuario().getEmail();
                String subject = buildSubject(n);
                emailSenderService.send(to, subject, n.getMensaje());

                n.setEnviada(true);
                n.setEnviadaEn(now);
                n.setErrorEnvio(null);
                sent++;
            } catch (Exception ex) {
                n.setErrorEnvio(trimError(ex.getMessage()));
                n.setEnviada(false);
                n.setEnviadaEn(null);
                log.error("Notification send failed id={} userId={}", n.getId(), n.getUsuario().getId(), ex);
            }
        }

        if (!pending.isEmpty()) {
            notificacionRepository.saveAll(pending);
        }
        return sent;
    }

    /**
     * Scheduler automatico de pendientes.
     */
    @Scheduled(cron = "${app.notifications.process-cron:0 */1 * * * *}")
    @Transactional
    public void processPendingScheduled() {
        int sent = processPending();
        if (sent > 0) {
            log.info("Scheduled notifications processed sent={}", sent);
        }
    }

    /**
     * Crea notificacion de informacion para usuario sobre una reserva.
     */
    @Transactional
    public void createInfo(Usuario usuario, Reserva reserva, String mensaje) {
        saveNotificacion(usuario, reserva, TipoNotificacion.INFORMACION, mensaje, LocalDateTime.now());
    }

    /**
     * Crea notificacion informativa de sistema sin reserva.
     */
    @Transactional
    public void createSystemInfo(Usuario usuario, String mensaje) {
        if (notificacionRepository.existsByUsuarioIdAndReservaIsNullAndTipoAndMensaje(
            usuario.getId(),
            TipoNotificacion.INFORMACION,
            mensaje
        )) {
            return;
        }
        saveNotificacion(usuario, null, TipoNotificacion.INFORMACION, mensaje, LocalDateTime.now());
    }

    /**
     * Crea notificacion informativa de sistema sin deduplicar mensaje.
     */
    @Transactional
    public void createSystemInfoAlways(Usuario usuario, String mensaje) {
        saveNotificacion(usuario, null, TipoNotificacion.INFORMACION, mensaje, LocalDateTime.now());
    }

    /**
     * Crea notificacion de cancelacion para usuario sobre una reserva.
     */
    @Transactional
    public void createCancelacion(Usuario usuario, Reserva reserva, String mensaje) {
        saveNotificacion(usuario, reserva, TipoNotificacion.CANCELACION, mensaje, LocalDateTime.now());
    }

    /**
     * Crea notificacion recordatorio para usuario sobre una reserva.
     */
    @Transactional
    public void createRecordatorio(Usuario usuario, Reserva reserva, TipoNotificacion tipo, LocalDateTime fechaProgramada, String mensaje) {
        if (reserva != null && notificacionRepository.existsByUsuarioIdAndReservaIdAndTipo(usuario.getId(), reserva.getId(), tipo)) {
            return;
        }
        saveNotificacion(usuario, reserva, tipo, mensaje, fechaProgramada);
    }

    /**
     * Persistencia interna de notificacion.
     */
    private void saveNotificacion(Usuario usuario, Reserva reserva, TipoNotificacion tipo, String mensaje, LocalDateTime fechaProgramada) {
        Notificacion n = new Notificacion();
        n.setUsuario(usuario);
        n.setReserva(reserva);
        n.setTipo(tipo);
        n.setCanal(CanalNotificacion.EMAIL);
        n.setMensaje(mensaje);
        n.setFechaProgramada(fechaProgramada);
        n.setEnviada(false);
        n.setEnviadaEn(null);
        n.setErrorEnvio(null);
        notificacionRepository.save(n);
    }

    /**
     * Construye asunto segun tipo.
     */
    private String buildSubject(Notificacion n) {
        return switch (n.getTipo()) {
            case INFORMACION -> buildInfoSubject(n.getMensaje());
            case CANCELACION -> "Harmony Studio - Reserva cancelada";
            case RECORDATORIO_DIA -> "Harmony Studio - Tu cita es hoy";
            case RECORDATORIO_24H -> "Harmony Studio - Recordatorio de cita";
        };
    }

    /**
     * Afina el asunto de las notificaciones informativas segun el contenido.
     */
    private String buildInfoSubject(String mensaje) {
        String text = mensaje == null ? "" : mensaje.toLowerCase();
        if (text.contains("nuevo anuncio")) {
            return "Harmony Studio - Nuevo anuncio";
        }
        if (text.contains("hueco") || text.contains("disponible")) {
            return "Harmony Studio - Hueco disponible";
        }
        if (text.contains("solicitud de registro")) {
            return "Harmony Studio - Nueva solicitud de registro";
        }
        if (text.contains("nueva reserva pendiente")) {
            return "Harmony Studio - Nueva reserva recibida";
        }
        if (text.contains("reserva ha sido creada")) {
            return "Harmony Studio - Reserva confirmada";
        }
        if (text.contains("cita ha sido asignada") || text.contains("cita asignada")) {
            return "Harmony Studio - Cita asignada";
        }
        if (text.contains("bloqueada") || text.contains("no presentarte")) {
            return "Harmony Studio - Aviso importante de cuenta";
        }
        return "Harmony Studio - Nueva notificacion";
    }

    /**
     * Limita el mensaje de error al tamano de columna.
     */
    private String trimError(String error) {
        if (error == null) {
            return null;
        }
        return error.length() > 500 ? error.substring(0, 500) : error;
    }
}
