package org.vedruna.barberia.modules.servicios.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de modificacion parcial de servicio.
 */
@Getter
@Setter
public class UpdateServicioRequestDto {

    /** Nombre opcional actualizado. */
    @Size(max = 100)
    private String nombre;

    /** Descripcion opcional actualizada. */
    @Size(max = 255)
    private String descripcion;

    /** Duracion opcional actualizada. */
    @Positive
    private Integer duracionMinutos;

    /** Precio opcional actualizado. */
    @DecimalMin(value = "0.01")
    private BigDecimal precio;

    /** Estado opcional actualizado. */
    private Boolean activo;
}
