package org.vedruna.barberia.modules.tablon.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO de salida del tablon.
 */
@Getter
@Builder
public class TablonMensajeDto {

    /** Id del mensaje. */
    private Long id;

    /** Titulo del aviso. */
    private String titulo;

    /** Cuerpo del aviso. */
    private String mensaje;

    /** Id del autor. */
    private Long autorId;

    /** Nombre del autor. */
    private String autorNombre;

    /** Fecha de creacion. */
    private LocalDateTime creadoEn;

    /** Fecha de ultima actualizacion. */
    private LocalDateTime actualizadoEn;
}
