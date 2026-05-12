package org.vedruna.barberia.modules.reservas.entity;

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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.vedruna.barberia.modules.users.entity.Usuario;

/**
 * Entidad que representa una reserva de barberia.
 */
@Entity
@Table(name = "reservas")
@Getter
@Setter
public class Reserva {

    /** Identificador autoincremental. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /** Cliente propietario de la reserva. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    /** Barbero asignado a la reserva. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barbero_id", nullable = false)
    private Usuario barbero;

    /** Fecha de la cita, aunque todavia no tenga hora asignada. */
    @Column(name = "fecha")
    private LocalDate fecha;

    /** Fecha y hora de inicio. */
    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    /** Fecha y hora de fin. */
    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    /** Estado funcional de la reserva. */
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoReserva estado;

    /** Observacion escrita por cliente al crear reserva. */
    @Column(name = "observaciones_cliente", length = 255)
    private String observacionesCliente;

    /** Observacion interna escrita por barbero. */
    @Column(name = "observaciones_barbero", columnDefinition = "TEXT")
    private String observacionesBarbero;

    /** Motivo de cancelacion opcional. */
    @Column(name = "motivo_cancelacion", length = 255)
    private String motivoCancelacion;

    /** Importe total calculado al crear la reserva. */
    @Column(name = "precio_total", precision = 10, scale = 2)
    private BigDecimal precioTotal;

    /** Fecha de creacion del registro. */
    @Column(name = "creada_en", insertable = false, updatable = false)
    private LocalDateTime creadaEn;

    /** Fecha de ultima actualizacion del registro. */
    @Column(name = "actualizada_en", insertable = false, updatable = false)
    private LocalDateTime actualizadaEn;
}
