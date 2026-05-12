package org.vedruna.barberia.modules.registration.dto;

import lombok.Getter;
import lombok.Setter;
import org.vedruna.barberia.modules.users.entity.RolUsuario;

/**
 * DTO para aprobar una solicitud con rol destino opcional.
 */
@Getter
@Setter
public class ApproveSolicitudRequestDto {

    /**
     * Rol final del usuario aprobado.
     * Si no se informa, se toma CLIENTE por defecto.
     */
    private RolUsuario rol;
}
