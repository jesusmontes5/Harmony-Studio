package org.vedruna.barberia.modules.schedule.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.vedruna.barberia.modules.reservas.entity.Reserva;
import org.vedruna.barberia.modules.reservas.entity.ReservaServicio;
import org.vedruna.barberia.modules.reservas.repository.ReservaRepository;
import org.vedruna.barberia.modules.reservas.repository.ReservaServicioRepository;
import org.vedruna.barberia.modules.reservas.dto.ReservaServicioDetalleDto;
import org.vedruna.barberia.modules.schedule.converter.HorarioBarberoConverter;
import org.vedruna.barberia.modules.schedule.dto.AgendaDiaDto;
import org.vedruna.barberia.modules.schedule.dto.AgendaReservaItemDto;
import org.vedruna.barberia.modules.schedule.dto.HorarioBarberoDto;
import org.vedruna.barberia.modules.schedule.repository.HorarioBarberoRepository;
import org.vedruna.barberia.modules.users.entity.RolUsuario;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.shared.exception.ForbiddenException;

/**
 * Servicio de lectura de agenda diaria de barberos.
 * Agrega horarios y reservas de un barbero en una fecha específíca.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AgendaService {

    /** Repositorio de horarios de barbero. */
    private final HorarioBarberoRepository horarioBarberoRepository;

    /** Repositorio de reservas. */
    private final ReservaRepository reservaRepository;

    /** Repositorio de servicios asociados a reservas. */
    private final ReservaServicioRepository reservaServicioRepository;

    /** Converter de horarios. */
    private final HorarioBarberoConverter horarioBarberoConverter;

    /**
     * Obtiene agenda diaria (horarios + reservas) para un barbero en una fecha.
     * Solo el barbero propietario o admin pueden consultar.
     *
     * @param actor Usuario autenticado
     * @param barberoId ID del barbero
     * @param fecha Fecha para la cual obtener la agenda
     * @return DTO con horarios del día y reservas.
     * @throws ForbiddenException Si actor no puede acceder a esa agenda
     */
    @Transactional(readOnly = true)
    public AgendaDiaDto getAgendaDia(Usuario actor, Long barberoId, LocalDate fecha) {
        log.info("Getting daily agenda actorId={} barberoId={} fecha={}", actor.getId(), barberoId, fecha);
        validateActorCanReadAgenda(actor, barberoId);

        List<HorarioBarberoDto> horarios = horarioBarberoRepository
            .findByBarberoIdAndFechaOrderByHoraInicioAsc(barberoId, fecha)
            .stream()
            .map(horarioBarberoConverter::toDto)
            .toList();

        LocalDateTime desde = LocalDateTime.of(fecha, LocalTime.MIN);
        LocalDateTime hasta = LocalDateTime.of(fecha, LocalTime.MAX);
        List<AgendaReservaItemDto> reservas = reservaRepository
            .findForBarbero(barberoId, null, desde, hasta)
            .stream()
            .map(this::toReservaItem)
            .toList();
        List<AgendaReservaItemDto> pendientesHora = reservaRepository
            .findPendingTimeForBarberoAndFecha(barberoId, fecha)
            .stream()
            .map(this::toReservaItem)
            .toList();

        AgendaDiaDto dto = new AgendaDiaDto();
        dto.setBarberoId(barberoId);
        dto.setFecha(fecha);
        dto.setHorarios(horarios);
        dto.setReservas(java.util.stream.Stream.concat(reservas.stream(), pendientesHora.stream()).toList());
        return dto;
    }

    /**
     * Convierte reserva a item de agenda.
     */
    private AgendaReservaItemDto toReservaItem(Reserva reserva) {
        AgendaReservaItemDto dto = new AgendaReservaItemDto();
        dto.setId(reserva.getId());
        dto.setClienteId(reserva.getCliente().getId());
        dto.setClienteNombre(reserva.getCliente().getNombre());
        dto.setFecha(reserva.getFecha() != null
            ? reserva.getFecha()
            : reserva.getFechaInicio() != null ? reserva.getFechaInicio().toLocalDate() : null);
        dto.setFechaInicio(reserva.getFechaInicio());
        dto.setFechaFin(reserva.getFechaFin());
        dto.setEstado(reserva.getEstado());
        dto.setObservacionesCliente(reserva.getObservacionesCliente());
        dto.setPrecioTotal(reserva.getPrecioTotal() != null ? reserva.getPrecioTotal() : BigDecimal.ZERO);
        dto.setServicios(reservaServicioRepository.findByReservaId(reserva.getId()).stream().map(this::toServicioDetalle).toList());
        return dto;
    }

    /**
     * Convierte el detalle de servicio aplicado a DTO.
     */
    private ReservaServicioDetalleDto toServicioDetalle(ReservaServicio line) {
        ReservaServicioDetalleDto dto = new ReservaServicioDetalleDto();
        dto.setServicioId(line.getServicio().getId());
        dto.setNombreServicio(line.getServicio().getNombre());
        dto.setPrecioAplicado(line.getPrecioAplicado());
        dto.setDuracionAplicadaMinutos(line.getDuracionAplicadaMinutos());
        return dto;
    }

    /**
     * Valida acceso a agenda diaria.
     */
    private void validateActorCanReadAgenda(Usuario actor, Long barberoId) {
        if (actor.getRol() == RolUsuario.ADMIN) {
            return;
        }
        if (actor.getRol() == RolUsuario.BARBERO && actor.getId().equals(barberoId)) {
            return;
        }
        throw new ForbiddenException("FORBIDDEN_BARBER_AGENDA", "No puedes ver esta agenda");
    }
}
