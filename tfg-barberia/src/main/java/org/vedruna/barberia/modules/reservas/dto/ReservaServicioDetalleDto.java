package org.vedruna.barberia.modules.reservas.dto;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de servicio aplicado dentro de una reserva.
 */
@Getter
@Setter
public class ReservaServicioDetalleDto {

    /** Id del servicio. */
    private Long servicioId;

    /** Nombre del servicio. */
    private String nombreServicio;

    /** Precio aplicado en la reserva. */
    private BigDecimal precioAplicado;

    /** Duracion aplicada en minutos. */
    private Integer duracionAplicadaMinutos;
}
