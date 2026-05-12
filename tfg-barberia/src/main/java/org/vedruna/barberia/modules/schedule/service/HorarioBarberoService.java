package org.vedruna.barberia.modules.schedule.service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.vedruna.barberia.modules.reservas.entity.EstadoReserva;
import org.vedruna.barberia.modules.reservas.entity.Reserva;
import org.vedruna.barberia.modules.reservas.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.vedruna.barberia.modules.schedule.converter.HorarioBarberoConverter;
import org.vedruna.barberia.modules.schedule.dto.HorarioBarberoDto;
import org.vedruna.barberia.modules.schedule.entity.HorarioBarbero;
import org.vedruna.barberia.modules.schedule.repository.HorarioBarberoRepository;
import org.vedruna.barberia.modules.users.entity.RolUsuario;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.modules.users.service.UsuarioService;
import org.vedruna.barberia.shared.exception.ForbiddenException;
import org.vedruna.barberia.shared.exception.ValidationException;

/**
 * Servicio de gestión del horario por fecha de barberos.
 * Permite consultar y definir el horario de atención de cada barbero.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HorarioBarberoService {

    /** Estados con citas vivas que no deben quedar fuera del horario. */
    private static final Set<EstadoReserva> ESTADOS_RESERVA_BLOQUEANTES = Set.of(EstadoReserva.PENDIENTE);

    /** Repositorio de horarios. */
    private final HorarioBarberoRepository horarioBarberoRepository;

    /** Repositorio de reservas. */
    private final ReservaRepository reservaRepository;

    /** Servicio de usuarios para validar existencia de barbero. */
    private final UsuarioService usuarioService;

    /** Converter de entidad a DTO. */
    private final HorarioBarberoConverter horarioBarberoConverter;

    /**
     * Obtiene tramos de horario de un barbero.
     * Puede filtrar por fecha específíca o retornar todo el horario.
     *
     * @param barberoId ID del barbero
     * @param fecha Fecha opcional para filtrar. Si es null, retorna todo el horario.
     * @return Lista ordenada de tramos horarios como DTOs
     */
    @Transactional(readOnly = true)
    public List<HorarioBarberoDto> getSchedule(Long barberoId, LocalDate fecha) {
        log.info("Getting schedule for barberoId={} fecha={}", barberoId, fecha);
        List<HorarioBarbero> horarios = fecha == null
            ? horarioBarberoRepository.findByBarberoIdOrderByFechaAscHoraInicioAsc(barberoId)
            : horarioBarberoRepository.findByBarberoIdAndFechaOrderByHoraInicioAsc(barberoId, fecha);

        return horarios.stream().map(horario -> toDtoWithReservationLock(barberoId, horario)).toList();
    }

    /**
     * Reemplaza completamente el horario de un barbero.
     * Solo el barbero o admin pueden actualizar horarios.
     * Valida que no haya solapamientos entre tramos.
     *
     * @param actor Usuario autenticado (barbero o admin)
     * @param barberoId ID del barbero cuyo horario se actualiza
     * @param dtos Lista de tramos horarios finales (reemplaza completamente el anterior)
     * @return Tramos persistidos como DTOs
     * @throws ForbiddenException Si actor no puede gestionar ese barbero
     * @throws ValidationException Si los datos no son válidos o hay solapamientos
     * @throws NotFoundException Si el barbero no existe
     */
    @Transactional
    public List<HorarioBarberoDto> replaceSchedule(Usuario actor, Long barberoId, List<HorarioBarberoDto> dtos) {
        log.info("Replacing schedule actorId={} barberoId={} rows={}", actor.getId(), barberoId, dtos.size());
        validateActorCanManageBarber(actor, barberoId);
        Usuario barbero = usuarioService.getRequiredEntity(barberoId);
        if (barbero.getRol() != RolUsuario.BARBERO && barbero.getRol() != RolUsuario.ADMIN) {
            throw new ValidationException("BARBER_NOT_VALID", "El usuario objetivo no es barbero");
        }

        for (HorarioBarberoDto dto : dtos) {
            if (dto.getFecha() == null || dto.getHoraInicio() == null || dto.getHoraFin() == null) {
                throw new ValidationException("INVALID_SCHEDULE", "Cada tramo debe incluir fecha, hora_inicio y hora_fin");
            }
            if (!dto.getHoraInicio().isBefore(dto.getHoraFin())) {
                throw new ValidationException("INVALID_SCHEDULE_RANGE", "hora_inicio debe ser menor que hora_fin");
            }
        }

        validateNoOverlap(dtos);
        validateNoPendingReservationsOutsideNewSchedule(barberoId, dtos);

        horarioBarberoRepository.deleteByBarberoId(barberoId);
        horarioBarberoRepository.flush();

        List<HorarioBarbero> entities = dtos.stream().map(dto -> {
            HorarioBarbero row = new HorarioBarbero();
            row.setBarbero(barbero);
            row.setFecha(dto.getFecha());
            row.setHoraInicio(dto.getHoraInicio());
            row.setHoraFin(dto.getHoraFin());
            return row;
        }).toList();

        return horarioBarberoRepository.saveAll(entities).stream()
            .map(horario -> toDtoWithReservationLock(barberoId, horario))
            .toList();
    }

    /**
     * Valida solapes dentro de la misma fecha.
     */
    private void validateNoOverlap(List<HorarioBarberoDto> dtos) {
        var grouped = dtos.stream().collect(java.util.stream.Collectors.groupingBy(HorarioBarberoDto::getFecha));
        for (var entry : grouped.entrySet()) {
            List<HorarioBarberoDto> sorted = entry.getValue().stream()
                .sorted(Comparator.comparing(HorarioBarberoDto::getHoraInicio))
                .toList();
            for (int i = 0; i < sorted.size() - 1; i++) {
                if (sorted.get(i).getHoraFin().isAfter(sorted.get(i + 1).getHoraInicio())) {
                    throw new ValidationException(
                        "SCHEDULE_OVERLAP",
                        "Hay tramos solapados en la fecha " + entry.getKey()
                    );
                }
            }
        }
    }

    /**
     * Evita eliminar o recortar tramos que contienen reservas pendientes.
     */
    private void validateNoPendingReservationsOutsideNewSchedule(Long barberoId, List<HorarioBarberoDto> newSchedule) {
        List<HorarioBarbero> currentSchedule = horarioBarberoRepository.findByBarberoIdOrderByFechaAscHoraInicioAsc(barberoId);
        for (HorarioBarbero current : currentSchedule) {
            LocalDateTime currentStart = current.getFecha().atTime(current.getHoraInicio());
            LocalDateTime currentEnd = current.getFecha().atTime(current.getHoraFin());
            List<Reserva> overlaps = reservaRepository.findScheduledOverlapsByEstados(
                barberoId,
                ESTADOS_RESERVA_BLOQUEANTES,
                currentStart,
                currentEnd
            );
            for (Reserva reserva : overlaps) {
                if (!isReservationCoveredBySchedule(reserva, newSchedule)) {
                    throw new ValidationException(
                        "SCHEDULE_HAS_PENDING_RESERVATIONS",
                        "No puedes eliminar un tramo horario con reservas pendientes"
                    );
                }
            }
        }
    }

    /**
     * Comprueba que una reserva mantiene cobertura completa dentro del nuevo horario.
     */
    private boolean isReservationCoveredBySchedule(Reserva reserva, List<HorarioBarberoDto> schedule) {
        LocalDate fechaReserva = reserva.getFechaInicio().toLocalDate();
        var horaInicioReserva = reserva.getFechaInicio().toLocalTime();
        var horaFinReserva = reserva.getFechaFin().toLocalTime();

        return schedule.stream().anyMatch(dto ->
            fechaReserva.equals(dto.getFecha())
                && !horaInicioReserva.isBefore(dto.getHoraInicio())
                && !horaFinReserva.isAfter(dto.getHoraFin())
        );
    }

    /**
     * Convierte un tramo indicando si contiene reservas que bloquean su eliminacion.
     */
    private HorarioBarberoDto toDtoWithReservationLock(Long barberoId, HorarioBarbero horario) {
        HorarioBarberoDto dto = horarioBarberoConverter.toDto(horario);
        dto.setBloqueadoPorReservas(hasBlockingReservations(barberoId, horario));
        return dto;
    }

    /**
     * Comprueba si un tramo contiene reservas pendientes.
     */
    private boolean hasBlockingReservations(Long barberoId, HorarioBarbero horario) {
        LocalDateTime inicio = horario.getFecha().atTime(horario.getHoraInicio());
        LocalDateTime fin = horario.getFecha().atTime(horario.getHoraFin());
        return !reservaRepository.findScheduledOverlapsByEstados(
            barberoId,
            ESTADOS_RESERVA_BLOQUEANTES,
            inicio,
            fin
        ).isEmpty();
    }

    /**
     * Valida permisos de gestion sobre barbero.
     */
    private void validateActorCanManageBarber(Usuario actor, Long barberoId) {
        if (actor.getRol() == RolUsuario.ADMIN) {
            return;
        }
        if (actor.getRol() == RolUsuario.BARBERO && actor.getId().equals(barberoId)) {
            return;
        }
        throw new ForbiddenException("FORBIDDEN_BARBER_RESOURCE", "No puedes gestionar este barbero");
    }
}
