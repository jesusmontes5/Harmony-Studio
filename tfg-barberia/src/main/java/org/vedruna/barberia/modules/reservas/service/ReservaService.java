package org.vedruna.barberia.modules.reservas.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.vedruna.barberia.modules.notifications.service.NotificacionService;
import org.vedruna.barberia.modules.notifications.entity.TipoNotificacion;
import org.vedruna.barberia.modules.reservas.dto.AssignHoraReservaRequestDto;
import org.vedruna.barberia.modules.reservas.dto.CreateCitaPendienteHoraRequestDto;
import org.vedruna.barberia.modules.reservas.converter.ReservaConverter;
import org.vedruna.barberia.modules.reservas.dto.CreateReservaRequestDto;
import org.vedruna.barberia.modules.reservas.dto.ReservaDto;
import org.vedruna.barberia.modules.reservas.dto.UpdateReservaEstadoRequestDto;
import org.vedruna.barberia.modules.reservas.entity.EstadoReserva;
import org.vedruna.barberia.modules.reservas.entity.Reserva;
import org.vedruna.barberia.modules.reservas.entity.ReservaServicio;
import org.vedruna.barberia.modules.reservas.entity.ReservaServicioId;
import org.vedruna.barberia.modules.reservas.repository.ReservaRepository;
import org.vedruna.barberia.modules.reservas.repository.ReservaServicioRepository;
import org.vedruna.barberia.modules.schedule.entity.HorarioBarbero;
import org.vedruna.barberia.modules.schedule.repository.HorarioBarberoRepository;
import org.vedruna.barberia.modules.servicios.entity.Servicio;
import org.vedruna.barberia.modules.servicios.service.ServicioService;
import org.vedruna.barberia.modules.users.entity.RolUsuario;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.modules.users.repository.UsuarioRepository;
import org.vedruna.barberia.modules.users.service.UsuarioService;
import org.vedruna.barberia.shared.exception.ConflictException;
import org.vedruna.barberia.shared.exception.ForbiddenException;
import org.vedruna.barberia.shared.exception.NotFoundException;
import org.vedruna.barberia.shared.exception.ValidationException;

/**
 * Servicio de gestión de reservas.
 * Maneja creación, consulta, validación de disponibilidad y actualización de estado de reservas.
 * Valida solapamientos, disponibilidad de barberos y horarios de trabajo.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReservaService {

    /** Formato humano para fecha/hora en mensajes. */
    private static final DateTimeFormatter APPOINTMENT_DTF = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /** Antelacion minima para que un cliente pueda cancelar su cita. */
    private static final long CLIENT_CANCEL_MIN_HOURS = 24;

    /** Aviso persistido al bloquear un cliente por no acudir a una cita. */
    private static final String NO_SHOW_BLOCK_MESSAGE =
        "Tu cuenta ha sido bloqueada por no presentarte a una cita. Contacta con tu barbero para revisar tu caso.";

    /** Estados finales que no admiten transiciones adicionales. */
    private static final Set<EstadoReserva> ESTADOS_FINALES = EnumSet.of(
        EstadoReserva.CANCELADA,
        EstadoReserva.COMPLETADA,
        EstadoReserva.NO_PRESENTADO
    );

    /** Estados activos por cliente para limitar una unica reserva simultanea. */
    private static final Set<EstadoReserva> ESTADOS_ACTIVOS_CLIENTE = EnumSet.of(
        EstadoReserva.PENDIENTE_HORA,
        EstadoReserva.PENDIENTE
    );

    /** Repositorio principal de reservas. */
    private final ReservaRepository reservaRepository;

    /** Repositorio de lineas de servicios aplicados. */
    private final ReservaServicioRepository reservaServicioRepository;

    /** Servicio de usuarios para validar cliente/barbero. */
    private final UsuarioService usuarioService;

    /** Repositorio de usuarios para destinatarios de avisos. */
    private final UsuarioRepository usuarioRepository;

    /** Servicio de servicios para precio y duracion. */
    private final ServicioService servicioService;

    /** Repositorio de horarios para validacion de agenda. */
    private final HorarioBarberoRepository horarioBarberoRepository;

    /** Servicio de notificaciones persistidas. */
    private final NotificacionService notificacionService;

    /** Converter de entidad a DTO de respuesta. */
    private final ReservaConverter reservaConverter;

    /**
     * Crea una nueva reserva.
     * Valida disponibilidad del barbero, solapamiento con otras reservas,
     * y horario de funcionamiento de la barberia.
     * Notifica al cliente y barbero de la nueva reserva,
     * 
     * @param actor Usuario autenticado (usualmente cliente o admin)
     * @param dto Datos de creación (cliente, barbero, servicios, fecha_inicio, observaciones)
     * @return Reserva creada como DTO con detalles de servicios
     * @throws ValidationException Si fecha es pasada, fuera de horario, cliente ya tiene activa, o servicios inactivos
     * @throws ConflictException Si hay solapamiento con otra reserva
     * @throws NotFoundException Si cliente, barbero o alguna servicio no existen
     */
    @Transactional
    public ReservaDto create(Usuario actor, CreateReservaRequestDto dto) {
        log.info("Create reservation actorId={} barberoId={} fechaInicio={}", actor.getId(), dto.getBarberoId(), dto.getFechaInicio());

        Usuario cliente = resolveClienteForCreation(actor);
        Usuario barbero = resolveBarbero(dto.getBarberoId());

        List<Long> servicioIds = dto.getServicios().stream().map(s -> s.getServicioId()).toList();
        List<Servicio> servicios = servicioService.getByIds(servicioIds);
        if (servicios.size() != servicioIds.size()) {
            throw new ValidationException("SERVICE_NOT_FOUND", "Alguno de los servicios no existe");
        }
        if (servicios.stream().anyMatch(s -> !Boolean.TRUE.equals(s.getActivo()))) {
            throw new ValidationException("SERVICE_INACTIVE", "No se puede reservar servicios inactivos");
        }

        int duracionTotal = servicios.stream().mapToInt(Servicio::getDuracionMinutos).sum();
        BigDecimal precioTotal = servicios.stream().map(Servicio::getPrecio).reduce(BigDecimal.ZERO, BigDecimal::add);
        LocalDateTime fechaInicio = dto.getFechaInicio();
        LocalDateTime fechaFin = fechaInicio.plusMinutes(duracionTotal);

        if (fechaInicio.isBefore(LocalDateTime.now())) {
            throw new ValidationException("RESERVATION_IN_PAST", "No se puede crear una reserva en una fecha u hora pasada");
        }
        if (!fechaInicio.toLocalDate().equals(fechaFin.toLocalDate())) {
            throw new ValidationException("INVALID_DATE_RANGE", "La reserva no puede cruzar de dia");
        }

        validateInsideWorkingHours(barbero.getId(), fechaInicio, fechaFin);
        validateNoOverlap(barbero.getId(), fechaInicio, fechaFin);
        validateClientHasNoActiveReservation(cliente.getId());

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setBarbero(barbero);
        reserva.setFecha(fechaInicio.toLocalDate());
        reserva.setFechaInicio(fechaInicio);
        reserva.setFechaFin(fechaFin);
        reserva.setEstado(EstadoReserva.PENDIENTE);
        reserva.setObservacionesCliente(dto.getObservacionesCliente());
        reserva.setPrecioTotal(precioTotal);
        Reserva saved = reservaRepository.save(reserva);

        List<ReservaServicio> detalles = new ArrayList<>();
        for (Servicio servicio : servicios) {
            ReservaServicio line = new ReservaServicio();
            line.setId(new ReservaServicioId(saved.getId(), servicio.getId()));
            line.setReserva(saved);
            line.setServicio(servicio);
            line.setPrecioAplicado(servicio.getPrecio());
            line.setDuracionAplicadaMinutos(servicio.getDuracionMinutos());
            detalles.add(line);
        }
        reservaServicioRepository.saveAll(detalles);

        String serviciosTexto = servicios.stream()
            .map(Servicio::getNombre)
            .collect(Collectors.joining(", "));
        String fechaTexto = fechaInicio.format(APPOINTMENT_DTF);

        String clienteMessage = String.format(
            "Hola %s,\n\nTu reserva ha sido creada correctamente.\n\nCliente: %s\nBarbero: %s\nFecha y hora: %s\nServicios: %s\nPrecio total: %s EUR\n\nGracias por confiar en la barberia.",
            cliente.getNombre(),
            cliente.getNombre(),
            barbero.getNombre(),
            fechaTexto,
            serviciosTexto,
            precioTotal
        );
        String barberoMessage = String.format(
            "Nueva reserva pendiente.\n\nCliente: %s\nBarbero: %s\nFecha y hora: %s\nServicios: %s\nPrecio total: %s EUR",
            cliente.getNombre(),
            barbero.getNombre(),
            fechaTexto,
            serviciosTexto,
            precioTotal
        );
        LocalDateTime reminderDateTime = buildSameDayReminderDateTime(fechaInicio);
        String reminderMessage = String.format(
            "Hola %s,\n\nRecordatorio: hoy tienes una cita en la barberia.\n\nFecha y hora: %s\nBarbero: %s\nServicios: %s\n\nTe esperamos.",
            cliente.getNombre(),
            fechaTexto,
            barbero.getNombre(),
            serviciosTexto
        );

        notificacionService.createInfo(
            cliente,
            saved,
            clienteMessage
        );
        notificacionService.createInfo(
            barbero,
            saved,
            barberoMessage
        );
        notificacionService.createRecordatorio(
            cliente,
            saved,
            TipoNotificacion.RECORDATORIO_DIA,
            reminderDateTime,
            reminderMessage
        );

        return reservaConverter.toDto(saved, detalles);
    }

    /**
     * Crea una cita sin hora para un cliente activo desde la zona de clientes.
     */
    @Transactional
    public ReservaDto crearCitaPendienteHora(Usuario actor, CreateCitaPendienteHoraRequestDto dto) {
        log.info("Create pending-time reservation actorId={} clienteId={} fecha={}", actor.getId(), dto.getClienteId(), dto.getFecha());
        assertCanCreatePendingTimeReservation(actor);

        Usuario cliente = usuarioService.getRequiredEntity(dto.getClienteId());
        if (cliente.getRol() != RolUsuario.CLIENTE) {
            throw new ValidationException("USER_IS_NOT_CLIENT", "Solo se puede programar cita a clientes");
        }
        if (!Boolean.TRUE.equals(cliente.getActivo())) {
            throw new ValidationException("CLIENT_BLOCKED", "No se puede programar cita a un cliente bloqueado");
        }
        if (dto.getFecha().isBefore(LocalDate.now())) {
            throw new ValidationException("RESERVATION_IN_PAST", "No se puede crear una cita en una fecha pasada");
        }

        Servicio servicio = servicioService.getByIds(List.of(dto.getServicioId())).stream()
            .findFirst()
            .orElseThrow(() -> new ValidationException("SERVICE_NOT_FOUND", "El servicio no existe"));
        if (!Boolean.TRUE.equals(servicio.getActivo())) {
            throw new ValidationException("SERVICE_INACTIVE", "No se puede reservar servicios inactivos");
        }

        validateClientHasNoActiveReservation(cliente.getId());

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setBarbero(actor);
        reserva.setFecha(dto.getFecha());
        reserva.setFechaInicio(null);
        reserva.setFechaFin(null);
        reserva.setEstado(EstadoReserva.PENDIENTE_HORA);
        reserva.setObservacionesCliente(dto.getObservacionesCliente());
        reserva.setPrecioTotal(servicio.getPrecio());
        Reserva saved = reservaRepository.save(reserva);

        ReservaServicio line = new ReservaServicio();
        line.setId(new ReservaServicioId(saved.getId(), servicio.getId()));
        line.setReserva(saved);
        line.setServicio(servicio);
        line.setPrecioAplicado(servicio.getPrecio());
        line.setDuracionAplicadaMinutos(servicio.getDuracionMinutos());
        reservaServicioRepository.save(line);

        return reservaConverter.toDto(saved, List.of(line));
    }

    /**
     * Asigna una hora libre a una cita pendiente y la convierte en reserva activa normal.
     */
    @Transactional
    public ReservaDto asignarHoraACita(Usuario actor, Long reservaId, AssignHoraReservaRequestDto dto) {
        log.info("Assign time actorId={} reservaId={} horaInicio={}", actor.getId(), reservaId, dto.getHoraInicio());
        Reserva reserva = getRequiredReserva(reservaId);
        assertCanManagePendingTimeReservation(actor, reserva);

        if (reserva.getEstado() != EstadoReserva.PENDIENTE_HORA) {
            throw new ValidationException("RESERVATION_NOT_PENDING_TIME", "La cita no esta pendiente de hora");
        }
        if (reserva.getFecha() == null) {
            throw new ValidationException("RESERVATION_DATE_REQUIRED", "La cita no tiene fecha asignada");
        }
        if (!dto.getHoraInicio().isBefore(dto.getHoraFin())) {
            throw new ValidationException("INVALID_DATE_RANGE", "La hora de inicio debe ser anterior a la hora de fin");
        }

        LocalDateTime fechaInicio = LocalDateTime.of(reserva.getFecha(), dto.getHoraInicio());
        LocalDateTime fechaFin = LocalDateTime.of(reserva.getFecha(), dto.getHoraFin());
        if (fechaInicio.isBefore(LocalDateTime.now())) {
            throw new ValidationException("RESERVATION_IN_PAST", "No se puede asignar una hora pasada");
        }

        List<ReservaServicio> detalles = reservaServicioRepository.findByReservaId(reserva.getId());
        int duracionTotal = detalles.stream().mapToInt(ReservaServicio::getDuracionAplicadaMinutos).sum();
        if (!fechaInicio.plusMinutes(duracionTotal).equals(fechaFin)) {
            throw new ValidationException("INVALID_DURATION", "La duracion no coincide con el servicio seleccionado");
        }

        validateInsideWorkingHours(reserva.getBarbero().getId(), fechaInicio, fechaFin);
        validateNoOverlap(reserva.getBarbero().getId(), fechaInicio, fechaFin);

        reserva.setFechaInicio(fechaInicio);
        reserva.setFechaFin(fechaFin);
        reserva.setEstado(EstadoReserva.PENDIENTE);
        Reserva saved = reservaRepository.save(reserva);

        String serviciosTexto = detalles.stream()
            .map(line -> line.getServicio().getNombre())
            .collect(Collectors.joining(", "));
        String fechaTexto = fechaInicio.format(APPOINTMENT_DTF);
        String clienteMessage = String.format(
            "Hola %s,\n\nTu cita ha sido asignada correctamente.\n\nCliente: %s\nBarbero: %s\nFecha y hora: %s\nServicios: %s\nPrecio total: %s EUR\n\nGracias por confiar en la barberia.",
            reserva.getCliente().getNombre(),
            reserva.getCliente().getNombre(),
            reserva.getBarbero().getNombre(),
            fechaTexto,
            serviciosTexto,
            reserva.getPrecioTotal()
        );
        String barberoMessage = String.format(
            "Cita asignada correctamente.\n\nCliente: %s\nBarbero: %s\nFecha y hora: %s\nServicios: %s\nPrecio total: %s EUR",
            reserva.getCliente().getNombre(),
            reserva.getBarbero().getNombre(),
            fechaTexto,
            serviciosTexto,
            reserva.getPrecioTotal()
        );
        String reminderMessage = String.format(
            "Hola %s,\n\nRecordatorio: hoy tienes una cita en la barberia.\n\nFecha y hora: %s\nBarbero: %s\nServicios: %s\n\nTe esperamos.",
            reserva.getCliente().getNombre(),
            fechaTexto,
            reserva.getBarbero().getNombre(),
            serviciosTexto
        );

        notificacionService.createInfo(reserva.getCliente(), saved, clienteMessage);
        notificacionService.createInfo(reserva.getBarbero(), saved, barberoMessage);
        notificacionService.createRecordatorio(
            reserva.getCliente(),
            saved,
            TipoNotificacion.RECORDATORIO_DIA,
            buildSameDayReminderDateTime(fechaInicio),
            reminderMessage
        );
        return reservaConverter.toDto(saved, detalles);
    }

    /**
     * Lista reservas con filtros y alcance basado en rol del usuario.
     * Admin ve todas, barbero ve solo sus reservas, cliente ve solo las suyas.
     * 
     * @param actor Usuario autenticado
     * @param estado Filtro opcional: estado de reserva (PENDIENTE, COMPLETADA, etc)
     * @param desde Filtro opcional: fecha_inicio >= desde
     * @param hasta Filtro opcional: fecha_inicio <= hasta
     * @param barberoId Filtro opcional: ID del barbero (solo para admin)
     * @return Lista de reservas que coinciden con filtros y permisos del usuario
     */
    @Transactional(readOnly = true)
    public List<ReservaDto> list(Usuario actor,
                                 EstadoReserva estado,
                                 LocalDateTime desde,
                                 LocalDateTime hasta,
                                 Long barberoId) {
        log.info("List reservations actorId={} role={} estado={}", actor.getId(), actor.getRol(), estado);
        List<Reserva> reservas;

        if (actor.getRol() == RolUsuario.ADMIN) {
            reservas = reservaRepository.findForAdmin(barberoId, estado, desde, hasta);
        } else if (actor.getRol() == RolUsuario.BARBERO) {
            reservas = reservaRepository.findForBarbero(actor.getId(), estado, desde, hasta);
        } else {
            reservas = reservaRepository.findForCliente(actor.getId(), estado, desde, hasta);
        }

        return reservas.stream().map(this::toDtoWithDetails).toList();
    }

    /**
     * Obtiene una reserva por ID verificando permisos del usuario.
     * Solo el cliente, barbero o admin de la reserva pueden verla.
     * 
     * @param actor Usuario autenticado
     * @param reservaId ID de la reserva
     * @return Reserva como DTO con detalles de servicios
     * @throws NotFoundException Si la reserva no existe
     * @throws ForbiddenException Si el usuario no tiene permiso para verla
     */
    @Transactional(readOnly = true)
    public ReservaDto getById(Usuario actor, Long reservaId) {
        log.info("Get reservation actorId={} reservaId={}", actor.getId(), reservaId);
        Reserva reserva = getRequiredReserva(reservaId);
        assertCanRead(actor, reserva);
        return toDtoWithDetails(reserva);
    }

    /**
     * Actualiza el estado de una reserva con validación de transiciones.
     * Solo admin, barbero dueño de la reserva o cliente pueden cambiar estado.
     * Para cancelación requiere motivo.
     * 
     * @param actor Usuario autenticado
     * @param reservaId ID de la reserva
     * @param dto Nuevo estado y observaciones opcionales
     * @return Reserva actualizada como DTO
     * @throws NotFoundException Si la reserva no existe
     * @throws ValidationException Si la transición de estado no es válida o falta motivo de cancelación
     * @throws ForbiddenException Si el usuario no tiene permiso para cambiar el estado
     */
    @Transactional
    public ReservaDto updateStatus(Usuario actor, Long reservaId, UpdateReservaEstadoRequestDto dto) {
        log.info("Update reservation status actorId={} reservaId={} -> {}", actor.getId(), reservaId, dto.getEstado());
        Reserva reserva = getRequiredReserva(reservaId);
        assertCanManageStatus(actor, reserva, dto.getEstado());
        validateTransition(reserva.getEstado(), dto.getEstado());
        validateClientCancellationWindow(actor, reserva, dto.getEstado());

        reserva.setEstado(dto.getEstado());
        if (dto.getObservacionesBarbero() != null) {
            reserva.setObservacionesBarbero(dto.getObservacionesBarbero());
        }
        if (dto.getEstado() == EstadoReserva.CANCELADA) {
            if (dto.getMotivoCancelacion() == null || dto.getMotivoCancelacion().isBlank()) {
                throw new ValidationException("CANCEL_REASON_REQUIRED", "Debes indicar motivo de cancelacion");
            }
            reserva.setMotivoCancelacion(dto.getMotivoCancelacion());
        }

        Reserva updated = reservaRepository.save(reserva);
        if (dto.getEstado() == EstadoReserva.NO_PRESENTADO) {
            blockClientForNoShow(actor, reserva);
        }
        if (dto.getEstado() == EstadoReserva.CANCELADA) {
            String serviciosTexto = getServiciosTexto(reserva);
            String fechaTexto = reserva.getFechaInicio() == null
                ? "Pendiente de asignar"
                : reserva.getFechaInicio().format(APPOINTMENT_DTF);
            String motivo = reserva.getMotivoCancelacion() == null || reserva.getMotivoCancelacion().isBlank()
                ? "No indicado"
                : reserva.getMotivoCancelacion();

            String msgCliente = String.format(
                "Hola %s,\n\nTu reserva ha sido cancelada.\n\nReserva: #%d\nCliente: %s\nBarbero: %s\nFecha y hora: %s\nServicios: %s\nMotivo de cancelacion: %s\n\nSi necesitas una nueva cita, puedes volver a reservar desde la aplicacion.",
                reserva.getCliente().getNombre(),
                reserva.getId(),
                reserva.getCliente().getNombre(),
                reserva.getBarbero().getNombre(),
                fechaTexto,
                serviciosTexto,
                motivo
            );
            String msgBarbero = String.format(
                "La reserva ha sido cancelada.\n\nReserva: #%d\nCliente: %s\nBarbero: %s\nFecha y hora: %s\nServicios: %s\nMotivo de cancelacion: %s\nCancelada por: %s\n\nEl hueco queda liberado si cumple la antelacion minima configurada.",
                reserva.getId(),
                reserva.getCliente().getNombre(),
                reserva.getBarbero().getNombre(),
                fechaTexto,
                serviciosTexto,
                motivo,
                actor.getNombre()
            );
            notificacionService.createCancelacion(reserva.getCliente(), reserva, msgCliente);
            notificacionService.createCancelacion(reserva.getBarbero(), reserva, msgBarbero);
            notifyClientsAboutFreeSlot(reserva, actor);
        }
        return toDtoWithDetails(updated);
    }

    /**
     * Obtiene reserva o lanza exception de dominio.
     */
    private Reserva getRequiredReserva(Long id) {
        return reservaRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("RESERVATION_NOT_FOUND", "Reserva no encontrada"));
    }

    /**
     * Resuelve cliente segun rol del actor creador.
     */
    private Usuario resolveClienteForCreation(Usuario actor) {
        if (actor.getRol() == RolUsuario.CLIENTE) {
            return actor;
        }
        if (actor.getRol() == RolUsuario.ADMIN) {
            throw new ForbiddenException("RESERVATION_CREATE_FORBIDDEN", "El admin no puede crear reservas");
        }
        throw new ForbiddenException("RESERVATION_CREATE_FORBIDDEN", "Solo clientes pueden crear reservas");
    }

    /**
     * Resuelve y valida que el usuario objetivo sea barbero.
     */
    private Usuario resolveBarbero(Long barberoId) {
        Usuario barbero = usuarioService.getRequiredEntity(barberoId);
        if (barbero.getRol() != RolUsuario.BARBERO && barbero.getRol() != RolUsuario.ADMIN) {
            throw new ValidationException("BARBER_NOT_VALID", "El usuario indicado no es barbero");
        }
        return barbero;
    }

    /**
     * Solo barberos y administradores pueden programar citas desde clientes.
     */
    private void assertCanCreatePendingTimeReservation(Usuario actor) {
        if (actor.getRol() == RolUsuario.BARBERO || actor.getRol() == RolUsuario.ADMIN) {
            return;
        }
        throw new ForbiddenException("RESERVATION_CREATE_FORBIDDEN", "Solo barberos pueden programar citas");
    }

    /**
     * Solo el barbero propietario o admin pueden asignar hora a una cita pendiente.
     */
    private void assertCanManagePendingTimeReservation(Usuario actor, Reserva reserva) {
        if (actor.getRol() == RolUsuario.ADMIN) {
            return;
        }
        if (actor.getRol() == RolUsuario.BARBERO && reserva.getBarbero().getId().equals(actor.getId())) {
            return;
        }
        throw new ForbiddenException("RESERVATION_STATUS_FORBIDDEN", "No puedes asignar hora a esta cita");
    }

    /**
     * Valida que no exista solape de horarios para el barbero.
     */
    private void validateNoOverlap(Long barberoId, LocalDateTime inicio, LocalDateTime fin) {
        boolean overlap = reservaRepository.existsOverlap(barberoId, inicio, fin);
        if (overlap) {
            throw new ValidationException("RESERVATION_OVERLAP", "Existe una reserva solapada para el barbero");
        }
    }

    /**
     * Valida que el cliente no tenga otra reserva activa (pendiente).
     */
    private void validateClientHasNoActiveReservation(Long clienteId) {
        boolean hasActiveReservation = reservaRepository.existsByClienteIdAndEstadoIn(clienteId, ESTADOS_ACTIVOS_CLIENTE);
        if (hasActiveReservation) {
            throw new ValidationException(
                "CLIENT_ALREADY_HAS_ACTIVE_RESERVATION",
                "El cliente ya tiene una reserva activa"
            );
        }
    }

    /**
     * Valida que la reserva quede completamente dentro de algun tramo laboral del dia.
     */
    private void validateInsideWorkingHours(Long barberoId, LocalDateTime inicio, LocalDateTime fin) {
        List<HorarioBarbero> horarios = horarioBarberoRepository.findByBarberoIdAndFechaOrderByHoraInicioAsc(barberoId, inicio.toLocalDate());
        boolean insideSomeSlot = horarios.stream().anyMatch(h ->
            !inicio.toLocalTime().isBefore(h.getHoraInicio()) && !fin.toLocalTime().isAfter(h.getHoraFin())
        );
        if (!insideSomeSlot) {
            throw new ValidationException("OUTSIDE_WORKING_HOURS", "La reserva queda fuera del horario del barbero");
        }
    }

    /**
     * Comprueba permiso de lectura de reserva segun rol.
     */
    private void assertCanRead(Usuario actor, Reserva reserva) {
        if (actor.getRol() == RolUsuario.ADMIN) {
            return;
        }
        if (actor.getRol() == RolUsuario.BARBERO && reserva.getBarbero().getId().equals(actor.getId())) {
            return;
        }
        if (actor.getRol() == RolUsuario.CLIENTE && reserva.getCliente().getId().equals(actor.getId())) {
            return;
        }
        throw new ForbiddenException("RESERVATION_FORBIDDEN", "No puedes acceder a esta reserva");
    }

    /**
     * Comprueba permiso de cambio de estado segun rol y propiedad.
     */
    private void assertCanManageStatus(Usuario actor, Reserva reserva, EstadoReserva destino) {
        if (actor.getRol() == RolUsuario.ADMIN) {
            return;
        }
        if (actor.getRol() == RolUsuario.BARBERO && reserva.getBarbero().getId().equals(actor.getId())) {
            return;
        }
        if (actor.getRol() == RolUsuario.CLIENTE && reserva.getCliente().getId().equals(actor.getId()) && destino == EstadoReserva.CANCELADA) {
            return;
        }
        throw new ForbiddenException("RESERVATION_STATUS_FORBIDDEN", "No puedes cambiar el estado de esta reserva");
    }

    /**
     * Impide que clientes cancelen citas con 24 horas o menos de antelacion.
     * Barberos y administradores mantienen la gestion operativa de agenda.
     */
    private void validateClientCancellationWindow(Usuario actor, Reserva reserva, EstadoReserva destino) {
        if (actor.getRol() != RolUsuario.CLIENTE || destino != EstadoReserva.CANCELADA) {
            return;
        }
        if (reserva.getFechaInicio() == null) {
            return;
        }

        LocalDateTime cancelLimit = LocalDateTime.now().plusHours(CLIENT_CANCEL_MIN_HOURS);
        if (!reserva.getFechaInicio().isAfter(cancelLimit)) {
            throw new ConflictException(
                "CANCELLATION_WINDOW_CLOSED",
                "No puedes cancelar una reserva con menos de 24 horas de antelacion"
            );
        }
    }

    /**
     * Bloquea automaticamente al cliente cuando una cita queda marcada como no presentada.
     */
    private void blockClientForNoShow(Usuario actor, Reserva reserva) {
        Usuario cliente = reserva.getCliente();
        if (!Boolean.TRUE.equals(cliente.getActivo())) {
            return;
        }
        usuarioService.blockClient(actor, cliente.getId());
        notificacionService.createInfo(cliente, reserva, NO_SHOW_BLOCK_MESSAGE);
    }

    /**
     * Avisa a clientes activos cuando una cancelacion libera un hueco reservable.
     */
    private void notifyClientsAboutFreeSlot(Reserva reserva, Usuario actor) {
        if (reserva.getFechaInicio() == null || reserva.getFechaFin() == null) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        if (!reserva.getFechaInicio().isAfter(now.plusHours(CLIENT_CANCEL_MIN_HOURS))) {
            return;
        }

        String serviciosTexto = getServiciosTexto(reserva);
        String fechaTexto = reserva.getFechaInicio().format(APPOINTMENT_DTF);
        String horaFinTexto = reserva.getFechaFin().toLocalTime().toString();
        String barberoNombre = reserva.getBarbero().getNombre();

        String message = String.format(
            "Se ha quedado libre un hueco en la barberia.\n\nBarbero: %s\nFecha y hora: %s - %s\nServicios aproximados: %s\n\nPuedes entrar en la aplicacion y reservarlo si sigue disponible.",
            barberoNombre,
            fechaTexto,
            horaFinTexto,
            serviciosTexto
        );

        usuarioRepository.findByRolInAndActivoTrue(List.of(RolUsuario.CLIENTE)).stream()
            .filter(cliente -> shouldReceiveFreeSlotNotice(cliente, reserva, actor))
            .forEach(cliente -> notificacionService.createSystemInfoAlways(cliente, message));
    }

    /**
     * Evita enviar el aviso masivo al afectado directo o al usuario que cancela.
     */
    private boolean shouldReceiveFreeSlotNotice(Usuario candidate, Reserva reserva, Usuario actor) {
        Long candidateId = candidate.getId();
        if (candidateId == null) {
            return false;
        }
        if (reserva.getCliente() != null && candidateId.equals(reserva.getCliente().getId())) {
            return false;
        }
        if (reserva.getBarbero() != null && candidateId.equals(reserva.getBarbero().getId())) {
            return false;
        }
        return actor == null || !candidateId.equals(actor.getId());
    }

    /**
     * Obtiene los nombres de servicios de una reserva para mensajes al usuario.
     */
    private String getServiciosTexto(Reserva reserva) {
        List<ReservaServicio> detalles = reservaServicioRepository.findByReservaId(reserva.getId());
        if (detalles.isEmpty()) {
            return "Servicios disponibles";
        }
        return detalles.stream()
            .map(line -> line.getServicio().getNombre())
            .collect(Collectors.joining(", "));
    }

    /**
     * Valida transiciones permitidas del estado de reserva.
     */
    private void validateTransition(EstadoReserva from, EstadoReserva to) {
        if (from == to) {
            return;
        }
        if (ESTADOS_FINALES.contains(from)) {
            throw new ValidationException("INVALID_STATE_TRANSITION", "El estado actual es final y no admite cambios");
        }
        if (from == EstadoReserva.PENDIENTE_HORA && to == EstadoReserva.CANCELADA) {
            return;
        }
        if (from == EstadoReserva.PENDIENTE
            && (to == EstadoReserva.COMPLETADA || to == EstadoReserva.CANCELADA || to == EstadoReserva.NO_PRESENTADO)) {
            return;
        }
        throw new ValidationException("INVALID_STATE_TRANSITION", "Transicion de estado no permitida");
    }

    /**
     * Convierte reserva a DTO incluyendo lineas de servicio.
     */
    private ReservaDto toDtoWithDetails(Reserva reserva) {
        List<ReservaServicio> detalles = reservaServicioRepository.findByReservaId(reserva.getId());
        return reservaConverter.toDto(reserva, detalles);
    }

    /**
     * Programa recordatorio el mismo dia a las 09:00 o inmediatamente si ya paso.
     */
    private LocalDateTime buildSameDayReminderDateTime(LocalDateTime fechaInicio) {
        LocalDateTime planned = LocalDateTime.of(fechaInicio.toLocalDate(), LocalTime.of(9, 0));
        LocalDateTime now = LocalDateTime.now();
        return planned.isBefore(now) ? now : planned;
    }
}
