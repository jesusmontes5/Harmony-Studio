package org.vedruna.barberia.modules.notifications.converter;

import org.springframework.stereotype.Component;
import org.vedruna.barberia.modules.notifications.dto.NotificacionDto;
import org.vedruna.barberia.modules.notifications.entity.Notificacion;

/**
 * Converter de entidad Notificacion a DTO.
 */
@Component
public class NotificacionConverter {

    /**
     * Convierte entidad a DTO.
     */
    public NotificacionDto toDto(Notificacion entity) {
        NotificacionDto dto = new NotificacionDto();
        dto.setId(entity.getId());
        dto.setReservaId(entity.getReserva() != null ? entity.getReserva().getId() : null);
        dto.setTipo(entity.getTipo());
        dto.setCanal(entity.getCanal());
        dto.setMensaje(entity.getMensaje());
        dto.setFechaProgramada(entity.getFechaProgramada());
        dto.setEnviada(entity.getEnviada());
        dto.setEnviadaEn(entity.getEnviadaEn());
        return dto;
    }
}
