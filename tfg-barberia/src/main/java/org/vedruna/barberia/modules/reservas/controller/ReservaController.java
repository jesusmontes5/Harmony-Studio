package org.vedruna.barberia.modules.reservas.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.vedruna.barberia.modules.reservas.dto.AssignHoraReservaRequestDto;
import org.vedruna.barberia.modules.reservas.dto.CreateCitaPendienteHoraRequestDto;
import org.vedruna.barberia.modules.reservas.dto.CreateReservaRequestDto;
import org.vedruna.barberia.modules.reservas.dto.ReservaDto;
import org.vedruna.barberia.modules.reservas.dto.UpdateReservaEstadoRequestDto;
import org.vedruna.barberia.modules.reservas.entity.EstadoReserva;
import org.vedruna.barberia.modules.reservas.service.ReservaService;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.shared.dto.ErrorResponseDto;

/**
 * Controlador REST de reservas.
 * Gestiona creación, listado y actualización de estado de reservas.
 */
@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reservas", description = "Endpoints para gestión de reservas de barberia")
public class ReservaController {

    /** Servicio de reservas. */
    private final ReservaService reservaService;

    /**
     * Crea una nueva reserva.
     * El usuario autenticado se convierte automáticamente en cliente de la reserva.
     * 
     * @param actor Usuario autenticado (cliente)
     * @param dto Datos de la reserva (barbero, fecha, servicios, observaciones)
     * @return Reserva creada con estado PENDIENTE
     */
    @PostMapping
    @Operation(
        summary = "Crear reserva",
        description = "Crea una nueva reserva de barberia. El usuario autenticado es el cliente."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Reserva creada exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReservaDto.class))),
        @ApiResponse(responseCode = "400", description = "Datos inválidos o rango de fecha inválido",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "409", description = "Barbero no disponible en el horario solicitado")
    })
    public ResponseEntity<ReservaDto> create(@AuthenticationPrincipal Usuario actor,
                                             @Valid @RequestBody CreateReservaRequestDto dto) {
        log.info("POST /reservations");
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.create(actor, dto));
    }

    /**
     * Crea una cita pendiente de hora para un cliente activo.
     *
     * @param actor Usuario autenticado (barbero/admin)
     * @param dto Datos de cita sin hora
     * @return Reserva creada con estado PENDIENTE_HORA
     */
    @PostMapping("/pending-time")
    @Operation(
        summary = "Crear cita pendiente de hora",
        description = "Permite al barbero programar una cita futura para un cliente activo sin asignar hora"
    )
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ReservaDto> createPendingTime(@AuthenticationPrincipal Usuario actor,
                                                        @Valid @RequestBody CreateCitaPendienteHoraRequestDto dto) {
        log.info("POST /reservations/pending-time");
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.crearCitaPendienteHora(actor, dto));
    }

    /**
     * Lista reservas visibles para el usuario autenticado.
     * Clientes ven sus propias reservas. Barberos ven sus reservas. Admin ve todas.
     * 
     * @param actor Usuario autenticado
     * @param estado Filtro opcional por estado (PENDIENTE, CANCELADA, COMPLETADA, NO_PRESENTADO)
     * @param desde Filtro opcional: fecha/hora más antigua
     * @param hasta Filtro opcional: fecha/hora más reciente
     * @param barberoId Filtro opcional: solo reservas de un barbero específíco
     * @return Lista de reservas que coinciden con los filtros
     */
    @GetMapping
    @Operation(
        summary = "Listar reservas",
        description = "Retorna lista de reservas del usuario con filtros opcionales por estado y rango de fechas"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista de reservas obtenida",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReservaDto.class))),
        @ApiResponse(responseCode = "401", description = "Token no válido")
    })
    public ResponseEntity<List<ReservaDto>> list(
        @AuthenticationPrincipal Usuario actor,
        @RequestParam(required = false) EstadoReserva estado,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
        @RequestParam(name = "barbero_id", required = false) Long barberoId
    ) {
        log.info("GET /reservations");
        return ResponseEntity.ok(reservaService.list(actor, estado, desde, hasta, barberoId));
    }

    /**
     * Obtiene los detalles completos de una reserva específíca.
     * Lógica de acceso: solo el cliente, barbero o admin pueden ver una reserva.
     * 
     * @param actor Usuario autenticado
     * @param id ID de la reserva
     * @return Datos completos de la reserva
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Obtener reserva por ID",
        description = "Retorna detalles completos de una reserva específíca"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reserva obtenida",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReservaDto.class))),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos para ver esta reserva"),
        @ApiResponse(responseCode = "404", description = "Reserva no encontrada")
    })
    public ResponseEntity<ReservaDto> getById(@AuthenticationPrincipal Usuario actor, @PathVariable Long id) {
        log.info("GET /reservations/{}", id);
        return ResponseEntity.ok(reservaService.getById(actor, id));
    }

    /**
     * Actualiza el estado de una reserva.
     * Transiciones permitidas:
     * - PENDIENTE -> COMPLETADA | CANCELADA | NO_PRESENTADO
     * - CANCELADA, COMPLETADA y NO_PRESENTADO son estados finales.
     * 
     * @param actor Usuario autenticado
     * @param id ID de la reserva
     * @param dto Nuevo estado y motivo si aplica
     * @return Reserva con estado actualizado
     */
    @PatchMapping("/{id}/status")
    @Operation(
        summary = "Actualizar estado de reserva",
        description = "Cambia el estado de una reserva con validación de transiciones permitidas"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Transición de estado no permitida"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos para modificar esta reserva"),
        @ApiResponse(responseCode = "404", description = "Reserva no encontrada")
    })
    public ResponseEntity<ReservaDto> updateStatus(@AuthenticationPrincipal Usuario actor,
                                                   @PathVariable Long id,
                                                   @Valid @RequestBody UpdateReservaEstadoRequestDto dto) {
        log.info("PATCH /reservations/{}/status", id);
        return ResponseEntity.ok(reservaService.updateStatus(actor, id, dto));
    }

    /**
     * Asigna hora a una cita pendiente y la convierte en reserva activa normal.
     */
    @PatchMapping("/{id}/assign-time")
    @Operation(
        summary = "Asignar hora a cita pendiente",
        description = "Asigna un tramo libre a una cita con estado PENDIENTE_HORA"
    )
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ReservaDto> assignTime(@AuthenticationPrincipal Usuario actor,
                                                 @PathVariable Long id,
                                                 @Valid @RequestBody AssignHoraReservaRequestDto dto) {
        log.info("PATCH /reservations/{}/assign-time", id);
        return ResponseEntity.ok(reservaService.asignarHoraACita(actor, id, dto));
    }
}
