package org.vedruna.barberia.modules.reservas.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
import org.vedruna.barberia.modules.servicios.entity.Servicio;

/**
 * Entidad de detalle de servicios aplicados a una reserva.
 */
@Entity
@Table(name = "reserva_servicios")
@Getter
@Setter
public class ReservaServicio {

    /** Clave primaria compuesta. */
    @EmbeddedId
    private ReservaServicioId id;

    /** Relacion con la reserva padre. */
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("reservaId")
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;

    /** Relacion con el servicio aplicado. */
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("servicioId")
    @JoinColumn(name = "servicio_id", nullable = false)
    private Servicio servicio;

    /** Precio aplicado congelado en el momento de la reserva. */
    @Column(name = "precio_aplicado", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioAplicado;

    /** Duracion aplicada congelada en el momento de la reserva. */
    @Column(name = "duracion_aplicada_minutos", nullable = false)
    private Integer duracionAplicadaMinutos;
}
