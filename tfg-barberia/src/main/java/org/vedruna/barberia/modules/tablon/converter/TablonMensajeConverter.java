package org.vedruna.barberia.modules.tablon.converter;

import org.springframework.stereotype.Component;
import org.vedruna.barberia.modules.tablon.dto.TablonMensajeDto;
import org.vedruna.barberia.modules.tablon.entity.TablonMensaje;

/**
 * Converter de mensajes del tablon.
 */
@Component
public class TablonMensajeConverter {

    /**
     * Convierte entidad a DTO de salida.
     */
    public TablonMensajeDto toDto(TablonMensaje entity) {
        return TablonMensajeDto.builder()
            .id(entity.getId())
            .titulo(entity.getTitulo())
            .mensaje(entity.getMensaje())
            .autorId(entity.getAutor().getId())
            .autorNombre(entity.getAutor().getNombre())
            .creadoEn(entity.getCreadoEn())
            .actualizadoEn(entity.getActualizadoEn())
            .build();
    }
}
