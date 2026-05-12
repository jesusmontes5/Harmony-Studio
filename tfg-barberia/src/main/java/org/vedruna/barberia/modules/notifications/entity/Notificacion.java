package org.vedruna.barberia.modules.notifications.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.vedruna.barberia.modules.reservas.entity.Reserva;
import org.vedruna.barberia.modules.users.entity.Usuario;

/**
 * Entidad de notificaciones persistidas.
 */
@Entity
@Table(name = "notificaciones")
@Getter
@Setter
public class Notificacion {

    /** Id autoincremental. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /** Usuario destinatario. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** Reserva relacionada (opcional). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id")
    private Reserva reserva;

    /** Tipo funcional de notificacion. */
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoNotificacion tipo;

    /** Canal de entrega. */
    @Enumerated(EnumType.STRING)
    @Column(name = "canal", nullable = false)
    private CanalNotificacion canal;

    /** Mensaje textual a mostrar. */
    @Column(name = "mensaje", nullable = false, length = 500)
    private String mensaje;

    /** Fecha programada de envio. */
    @Column(name = "fecha_programada", nullable = false)
    private LocalDateTime fechaProgramada;

    /** Flag de notificacion procesada/enviada. */
    @Column(name = "enviada", nullable = false)
    private Boolean enviada;

    /** Fecha real de envio/procesamiento. */
    @Column(name = "enviada_en")
    private LocalDateTime enviadaEn;

    /** Error de envio si aplica. */
    @Column(name = "error_envio", length = 500)
    private String errorEnvio;

    /** Fecha de creacion del registro. */
    @Column(name = "creada_en", insertable = false, updatable = false)
    private LocalDateTime creadaEn;
}
