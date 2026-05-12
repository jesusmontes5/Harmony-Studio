package org.vedruna.barberia.modules.registration.converter;

import org.springframework.stereotype.Component;
import org.vedruna.barberia.modules.registration.dto.SolicitudRegistroDto;
import org.vedruna.barberia.modules.registration.entity.SolicitudRegistro;

/**
 * Converter de entidad solicitud de registro a DTO.
 */
@Component
public class SolicitudRegistroConverter {

    /**
     * Convierte entidad a DTO publico.
     */
    public SolicitudRegistroDto toDto(SolicitudRegistro entity) {
        return SolicitudRegistroDto.builder()
            .id(entity.getId())
            .nombre(entity.getNombre())
            .email(entity.getEmail())
            .telefono(entity.getTelefono())
            .estado(entity.getEstado())
            .motivoRechazo(entity.getMotivoRechazo())
            .creadaEn(entity.getCreadaEn())
            .actualizadaEn(entity.getActualizadaEn())
            .build();
    }
}
