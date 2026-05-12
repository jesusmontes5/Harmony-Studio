package org.vedruna.barberia.modules.servicios.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.vedruna.barberia.modules.servicios.dto.CreateServicioRequestDto;
import org.vedruna.barberia.modules.servicios.dto.ServicioDto;
import org.vedruna.barberia.modules.servicios.dto.UpdateServicioRequestDto;
import org.vedruna.barberia.modules.servicios.service.ServicioService;
import org.vedruna.barberia.modules.users.entity.RolUsuario;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.shared.dto.ErrorResponseDto;

/**
 * Controlador REST de servicios.
 * Gestiona servicios de barberia (corte, tintura, etc.)
 */
@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Servicios", description = "Endpoints para gestión de servicios de barberia")
public class ServicioController {

    /** Servicio de servicios. */
    private final ServicioService servicioService;

    /**
     * Lista servicios activos para público.
     * Si el usuario es barbero o admin y param includeInactive=true, retorna también servicios inactivos.
     * 
     * @param includeInactive Si true, incluir servicios marcados como inactivos (solo para ADMIN/BARBERO)
     * @param usuario Usuario autenticado (opcional)
     * @return Lista de servicios
     */
    @GetMapping
    @Operation(
        summary = "Listar servicios",
        description = "Retorna lista de servicios de barberia. Los inactivos se muestran solo a admin/barbero."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista de servicios obtenida",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ServicioDto.class)))
    })
    public ResponseEntity<List<ServicioDto>> list(@RequestParam(defaultValue = "false") boolean includeInactive,
                                                   @AuthenticationPrincipal Usuario usuario) {
        boolean canIncludeInactive = includeInactive
            && usuario != null
            && (usuario.getRol() == RolUsuario.ADMIN || usuario.getRol() == RolUsuario.BARBERO);
        log.info("GET /services includeInactive={} effective={}", includeInactive, canIncludeInactive);
        return ResponseEntity.ok(servicioService.list(canIncludeInactive));
    }

    /**
     * Crea un nuevo servicio. Solo barberos y admin.
     * 
     * @param dto Datos del servicio (nombre, descripción, duración, precio)
     * @return Servicio creado
     */
    @PreAuthorize("hasAnyRole('ADMIN','BARBERO')")
    @PostMapping
    @Operation(
        summary = "Crear servicio",
        description = "Crea un nuevo servicio de barberia. Solo accesible para admin y barberos."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Servicio creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos. Solo admin/barbero pueden crear servicios")
    })
    public ResponseEntity<ServicioDto> create(@Valid @RequestBody CreateServicioRequestDto dto) {
        log.info("POST /services");
        return ResponseEntity.status(HttpStatus.CREATED).body(servicioService.create(dto));
    }

    /**
     * Modifica parcialmente un servicio existente.
     * Solo barberos y admin pueden editar.
     * 
     * @param id ID del servicio
     * @param dto Campos a actualizar
     * @return Servicio actualizado
     */
    @PreAuthorize("hasAnyRole('ADMIN','BARBERO')")
    @PatchMapping("/{id}")
    @Operation(
        summary = "Actualizar servicio",
        description = "Modifica campos de un servicio existente. Solo admin/barbero."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Servicio actualizado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos"),
        @ApiResponse(responseCode = "404", description = "Servicio no encontrado")
    })
    public ResponseEntity<ServicioDto> patch(@PathVariable Long id,
                                             @Valid @RequestBody UpdateServicioRequestDto dto) {
        log.info("PATCH /services/{}", id);
        return ResponseEntity.ok(servicioService.patch(id, dto));
    }

    /**
     * Elimina un servicio de forma lógica (soft delete).
     * Marca el servicio como inactivo en lugar de borrarlo.
     * 
     * @param id ID del servicio
     */
    @PreAuthorize("hasAnyRole('ADMIN','BARBERO')")
    @DeleteMapping("/{id}")
    @Operation(
        summary = "Eliminar servicio",
        description = "Marca un servicio como inactivo (soft delete). Solo admin/barbero."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Servicio eliminado (inactivado)"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos"),
        @ApiResponse(responseCode = "404", description = "Servicio no encontrado")
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /services/{}", id);
        servicioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

