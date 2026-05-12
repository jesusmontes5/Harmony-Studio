package org.vedruna.barberia.modules.servicios.converter;

import org.springframework.stereotype.Component;
import org.vedruna.barberia.modules.servicios.dto.ServicioDto;
import org.vedruna.barberia.modules.servicios.entity.Servicio;

/**
 * Converter de {@link Servicio} a {@link ServicioDto}.
 */
@Component
public class ServicioConverter {

    /**
     * Convierte entidad de servicio a DTO de salida.
     */
    public ServicioDto toDto(Servicio servicio) {
        return ServicioDto.builder()
            .id(servicio.getId())
            .nombre(servicio.getNombre())
            .descripcion(servicio.getDescripcion())
            .duracionMinutos(servicio.getDuracionMinutos())
            .precio(servicio.getPrecio())
            .activo(servicio.getActivo())
            .creadoEn(servicio.getCreadoEn())
            .build();
    }
}
