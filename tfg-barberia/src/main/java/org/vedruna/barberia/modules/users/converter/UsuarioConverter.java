package org.vedruna.barberia.modules.users.converter;

import org.springframework.stereotype.Component;
import org.vedruna.barberia.modules.users.dto.UsuarioPublicDto;
import org.vedruna.barberia.modules.users.entity.Usuario;

/**
 * Conversor de entidad {@link Usuario} a DTO publico.
 */
@Component
public class UsuarioConverter {

    /**
     * Convierte entidad a DTO publico.
     *
     * @param usuario entidad persistente.
     * @return dto sin password hash.
     */
    public UsuarioPublicDto toPublicDto(Usuario usuario) {
        return UsuarioPublicDto.builder()
            .id(usuario.getId())
            .nombre(usuario.getNombre())
            .email(usuario.getEmail())
            .telefono(usuario.getTelefono())
            .rol(usuario.getRol())
            .avatarUrl(usuario.getAvatarUrl())
            .activo(usuario.getActivo())
            .creadoEn(usuario.getCreadoEn())
            .build();
    }
}
