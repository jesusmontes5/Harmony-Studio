package org.vedruna.barberia.modules.tablon.controller;

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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.vedruna.barberia.modules.tablon.dto.CreateTablonMensajeRequestDto;
import org.vedruna.barberia.modules.tablon.dto.TablonMensajeDto;
import org.vedruna.barberia.modules.tablon.dto.UpdateTablonMensajeRequestDto;
import org.vedruna.barberia.modules.tablon.service.TablonMensajeService;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.shared.dto.ErrorResponseDto;

/**
 * Controlador REST del talón de información.
 * Permite publicar anuncios y mensajes informativos de interés general para la barberia.
 */
@RestController
@RequestMapping("/board/messages")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Talón de Información", description = "Endpoints para gestión de anuncios e información general")
public class TablonMensajeController {

    /** Servicio de tablon. */
    private final TablonMensajeService tablonMensajeService;

    /**
     * Lista todos los mensajes activos del talón.
     * Accesible sin autenticación.
     * 
     * @return Lista de mensajes activos
     */
    @GetMapping
    @Operation(
        summary = "Listar mensajes del talón",
        description = "Retorna todos los mensajes informativos activos del talón de la barberia"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista de mensajes obtenida",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = TablonMensajeDto.class)))
    })
    public ResponseEntity<List<TablonMensajeDto>> list() {
        return ResponseEntity.ok(tablonMensajeService.listActive());
    }

    /**
     * Crea un nuevo mensaje en el talón.
     * Solo barberos y admin pueden publicar.
     * 
     * @param dto Título (máx 140 cars) y mensaje (máx 2000 cars)
     * @param actor Barbero/admin que publica
     * @return Mensaje creado
     */
    @PreAuthorize("hasAnyRole('ADMIN','BARBERO')")
    @PostMapping
    @Operation(
        summary = "Crear mensaje en el talón",
        description = "Publica un nuevo anuncio o mensaje informativo. Solo barbero/admin."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Mensaje creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos. Solo barbero/admin pueden crear")
    })
    public ResponseEntity<TablonMensajeDto> create(@Valid @RequestBody CreateTablonMensajeRequestDto dto,
                                                    @AuthenticationPrincipal Usuario actor) {
        log.info("POST /board/messages actorId={}", actor.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(tablonMensajeService.create(dto, actor));
    }

    /**
     * Edita un mensaje existente del talón.
     * Solo el autor o admin pueden edit ar.
     * 
     * @param id ID del mensaje
     * @param dto Campos a actualizar (título, mensaje)
     * @param actor Usuario que edita
     * @return Mensaje actualizado
     */
    @PreAuthorize("hasAnyRole('ADMIN','BARBERO')")
    @PatchMapping("/{id}")
    @Operation(
        summary = "Actualizar mensaje del talón",
        description = "Edita un mensaje existente. Solo el autor o admin."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Mensaje actualizado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos"),
        @ApiResponse(responseCode = "404", description = "Mensaje no encontrado")
    })
    public ResponseEntity<TablonMensajeDto> update(@PathVariable Long id,
                                                    @Valid @RequestBody UpdateTablonMensajeRequestDto dto,
                                                    @AuthenticationPrincipal Usuario actor) {
        log.info("PATCH /board/messages/{} actorId={}", id, actor.getId());
        return ResponseEntity.ok(tablonMensajeService.update(id, dto, actor));
    }

    /**
     * Elimina un mensaje del talón de forma lógica (soft delete).
     * Solo el autor o admin pueden eliminar.
     * 
     * @param id ID del mensaje
     * @param actor Usuario que elimina
     */
    @PreAuthorize("hasAnyRole('ADMIN','BARBERO')")
    @DeleteMapping("/{id}")
    @Operation(
        summary = "Eliminar mensaje del talón",
        description = "Marca un mensaje como inactivo (soft delete). Solo el autor o admin."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Mensaje eliminado"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos"),
        @ApiResponse(responseCode = "404", description = "Mensaje no encontrado")
    })
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal Usuario actor) {
        log.info("DELETE /board/messages/{} actorId={}", id, actor.getId());
        tablonMensajeService.delete(id, actor);
        return ResponseEntity.noContent().build();
    }
}
