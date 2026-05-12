package org.vedruna.barberia.modules.schedule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.vedruna.barberia.modules.schedule.dto.HorarioBarberoDto;
import org.vedruna.barberia.modules.schedule.service.HorarioBarberoService;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.shared.dto.ErrorResponseDto;

/**
 * Controlador REST de horarios de barberos.
 * Gestiona la configuración de horarios laborales de cada barbero.
 */
@RestController
@RequestMapping("/barbers/{id}/schedule")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Horarios", description = "Endpoints para gestión de horarios de barberos")
public class HorarioBarberoController {

    /** Servicio de horarios. */
    private final HorarioBarberoService horarioBarberoService;

    /**
     * Obtiene el horario completo de un barbero para una fecha específíca o general.
     * 
     * @param barberoId ID del barbero
     * @param fecha Fecha opcional (ISO format: yyyy-MM-dd). Si se omite, retorna todos los horarios
     * @return Lista de tramos horarios del barbero
     */
    @GetMapping
    @Operation(
        summary = "Obtener horario de barbero",
        description = "Retorna el horario laboral de un barbero. Si se especifica fecha, retorna solo ese día."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Horario obtenido",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = HorarioBarberoDto.class))),
        @ApiResponse(responseCode = "404", description = "Barbero no encontrado")
    })
    public ResponseEntity<List<HorarioBarberoDto>> getSchedule(
        @PathVariable("id") Long barberoId,
        @RequestParam(value = "fecha", required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        log.info("GET /barbers/{}/schedule fecha={}", barberoId, fecha);
        return ResponseEntity.ok(horarioBarberoService.getSchedule(barberoId, fecha));
    }

    /**
     * Reemplaza todos los tramos de horario de un barbero.
     * Operación destructiva: elimina todos los horarios anteriores y los reemplaza con los nuevos.
     * 
     * @param actor Usuario autenticado (debe ser el barbero o admin)
     * @param barberoId ID del barbero
     * @param schedule Lista de nuevos tramos horarios
     * @return Lista actualizada de horarios
     */
    @PutMapping
    @Operation(
        summary = "Reemplazar horario completo",
        description = "Reemplaza todos los horarios de un barbero (destructivo). Solo el barbero mismo o admin."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Horario actualizado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Rango de horarios inválido (hora_inicio >= hora_fin)",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos. Solo el barbero mismo o admin pueden modificar"),
        @ApiResponse(responseCode = "404", description = "Barbero no encontrado")
    })
    public ResponseEntity<List<HorarioBarberoDto>> replaceSchedule(@AuthenticationPrincipal Usuario actor,
                                                                   @PathVariable("id") Long barberoId,
                                                                   @Valid @RequestBody List<HorarioBarberoDto> schedule) {
        log.info("PUT /barbers/{}/schedule", barberoId);
        return ResponseEntity.ok(horarioBarberoService.replaceSchedule(actor, barberoId, schedule));
    }
}
