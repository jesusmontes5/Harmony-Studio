package org.vedruna.barberia.modules.registration.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import org.vedruna.barberia.modules.registration.entity.EstadoSolicitudRegistro;

/**
 * DTO publico de solicitud de registro.
 */
@Getter
@Builder
public class SolicitudRegistroDto {

    /** Id de la solicitud. */
    private Long id;

    /** Nombre solicitado. */
    private String nombre;

    /** Email solicitado. */
    private String email;

    /** Telefono solicitado. */
    private String telefono;

    /** Estado actual de la solicitud. */
    private EstadoSolicitudRegistro estado;

    /** Motivo de rechazo si aplica. */
    private String motivoRechazo;

    /** Fecha de creacion. */
    private LocalDateTime creadaEn;

    /** Fecha de ultima actualizacion. */
    private LocalDateTime actualizadaEn;
}
