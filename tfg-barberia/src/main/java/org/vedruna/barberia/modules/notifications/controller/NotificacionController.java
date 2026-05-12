package org.vedruna.barberia.modules.notifications.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.vedruna.barberia.modules.notifications.dto.NotificacionDto;
import org.vedruna.barberia.modules.notifications.dto.ProcessPendingResultDto;
import org.vedruna.barberia.modules.notifications.service.NotificacionService;
import org.vedruna.barberia.modules.users.entity.Usuario;

/**
 * Controlador REST de notificaciones.
 * Gestiona notificaciones de reservas, recordatorios y eventos del sistema.
 */
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notificaciones", description = "Endpoints para gestión de notificaciones")
public class NotificacionController {

    /** Servicio de notificaciones. */
    private final NotificacionService notificacionService;

    /**
     * Obtiene las notificaciones del usuario autenticado.
     * Solo muestra las notificaciones de ese usuario.
     * 
     * @param usuario Usuario autenticado
     * @return Lista de notificaciones del usuario
     */
    @GetMapping
    @Operation(
        summary = "Listar mis notificaciones",
        description = "Retorna todas las notificaciones del usuario autenticado"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Notificaciones obtenidas",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = NotificacionDto.class))),
        @ApiResponse(responseCode = "401", description = "Token no válido")
    })
    public ResponseEntity<List<NotificacionDto>> listMine(@AuthenticationPrincipal Usuario usuario) {
        log.info("GET /notifications userId={}", usuario.getId());
        return ResponseEntity.ok(notificacionService.listMine(usuario));
    }

    /**
     * Procesa todas las notificaciones pendientes vencidas.
     * Intenta enviar notificaciones cuya fecha_programada <= now().
     * Solo admin puede ejecutar esta tarea.
     * 
     * @return Cantidad de notificaciones procesadas
     */
    @PostMapping("/process-pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Procesar notificaciones pendientes",
        description = "Envía todas las notificaciones cuya fecha ha llegado. Solo admin. Tarea de administración."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Notificaciones procesadas",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProcessPendingResultDto.class))),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos. Solo admin")
    })
    public ResponseEntity<ProcessPendingResultDto> processPending() {
        log.info("POST /notifications/process-pending");
        int processed = notificacionService.processPending();
        return ResponseEntity.ok(new ProcessPendingResultDto(processed));
    }
}
