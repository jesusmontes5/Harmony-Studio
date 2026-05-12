package org.vedruna.barberia.modules.servicios.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO de salida para servicios.
 */
@Getter
@Builder
public class ServicioDto {

    /** Id del servicio. */
    private Long id;

    /** Nombre del servicio. */
    private String nombre;

    /** Descripcion opcional. */
    private String descripcion;

    /** Duracion en minutos. */
    private Integer duracionMinutos;

    /** Precio vigente. */
    private BigDecimal precio;

    /** Estado activo/inactivo. */
    private Boolean activo;

    /** Fecha de creacion. */
    private LocalDateTime creadoEn;
}
