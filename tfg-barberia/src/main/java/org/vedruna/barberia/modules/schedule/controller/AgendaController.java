package org.vedruna.barberia.modules.schedule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.vedruna.barberia.modules.schedule.dto.AgendaDiaDto;
import org.vedruna.barberia.modules.schedule.service.AgendaService;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.shared.dto.ErrorResponseDto;

/**
 * Controlador para consulta de agenda diaria de barberos.
 * Proporciona visión completa de las reservas y disponibilidad por día.
 */
@RestController
@RequestMapping("/barbers/{id}/agenda")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Agenda", description = "Endpoints para consultar agenda diaria de barberos")
public class AgendaController {

    /** Servicio de lectura de agenda. */
    private final AgendaService agendaService;

    /**
     * Obtiene la agenda completa de un barbero para un día.
     * Incluye horarios, reservas, bloques y disponibilidad.
     *
     * @param actor Usuario autenticado
     * @param barberoId ID del barbero
     * @param fecha Fecha consultada (formato: yyyy-MM-dd)
     * @return Agenda completa del día del barbero
     */
    @GetMapping
    @Operation(
        summary = "Obtener agenda diaria",
        description = "Retorna la agenda completa de un barbero para una fecha específica, incluyendo reservas y disponibilidad"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Agenda obtenida",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AgendaDiaDto.class))),
        @ApiResponse(responseCode = "400", description = "Fecha inválida",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "404", description = "Barbero no encontrado")
    })
    public ResponseEntity<AgendaDiaDto> getAgendaDia(@AuthenticationPrincipal Usuario actor,
                                                      @PathVariable("id") Long barberoId,
                                                      @RequestParam("fecha")
                                                      @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        log.info("GET /barbers/{}/agenda?fecha={}", barberoId, fecha);
        return ResponseEntity.ok(agendaService.getAgendaDia(actor, barberoId, fecha));
    }
}

