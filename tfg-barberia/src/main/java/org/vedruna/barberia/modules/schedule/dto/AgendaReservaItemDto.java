package org.vedruna.barberia.modules.schedule.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.vedruna.barberia.modules.reservas.dto.ReservaServicioDetalleDto;
import org.vedruna.barberia.modules.reservas.entity.EstadoReserva;

/**
 * DTO resumido de reserva para la agenda diaria del barbero.
 */
@Getter
@Setter
public class AgendaReservaItemDto {

    /** Identificador de reserva. */
    private Long id;

    /** Identificador del cliente. */
    private Long clienteId;

    /** Nombre del cliente. */
    private String clienteNombre;

    /** Fecha de la cita. */
    private LocalDate fecha;

    /** Fecha/hora de inicio de la cita. */
    private LocalDateTime fechaInicio;

    /** Fecha/hora de fin de la cita. */
    private LocalDateTime fechaFin;

    /** Estado actual de la cita. */
    private EstadoReserva estado;

    /** Observaciones aportadas por cliente. */
    private String observacionesCliente;

    /** Precio total de la cita. */
    private BigDecimal precioTotal;

    /** Servicios asociados a la reserva. */
    private List<ReservaServicioDetalleDto> servicios;
}
