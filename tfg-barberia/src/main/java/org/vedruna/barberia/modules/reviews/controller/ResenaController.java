package org.vedruna.barberia.modules.reviews.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.vedruna.barberia.modules.reviews.dto.BarberoReviewsResponseDto;
import org.vedruna.barberia.modules.reviews.dto.CreateResenaRequestDto;
import org.vedruna.barberia.modules.reviews.dto.ResenaDto;
import org.vedruna.barberia.modules.reviews.service.ResenaService;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.shared.dto.ErrorResponseDto;

/**
 * Controlador REST de reseñas.
 * Gestiona las reseñas y calificaciones de barberos por clientes.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reseñas", description = "Endpoints para gestión de reseñas y valoraciones de barberos")
public class ResenaController {

    /** Servicio de reseñas. */
    private final ResenaService resenaService;

    /**
     * Crea una reseña de un barbero después de una reserva completada.
     * Solo clientes autenticados pueden crear reseñas.
     * Una reserva solo puede tener una reseña.
     * 
     * @param cliente Usuario cliente autenticado
     * @param dto Datos de la reseña (ID reserva, puntuación 1-5, comentario)
     * @return Reseña creada
     */
    @PostMapping("/reviews")
    @PreAuthorize("hasRole('CLIENTE')")
    @Operation(
        summary = "Crear reseña",
        description = "Crea una reseña de un barbero. Solo clientes autenticados. Una reseña por reserva."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Reseña creada exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResenaDto.class))),
        @ApiResponse(responseCode = "400", description = "Datos inválidos. Puntuación debe estar entre 1 y 5",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos. Solo clientes pueden crear reseñas"),
        @ApiResponse(responseCode = "409", description = "La reserva ya tiene una reseña")
    })
    public ResponseEntity<ResenaDto> create(@AuthenticationPrincipal Usuario cliente,
                                             @Valid @RequestBody CreateResenaRequestDto dto) {
        log.info("POST /reviews");
        return ResponseEntity.status(HttpStatus.CREATED).body(resenaService.create(cliente, dto));
    }

    /**
     * Lista todas las reseñas públicas de un barbero.
     * Accesible sin autenticación.
     * 
     * @param barberoId ID del barbero
     * @return Reseñas del barbero y estadísticas agregadas
     */
    @GetMapping("/barbers/{id}/reviews")
    @Operation(
        summary = "Listar reseñas de barbero",
        description = "Retorna todas las reseñas públicas de un barbero con estadísticas agregadas (promedio, total, etc.)"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reseñas y estadísticas obtenidas",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = BarberoReviewsResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "Barbero no encontrado")
    })
    public ResponseEntity<BarberoReviewsResponseDto> listByBarbero(@PathVariable("id") Long barberoId) {
        log.info("GET /barbers/{}/reviews", barberoId);
        return ResponseEntity.ok(resenaService.listByBarbero(barberoId));
    }
}
