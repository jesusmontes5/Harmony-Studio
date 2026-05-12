package org.vedruna.barberia.modules.notifications.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.vedruna.barberia.modules.notifications.entity.TipoNotificacion;
import org.vedruna.barberia.modules.notifications.entity.Notificacion;

/**
 * Repositorio de notificaciones.
 */
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    /**
     * @param usuarioId id del usuario.
     * @return notificaciones del usuario ordenadas por fecha programada descendente.
     */
    List<Notificacion> findByUsuarioIdOrderByFechaProgramadaDesc(Long usuarioId);

    /**
     * @param now fecha/hora de corte.
     * @return pendientes vencidas ordenadas para procesado.
     */
    @Query("""
        SELECT n FROM Notificacion n
        WHERE n.enviada = false
          AND n.fechaProgramada <= :now
        ORDER BY n.fechaProgramada ASC, n.id ASC
        """)
    List<Notificacion> findPendingToSend(@Param("now") LocalDateTime now);

    /**
     * Evita duplicar notificaciones por reserva y tipo.
     */
    boolean existsByUsuarioIdAndReservaIdAndTipo(Long usuarioId, Long reservaId, TipoNotificacion tipo);

    /**
     * Evita duplicar notificaciones de sistema sin reserva.
     */
    boolean existsByUsuarioIdAndReservaIsNullAndTipoAndMensaje(Long usuarioId, TipoNotificacion tipo, String mensaje);

    /**
     * Elimina todas las notificaciones de un usuario.
     */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Notificacion n WHERE n.usuario.id = :usuarioId")
    int deleteByUsuarioId(Long usuarioId);
}
