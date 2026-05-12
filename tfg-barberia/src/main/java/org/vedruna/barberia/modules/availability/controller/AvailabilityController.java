package org.vedruna.barberia.modules.availability.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.vedruna.barberia.modules.availability.dto.AvailabilityResponseDto;
import org.vedruna.barberia.modules.availability.service.AvailabilityService;
import org.vedruna.barberia.shared.dto.ErrorResponseDto;

/**
 * Controlador para consultar disponibilidad diaria.
 * Calcula los slots disponibles para reservas considerando horarios, servicios y reservas existentes.
 */
@RestController
@RequestMapping("/availability")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Disponibilidad", description = "Endpoints para consultar disponibilidad de barberos")
public class AvailabilityController {

    /** Servicio de calculo de disponibilidad. */
    private final AvailabilityService availabilityService;

    /**
     * Calcula los slots de disponibilidad de un barbero para una fecha y servicios.
     * Retorna slots cada 30 minutos considerando:
     * - Horario laboral del barbero
     * - Reservas existentes
     * - Duración de los servicios solicitados
     * 
     * @param barberoId ID del barbero
     * @param fecha Fecha consultada (formato: yyyy-MM-dd)
     * @param servicios IDs de servicios opcionales para calcular duración total
     * @return Horas disponibles con slots de 30 minutos
     */
    @GetMapping
    @Operation(
        summary = "Calcular disponibilidad",
        description = "Retorna slots disponibles de 30 minutos para un barbero en una fecha determinada"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Disponibilidad calculada",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AvailabilityResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Parámetros inválidos (fecha pasada, etc.)",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "Barbero no encontrado")
    })
    public ResponseEntity<AvailabilityResponseDto> getAvailability(
        @RequestParam("barbero_id") Long barberoId,
        @RequestParam("fecha") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
        @RequestParam(value = "servicios", required = false) List<Long> servicios
    ) {
        log.info("GET /availability?barbero_id={}&fecha={}", barberoId, fecha);
        return ResponseEntity.ok(availabilityService.getAvailability(barberoId, fecha, servicios));
    }
}
