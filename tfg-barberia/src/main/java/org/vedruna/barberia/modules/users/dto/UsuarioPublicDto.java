package org.vedruna.barberia.modules.users.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import org.vedruna.barberia.modules.users.entity.RolUsuario;

/**
 * DTO publico de usuario sin datos sensibles.
 */
@Getter
@Builder
public class UsuarioPublicDto {

    /** Id del usuario. */
    private Long id;

    /** Nombre visible. */
    private String nombre;

    /** Email publico. */
    private String email;

    /** Telefono opcional. */
    private String telefono;

    /** Rol funcional del usuario. */
    private RolUsuario rol;

    /** Avatar opcional. */
    private String avatarUrl;

    /** Estado de activacion. */
    private Boolean activo;

    /** Fecha de alta. */
    private LocalDateTime creadoEn;
}
