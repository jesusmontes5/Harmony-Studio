package org.vedruna.barberia.modules.servicios.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidad JPA que mapea la tabla {@code servicios}.
 */
@Entity
@Table(name = "servicios")
@Getter
@Setter
public class Servicio {

    /** Identificador autoincremental del servicio. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /** Nombre comercial del servicio. */
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    /** Descripcion opcional. */
    @Column(name = "descripcion", length = 255)
    private String descripcion;

    /** Duracion en minutos del servicio. */
    @Column(name = "duracion_minutos", nullable = false)
    private Integer duracionMinutos;

    /** Precio vigente del servicio. */
    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    /** Indicador de servicio activo (soft delete). */
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    /** Fecha de alta del servicio. */
    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    /** Fecha de ultima modificacion. */
    @Column(name = "actualizado_en", insertable = false, updatable = false)
    private LocalDateTime actualizadoEn;
}
