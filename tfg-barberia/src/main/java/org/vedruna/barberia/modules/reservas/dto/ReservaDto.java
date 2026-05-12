package org.vedruna.barberia.modules.reservas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.vedruna.barberia.modules.reservas.entity.EstadoReserva;

/**
 * DTO de salida de reserva.
 */
@Getter
@Setter
public class ReservaDto {

    /** Id de reserva. */
    private Long id;

    /** Id del cliente. */
    private Long clienteId;

    /** Nombre del cliente. */
    private String clienteNombre;

    /** Id del barbero. */
    private Long barberoId;

    /** Nombre del barbero. */
    private String barberoNombre;

    /** Fecha de la cita. */
    private LocalDate fecha;

    /** Fecha inicio calculada/solicitada. */
    private LocalDateTime fechaInicio;

    /** Fecha fin calculada. */
    private LocalDateTime fechaFin;

    /** Estado de la reserva. */
    private EstadoReserva estado;

    /** Observaciones del cliente. */
    private String observacionesCliente;

    /** Observaciones del barbero. */
    private String observacionesBarbero;

    /** Motivo de cancelacion. */
    private String motivoCancelacion;

    /** Precio total final. */
    private BigDecimal precioTotal;

    /** Servicios aplicados. */
    private List<ReservaServicioDetalleDto> servicios;

    /** Fecha de creacion. */
    private LocalDateTime creadaEn;

    /** Fecha de actualizacion. */
    private LocalDateTime actualizadaEn;
}
