package org.vedruna.barberia.modules.tablon.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.vedruna.barberia.modules.users.entity.Usuario;

/**
 * Entidad del tablon de informacion.
 */
@Entity
@Table(name = "tablon_mensajes")
@Getter
@Setter
public class TablonMensaje {

    /** Identificador autoincremental. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /** Titulo breve del aviso. */
    @Column(name = "titulo", nullable = false, length = 140)
    private String titulo;

    /** Contenido del aviso. */
    @Column(name = "mensaje", nullable = false, length = 2000)
    private String mensaje;

    /** Usuario barbero/admin que publico o actualizo. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    /** Soft delete del mensaje. */
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    /** Fecha de creacion. */
    @Column(name = "creado_en", nullable = false, insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    /** Fecha de ultima actualizacion. */
    @Column(name = "actualizado_en", nullable = false, insertable = false, updatable = false)
    private LocalDateTime actualizadoEn;
}
