package org.vedruna.barberia.modules.registration.entity;

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
import org.vedruna.barberia.modules.users.entity.Usuario;

/**
 * Entidad para solicitudes de registro previas a crear el usuario definitivo.
 */
@Entity
@Table(name = "solicitudes_registro")
@Getter
@Setter
public class SolicitudRegistro {

    /** Id autoincremental de la solicitud. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /** Nombre solicitado. */
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    /** Email solicitado. */
    @Column(name = "email", nullable = false, length = 150)
    private String email;

    /** Telefono solicitado. */
    @Column(name = "telefono", length = 20)
    private String telefono;

    /** Hash BCrypt de la contrasena aportada en registro. */
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    /** Estado del proceso de solicitud. */
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoSolicitudRegistro estado;

    /** Motivo de rechazo opcional. */
    @Column(name = "motivo_rechazo", length = 255)
    private String motivoRechazo;

    /** Usuario barbero/admin que reviso la solicitud. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revisado_por")
    private Usuario revisadoPor;

    /** Fecha de creacion de solicitud. */
    @Column(name = "creada_en", nullable = false, insertable = false, updatable = false)
    private LocalDateTime creadaEn;

    /** Fecha de ultima actualizacion de solicitud. */
    @Column(name = "actualizada_en", nullable = false, insertable = false, updatable = false)
    private LocalDateTime actualizadaEn;
}
