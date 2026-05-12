package org.vedruna.barberia.modules.reservas.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Clave compuesta de {@link ReservaServicio}.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class ReservaServicioId implements Serializable {

    /** Id de la reserva. */
    @Column(name = "reserva_id")
    private Long reservaId;

    /** Id del servicio. */
    @Column(name = "servicio_id")
    private Long servicioId;

    /**
     * Constructor de conveniencia.
     *
     * @param reservaId id de reserva.
     * @param servicioId id de servicio.
     */
    public ReservaServicioId(Long reservaId, Long servicioId) {
        this.reservaId = reservaId;
        this.servicioId = servicioId;
    }
}
