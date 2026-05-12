package org.vedruna.barberia.modules.reviews.converter;

import org.springframework.stereotype.Component;
import org.vedruna.barberia.modules.reviews.dto.ResenaDto;
import org.vedruna.barberia.modules.reviews.entity.Resena;

/**
 * Converter de entidad reseña a DTO de salida.
 */
@Component
public class ResenaConverter {

    /**
     * Convierte entidad a DTO.
     */
    public ResenaDto toDto(Resena entity) {
        ResenaDto dto = new ResenaDto();
        dto.setId(entity.getId());
        dto.setReservaId(entity.getReserva() != null ? entity.getReserva().getId() : null);
        dto.setClienteId(entity.getCliente().getId());
        dto.setClienteNombre(entity.getCliente().getNombre());
        dto.setBarberoId(entity.getBarbero().getId());
        dto.setPuntuacion((int) entity.getPuntuacion());
        dto.setComentario(entity.getComentario());
        dto.setCreadaEn(entity.getCreadaEn());
        return dto;
    }
}
