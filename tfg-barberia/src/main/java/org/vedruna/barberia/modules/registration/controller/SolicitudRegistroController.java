package org.vedruna.barberia.modules.registration.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.vedruna.barberia.modules.registration.dto.ApproveSolicitudRequestDto;
import org.vedruna.barberia.modules.registration.dto.RejectSolicitudRequestDto;
import org.vedruna.barberia.modules.registration.dto.SolicitudRegistroDto;
import org.vedruna.barberia.modules.registration.entity.EstadoSolicitudRegistro;
import org.vedruna.barberia.modules.registration.service.SolicitudRegistroService;
import org.vedruna.barberia.modules.users.entity.RolUsuario;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.shared.dto.ErrorResponseDto;

/**
 * Controlador para revisión de solicitudes de registro.
 * Gestiona el flujo de aprobación/rechazo de nuevos usuarios aspirantes a barberos.
 */
@RestController
@RequestMapping("/registration-requests")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Solicitudes de Registro", description = "Endpoints para gestión de solicitudes de registro de barberos")
public class SolicitudRegistroController {

    /** Servicio de solicitudes. */
    private final SolicitudRegistroService solicitudRegistroService;

    /**
     * Lista solicitudes de registro con filtro opcional por estado.
     * Solo admin puede verlas. El qué role se le asignará está determinado por admin al aprobar.
     * 
     * @param actor Usuario admin autenticado
     * @param estado Filtro opcional por estado (PENDIENTE, APROBADA, RECHAZADA)
     * @return Lista de solicitudes
     */
    @GetMapping
    @Operation(
        summary = "Listar solicitudes de registro",
        description = "Retorna lista de solicitudes pendientes, aprobadas o rechazadas. Solo admin."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista de solicitudes obtenida"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos. Solo admin puede ver solicitudes")
    })
    public ResponseEntity<List<SolicitudRegistroDto>> list(@AuthenticationPrincipal Usuario actor,
                                                            @RequestParam(required = false) EstadoSolicitudRegistro estado) {
        log.info("GET /registration-requests estado={} by userId={}", estado, actor.getId());
        return ResponseEntity.ok(solicitudRegistroService.list(actor, estado));
    }

    /**
     * Aprueba una solicitud pendiente y crea la cuenta de usuario.
     * Solo admin puede ejecutar. Asigna rol BARBERO por defecto o el especificado.
     * 
     * @param actor Usuario admin autenticado
     * @param id ID de la solicitud
     * @param dto Rol opcional a asignar (default BARBERO)
     * @return Solicitud actualizada con estado APROBADA
     */
    @PatchMapping("/{id}/approve")
    @Operation(
        summary = "Aprobar solicitud de registro",
        description = "Aprueba una solicitud pendiente y crea la cuenta del usuario. Solo admin."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Solicitud aprobada y usuario creado"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos"),
        @ApiResponse(responseCode = "404", description = "Solicitud no encontrada"),
        @ApiResponse(responseCode = "409", description = "Email ya registrado")
    })
    public ResponseEntity<SolicitudRegistroDto> approve(@AuthenticationPrincipal Usuario actor,
                                                         @PathVariable Long id,
                                                         @RequestBody(required = false) ApproveSolicitudRequestDto dto) {
        log.info("PATCH /registration-requests/{}/approve by userId={}", id, actor.getId());
        RolUsuario rol = dto == null ? null : dto.getRol();
        return ResponseEntity.ok(solicitudRegistroService.approve(actor, id, rol));
    }

    /**
     * Rechaza una solicitud pendiente con motivo obligatorio.
     * La solicitud no se registra como usuario.
     * 
     * @param actor Usuario admin autenticado
     * @param id ID de la solicitud
     * @param dto Motivo del rechazo (obligatorio)
     * @return Solicitud actualizada con estado RECHAZADA
     */
    @PatchMapping("/{id}/reject")
    @Operation(
        summary = "Rechazar solicitud de registro",
        description = "Rechaza una solicitud pendiente con motivo. Solo admin. No crea usuario."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Solicitud rechazada"),
        @ApiResponse(responseCode = "400", description = "Motivo de rechazo requerido"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos"),
        @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
    })
    public ResponseEntity<SolicitudRegistroDto> reject(@AuthenticationPrincipal Usuario actor,
                                                        @PathVariable Long id,
                                                        @Valid @RequestBody RejectSolicitudRequestDto dto) {
        log.info("PATCH /registration-requests/{}/reject by userId={}", id, actor.getId());
        return ResponseEntity.ok(solicitudRegistroService.reject(actor, id, dto.getMotivo()));
    }
}
