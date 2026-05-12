package org.vedruna.barberia.modules.availability.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.vedruna.barberia.modules.availability.dto.AvailabilityResponseDto;
import org.vedruna.barberia.modules.availability.dto.AvailabilitySlotDto;
import org.vedruna.barberia.modules.reservas.entity.EstadoReserva;
import org.vedruna.barberia.modules.schedule.entity.HorarioBarbero;
import org.vedruna.barberia.modules.reservas.repository.ReservaRepository;
import org.vedruna.barberia.modules.schedule.repository.HorarioBarberoRepository;
import org.vedruna.barberia.modules.servicios.entity.Servicio;
import org.vedruna.barberia.modules.servicios.service.ServicioService;
import org.vedruna.barberia.modules.users.entity.RolUsuario;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.modules.users.service.UsuarioService;
import org.vedruna.barberia.shared.exception.ValidationException;

/**
 * Servicio para calcular disponibilidad diaria de un barbero.
 * Calcula slots de 30 minutos considerando horarios y reservas existentes.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilityService {

    /** Intervalo de muestreo de slots en minutos. */
    private static final int SLOT_STEP_MINUTES = 30;

    /** Repositorio de horarios por fecha. */
    private final HorarioBarberoRepository horarioBarberoRepository;

    /** Repositorio de reservas. */
    private final ReservaRepository reservaRepository;

    /** Servicio de servicios para calcular duracion. */
    private final ServicioService servicioService;

    /** Servicio de usuarios para validar barbero. */
    private final UsuarioService usuarioService;

    /**
     * Calcula slots de disponibilidad en una fecha concreta.
     * Genera slots de 30 minutos considerando:
     * - Horario del barbero en esa fecha
     * - Reservas existentes no canceladas
     * - Duración total de servicios solicitados
     *
     * @param barberoId ID del barbero
     * @param fecha Fecha para la cual consultar disponibilidad
     * @param serviciosIds IDs de servicios para calcular duración total
     * @return DTO con lista de slots (disponibles y/o no disponibles) con sus detalles
     * @throws ValidationException Si el barbero no es válido o fecha es inválida
     * @throws NotFoundException Si el barbero no existe
     */
    @Transactional(readOnly = true)
    public AvailabilityResponseDto getAvailability(Long barberoId, LocalDate fecha, List<Long> serviciosIds) {
        log.info("Checking availability barberoId={} fecha={} servicios={}", barberoId, fecha, serviciosIds);
        Usuario barbero = usuarioService.getRequiredEntity(barberoId);
        if (barbero.getRol() != RolUsuario.BARBERO && barbero.getRol() != RolUsuario.ADMIN) {
            throw new ValidationException("BARBER_NOT_VALID", "El usuario no puede atender reservas como barbero");
        }

        int duracionTotal = calculateRequestedDuration(serviciosIds);
        if (duracionTotal <= 0) {
            throw new ValidationException("INVALID_DURATION", "La duracion total debe ser mayor que cero");
        }

        List<HorarioBarbero> tramos = horarioBarberoRepository.findByBarberoIdAndFechaOrderByHoraInicioAsc(barberoId, fecha);
        List<AvailabilitySlotDto> slots = new ArrayList<>();
        for (HorarioBarbero tramo : tramos) {
            slots.addAll(buildSlotsForTramo(barberoId, fecha, tramo.getHoraInicio(), tramo.getHoraFin(), duracionTotal));
        }

        return new AvailabilityResponseDto(barberoId, fecha, duracionTotal, slots);
    }

    /**
     * Construye slots de un tramo horario.
     */
    private List<AvailabilitySlotDto> buildSlotsForTramo(Long barberoId,
                                                         LocalDate fecha,
                                                         LocalTime tramoInicio,
                                                         LocalTime tramoFin,
                                                         int duracionMinutos) {
        List<AvailabilitySlotDto> result = new ArrayList<>();
        LocalDateTime cursor = LocalDateTime.of(fecha, tramoInicio);
        LocalDateTime hardEnd = LocalDateTime.of(fecha, tramoFin);

        while (!cursor.plusMinutes(duracionMinutos).isAfter(hardEnd)) {
            LocalDateTime slotEnd = cursor.plusMinutes(duracionMinutos);
            boolean overlap = !reservaRepository.findBlockingOverlaps(barberoId, cursor, slotEnd).isEmpty();
            boolean pastSlot = cursor.isBefore(LocalDateTime.now());
            result.add(new AvailabilitySlotDto(cursor, slotEnd, !overlap && !pastSlot));
            cursor = cursor.plusMinutes(SLOT_STEP_MINUTES);
        }
        return result;
    }

    /**
     * Suma la duracion de servicios solicitados o usa 30 min por defecto.
     */
    private int calculateRequestedDuration(List<Long> serviciosIds) {
        if (serviciosIds == null || serviciosIds.isEmpty()) {
            return 30;
        }

        List<Servicio> servicios = servicioService.getByIds(serviciosIds);
        if (servicios.size() != serviciosIds.size()) {
            throw new ValidationException("SERVICE_NOT_FOUND", "Alguno de los servicios solicitados no existe");
        }

        int sum = servicios.stream().mapToInt(Servicio::getDuracionMinutos).sum();
        if (sum <= 0) {
            throw new ValidationException("INVALID_DURATION", "Duracion total invalida");
        }
        return sum;
    }
}
