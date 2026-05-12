package org.vedruna.barberia.modules.servicios.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de alta de servicio.
 */
@Getter
@Setter
public class CreateServicioRequestDto {

    /** Nombre del servicio. */
    @NotBlank
    @Size(max = 100)
    private String nombre;

    /** Descripcion opcional. */
    @Size(max = 255)
    private String descripcion;

    /** Duracion en minutos. */
    @NotNull
    @Positive
    private Integer duracionMinutos;

    /** Precio del servicio. */
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal precio;
}
