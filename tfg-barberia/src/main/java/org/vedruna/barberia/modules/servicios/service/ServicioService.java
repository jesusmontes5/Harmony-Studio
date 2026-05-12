package org.vedruna.barberia.modules.servicios.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.vedruna.barberia.modules.reservas.entity.EstadoReserva;
import org.vedruna.barberia.modules.reservas.repository.ReservaServicioRepository;
import org.vedruna.barberia.modules.servicios.converter.ServicioConverter;
import org.vedruna.barberia.modules.servicios.dto.CreateServicioRequestDto;
import org.vedruna.barberia.modules.servicios.dto.ServicioDto;
import org.vedruna.barberia.modules.servicios.dto.UpdateServicioRequestDto;
import org.vedruna.barberia.modules.servicios.entity.Servicio;
import org.vedruna.barberia.modules.servicios.repository.ServicioRepository;
import org.vedruna.barberia.shared.exception.ConflictException;
import org.vedruna.barberia.shared.exception.NotFoundException;

/**
 * Servicio de gestión de servicios de barbería.
 * Permite crear, actualizar, listar y eliminar servicios disponibles para reservas.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioService {

    /** Repositorio de servicios. */
    private final ServicioRepository servicioRepository;

    /** Repositorio de detalle de servicios en reservas. */
    private final ReservaServicioRepository reservaServicioRepository;

    /** Converter de entidad a DTO. */
    private final ServicioConverter servicioConverter;

    /**
     * Lista servicios según visibilidad y estado activo.
     * Retorna todos o solo activos.
     *
     * @param includeInactive Si true, incluye servicios inactivos. Si false, solo activos.
     * @return Lista de servicios como DTOs
     */
    @Transactional(readOnly = true)
    public List<ServicioDto> list(boolean includeInactive) {
        log.info("Listing services includeInactive={}", includeInactive);
        List<Servicio> servicios = includeInactive
            ? servicioRepository.findAll()
            : servicioRepository.findByActivoTrueOrderByNombreAsc();
        return servicios.stream().map(servicioConverter::toDto).toList();
    }

    /**
     * Crea un nuevo servicio de barbería.
     * El precio y duración son requeridos para calcular reservas.
     *
     * @param dto Datos del servicio (nombre, descripción, duración, precio)
     * @return Servicio creado como DTO
     * @throws ValidationException Si los datos no son válidos
     */
    @Transactional
    public ServicioDto create(CreateServicioRequestDto dto) {
        log.info("Creating service nombre={}", dto.getNombre());
        Servicio servicio = new Servicio();
        servicio.setNombre(dto.getNombre());
        servicio.setDescripcion(dto.getDescripcion());
        servicio.setDuracionMinutos(dto.getDuracionMinutos());
        servicio.setPrecio(dto.getPrecio());
        servicio.setActivo(true);
        return servicioConverter.toDto(servicioRepository.save(servicio));
    }

    /**
     * Actualiza parcialmente un servicio existente.
     * Solo actualiza los campos proporcionados en el DTO.
     *
     * @param id ID del servicio a actualizar
     * @param dto Campos a actualizar (nombre, descripción, duración, precio, activo)
     * @return Servicio actualizado como DTO
     * @throws NotFoundException Si el servicio no existe
     */
    @Transactional
    public ServicioDto patch(Long id, UpdateServicioRequestDto dto) {
        log.info("Patching service id={}", id);
        Servicio servicio = servicioRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("SERVICE_NOT_FOUND", "Servicio no encontrado"));

        if (dto.getNombre() != null) {
            servicio.setNombre(dto.getNombre());
        }
        if (dto.getDescripcion() != null) {
            servicio.setDescripcion(dto.getDescripcion());
        }
        if (dto.getDuracionMinutos() != null) {
            servicio.setDuracionMinutos(dto.getDuracionMinutos());
        }
        if (dto.getPrecio() != null) {
            servicio.setPrecio(dto.getPrecio());
        }
        if (dto.getActivo() != null) {
            servicio.setActivo(dto.getActivo());
        }

        return servicioConverter.toDto(servicioRepository.save(servicio));
    }

    /**
     * Elimina un servicio.
     * No se puede eliminar si está en uso en reservas activas o completadas.
     * Se eliminan referencias en reservas canceladas.
     *
     * @param id ID del servicio a eliminar
     * @throws NotFoundException Si el servicio no existe
     * @throws ConflictException Si el servicio está en uso en reservas activas/completadas
     */
    @Transactional
    public void delete(Long id) {
        log.info("Deleting service id={}", id);
        Servicio servicio = servicioRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("SERVICE_NOT_FOUND", "Servicio no encontrado"));

        boolean inUseOutsideCancelled = reservaServicioRepository.existsByServicioIdAndReservaEstadoNot(
            id,
            EstadoReserva.CANCELADA
        );
        if (inUseOutsideCancelled) {
            throw new ConflictException(
                "SERVICE_IN_USE",
                "No se puede borrar el servicio porque ya está asociado a reservas activas o finalizadas"
            );
        }

        reservaServicioRepository.deleteByServicioIdAndReservaEstado(id, EstadoReserva.CANCELADA);

        try {
            servicioRepository.delete(servicio);
            servicioRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException(
                "SERVICE_IN_USE",
                "No se puede borrar el servicio porque ya está asociado a reservas"
            );
        }
    }

    /**
     * Obtiene servicios por id para calculo de reserva.
     */
    @Transactional(readOnly = true)
    public List<Servicio> getByIds(List<Long> ids) {
        return servicioRepository.findByIdIn(ids);
    }
}
