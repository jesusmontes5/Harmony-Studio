package org.vedruna.barberia.modules.users.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidad JPA que mapea la tabla {@code usuarios}.
 *
 * <p>Entidad de dominio pura. Para integración con Spring Security, usar
 * {@link org.vedruna.barberia.shared.security.adapter.UsuarioUserDetailsAdapter}.</p>
 */
@Entity
@Table(name = "usuarios")
@Getter
@Setter
public class Usuario {

    /** Identificador unico autoincremental. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /** Nombre visible del usuario. */
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    /** Email unico de login. */
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    /** Telefono unico opcional. */
    @Column(name = "telefono", unique = true, length = 20)
    private String telefono;

    /** Hash BCrypt de la contrasena. */
    @JsonIgnore
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    /** Proveedor de autenticacion del usuario. */
    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private AuthProvider provider;

    /** Rol funcional persistido como texto. */
    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false)
    private RolUsuario rol;

    /** URL del avatar del usuario. */
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    /** Indicador de activacion de cuenta. */
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    /** Timestamp de creacion del registro. */
    @Column(name = "creado_en", nullable = false, insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    /** Timestamp de ultima actualizacion. */
    @Column(name = "actualizado_en", nullable = false, insertable = false, updatable = false)
    private LocalDateTime actualizadoEn;

    /**
     * @return true si la cuenta esta activa.
     */
    public boolean isActive() {
        return Boolean.TRUE.equals(activo);
    }
}
