package org.vedruna.barberia.modules.reservas.converter;

import java.util.List;
import org.springframework.stereotype.Component;
import org.vedruna.barberia.modules.reservas.dto.ReservaDto;
import org.vedruna.barberia.modules.reservas.dto.ReservaServicioDetalleDto;
import org.vedruna.barberia.modules.reservas.entity.Reserva;
import org.vedruna.barberia.modules.reservas.entity.ReservaServicio;

/**
 * Converter de entidad Reserva a DTO de salida.
 */
@Component
public class ReservaConverter {

    /**
     * Convierte reserva y detalle aplicado a DTO.
     *
     * @param reserva entidad reserva.
     * @param detalles lineas de servicios aplicados.
     * @return dto serializable.
     */
    public ReservaDto toDto(Reserva reserva, List<ReservaServicio> detalles) {
        ReservaDto dto = new ReservaDto();
        dto.setId(reserva.getId());
        dto.setClienteId(reserva.getCliente().getId());
        dto.setClienteNombre(reserva.getCliente().getNombre());
        dto.setBarberoId(reserva.getBarbero().getId());
        dto.setBarberoNombre(reserva.getBarbero().getNombre());
        dto.setFecha(reserva.getFecha() != null
            ? reserva.getFecha()
            : reserva.getFechaInicio() != null ? reserva.getFechaInicio().toLocalDate() : null);
        dto.setFechaInicio(reserva.getFechaInicio());
        dto.setFechaFin(reserva.getFechaFin());
        dto.setEstado(reserva.getEstado());
        dto.setObservacionesCliente(reserva.getObservacionesCliente());
        dto.setObservacionesBarbero(reserva.getObservacionesBarbero());
        dto.setMotivoCancelacion(reserva.getMotivoCancelacion());
        dto.setPrecioTotal(reserva.getPrecioTotal());
        dto.setCreadaEn(reserva.getCreadaEn());
        dto.setActualizadaEn(reserva.getActualizadaEn());
        dto.setServicios(detalles.stream().map(this::toDetalleDto).toList());
        return dto;
    }

    /**
     * Convierte linea de detalle a DTO.
     */
    private ReservaServicioDetalleDto toDetalleDto(ReservaServicio line) {
        ReservaServicioDetalleDto dto = new ReservaServicioDetalleDto();
        dto.setServicioId(line.getServicio().getId());
        dto.setNombreServicio(line.getServicio().getNombre());
        dto.setPrecioAplicado(line.getPrecioAplicado());
        dto.setDuracionAplicadaMinutos(line.getDuracionAplicadaMinutos());
        return dto;
    }
}
