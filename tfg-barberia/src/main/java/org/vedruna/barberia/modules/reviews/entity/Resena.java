package org.vedruna.barberia.modules.reviews.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.vedruna.barberia.modules.reservas.entity.Reserva;
import org.vedruna.barberia.modules.users.entity.Usuario;

/**
 * Entidad de resenas realizadas por clientes.
 */
@Entity
@Table(name = "resenas")
@Getter
@Setter
public class Resena {

    /** Id autoincremental de la resena. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /** Reserva resenada (unica por restriccion de tabla). Nullable si la reserva fue eliminada. */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id", nullable = true, unique = true)
    private Reserva reserva;

    /** Cliente autor de la resena. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    /** Barbero resenado. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barbero_id", nullable = false)
    private Usuario barbero;

    /** Valoracion numerica (1..5). */
    @Column(name = "puntuacion", nullable = false)
    private Byte puntuacion;

    /** Comentario opcional. */
    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;

    /** Fecha de creacion. */
    @Column(name = "creada_en", insertable = false, updatable = false)
    private LocalDateTime creadaEn;
}
