package org.vedruna.barberia.modules.schedule.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;
import org.vedruna.barberia.modules.users.entity.Usuario;

/**
 * Entidad que representa el horario por fecha concreta de un barbero.
 */
@Entity
@Table(name = "horarios_barbero_fecha")
@Getter
@Setter
public class HorarioBarbero {

    /** Identificador autoincremental. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /** Barbero propietario del horario. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barbero_id", nullable = false)
    private Usuario barbero;

    /** Fecha concreta a la que aplica el tramo. */
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    /** Hora inicial del tramo. */
    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    /** Hora final del tramo. */
    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;
}
