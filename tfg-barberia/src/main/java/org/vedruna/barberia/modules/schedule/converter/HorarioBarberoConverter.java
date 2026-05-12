package org.vedruna.barberia.modules.schedule.converter;

import org.springframework.stereotype.Component;
import org.vedruna.barberia.modules.schedule.dto.HorarioBarberoDto;
import org.vedruna.barberia.modules.schedule.entity.HorarioBarbero;

/**
 * Converter de entidad HorarioBarbero a DTO.
 */
@Component
public class HorarioBarberoConverter {

    /**
     * Convierte entidad en DTO de salida.
     *
     * @param entity entidad de horario.
     * @return dto serializable.
     */
    public HorarioBarberoDto toDto(HorarioBarbero entity) {
        HorarioBarberoDto dto = new HorarioBarberoDto();
        dto.setId(entity.getId());
        dto.setFecha(entity.getFecha());
        dto.setHoraInicio(entity.getHoraInicio());
        dto.setHoraFin(entity.getHoraFin());
        dto.setBloqueadoPorReservas(false);
        return dto;
    }
}
