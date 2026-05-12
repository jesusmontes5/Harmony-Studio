package org.vedruna.barberia.modules.users.controller;

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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.vedruna.barberia.modules.users.dto.UpdateMyNameRequestDto;
import org.vedruna.barberia.modules.users.dto.UpdateUsuarioRequestDto;
import org.vedruna.barberia.modules.users.dto.UsuarioPublicDto;
import org.vedruna.barberia.modules.users.entity.RolUsuario;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.modules.users.service.UsuarioService;
import org.vedruna.barberia.shared.dto.ErrorResponseDto;

/**
 * Controlador REST administrativo de usuarios.
 * Gestiona listado, filtrado y manipulación de usuarios.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Usuarios", description = "Endpoints para gestión de usuarios, barberos y clientes")
public class UsuarioController {

    /** Servicio de usuarios. */
    private final UsuarioService usuarioService;

    /**
     * Lista usuarios con filtros opcionales por rol, estado activo y búsqueda textual.
     * 
     * @param rol Filtro por rol de usuario (CLIENTE, BARBERO, ADMIN)
     * @param activo Filtro por estado (true=activo, false=bloqueado)
     * @param q Término de búsqueda en nombre o email
     * @return Lista de usuarios públicos que coinciden
     */
    @GetMapping
    @Operation(
        summary = "Listar usuarios",
        description = "Retorna lista de usuarios con filtros opcionales por rol, estado y búsqueda textual"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UsuarioPublicDto.class))),
        @ApiResponse(responseCode = "401", description = "Token no válido")
    })
    public ResponseEntity<List<UsuarioPublicDto>> list(
        @RequestParam(required = false) RolUsuario rol,
        @RequestParam(required = false) Boolean activo,
        @RequestParam(required = false) String q
    ) {
        log.info("GET /users rol={}, activo={}, q={}", rol, activo, q);
        return ResponseEntity.ok(usuarioService.search(rol, activo, q));
    }

    /**
     * Lista todos los barberos activos disponibles para reservas.
     * Solo retorna usuarios con rol BARBERO y estado activo.
     * 
     * @return Lista de barberos activos
     */
    @GetMapping("/barbers")
    @Operation(
        summary = "Listar barberos activos",
        description = "Retorna lista de barberos disponibles para realizar reservas"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista de barberos obtenida",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UsuarioPublicDto.class)))
    })
    public ResponseEntity<List<UsuarioPublicDto>> listBarbers() {
        log.info("GET /users/barbers");
        return ResponseEntity.ok(usuarioService.listBarberos());
    }

    /**
     * Lista clientes con filtros opcionales por estado y búsqueda.
     * Solo accesible para admin y barberos.
     * 
     * @param activo Filtro por estado (true=activo, false=bloqueado)
     * @param q Término de búsqueda
     * @return Lista de clientes
     */
    @GetMapping("/clients")
    @Operation(
        summary = "Listar clientes",
        description = "Retorna lista de clientes con filtros opcionales. Acceso restringido a barberos y admin"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista de clientes obtenida"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos para acceder")
    })
    public ResponseEntity<List<UsuarioPublicDto>> listClients(@RequestParam(required = false) Boolean activo,
                                                               @RequestParam(required = false) String q) {
        log.info("GET /users/clients activo={}, q={}", activo, q);
        return ResponseEntity.ok(usuarioService.listClientes(activo, q));
    }

    /**
     * Bloquea un cliente estableciendo su estado a inactivo.
     * Solo admin puede ejecutar esta acción.
     * 
     * @param actor Usuario admin autenticado
     * @param id ID del cliente a bloquear
     * @return Cliente con estado modificado
     */
    @PatchMapping("/clients/{id}/block")
    @Operation(
        summary = "Bloquear cliente",
        description = "Desactiva una cuenta de cliente. Solo accesible para admin"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Cliente bloqueado exitosamente"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos. Solo admin puede bloquear clientes"),
        @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    })
    public ResponseEntity<UsuarioPublicDto> blockClient(@AuthenticationPrincipal Usuario actor,
                                                         @PathVariable Long id) {
        log.info("PATCH /users/clients/{}/block by userId={}", id, actor.getId());
        return ResponseEntity.ok(usuarioService.blockClient(actor, id));
    }

    /**
     * Desbloquea un cliente estableciendo su estado a activo.
     * Solo admin puede ejecutar esta acción.
     * 
     * @param actor Usuario admin autenticado
     * @param id ID del cliente a desbloquear
     * @return Cliente con estado modificado
     */
    @PatchMapping("/clients/{id}/unblock")
    @Operation(
        summary = "Desbloquear cliente",
        description = "Reactiva una cuenta de cliente bloqueada. Solo accesible para admin"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Cliente desbloqueado exitosamente"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos"),
        @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    })
    public ResponseEntity<UsuarioPublicDto> unblockClient(@AuthenticationPrincipal Usuario actor,
                                                           @PathVariable Long id) {
        log.info("PATCH /users/clients/{}/unblock by userId={}", id, actor.getId());
        return ResponseEntity.ok(usuarioService.unblockClient(actor, id));
    }

    /**
     * Actualiza parcialmente un usuario. Solo admin puede modificar otros usuarios.
     * 
     * @param id ID del usuario a actualizar
     * @param dto Campos a actualizar del usuario
     * @return Usuario actualizado
     */
    @PatchMapping("/{id}")
    @Operation(
        summary = "Actualizar usuario parcialmente",
        description = "Actualiza campos específicos de un usuario. Admin o el usuario mismo"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario actualizado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "401", description = "Token no válido"),
        @ApiResponse(responseCode = "403", description = "Sin permisos para actualizar este usuario"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UsuarioPublicDto> patch(@PathVariable Long id,
                                                  @Valid @RequestBody UpdateUsuarioRequestDto dto) {
        log.info("PATCH /users/{}", id);
        return ResponseEntity.ok(usuarioService.patch(id, dto));
    }

    /**
     * Actualiza el nombre del usuario autenticado.
     * Solo el usuario puede modificar su propio nombre.
     * 
     * @param actor Usuario autenticado
     * @param dto Nuevo nombre
     * @return Usuario con nombre actualizado
     */
    @PatchMapping("/me")
    @Operation(
        summary = "Actualizar mi nombre",
        description = "Permite al usuario autenticado cambiar su nombre"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Nombre actualizado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "401", description = "Token no válido")
    })
    public ResponseEntity<UsuarioPublicDto> updateMyName(@AuthenticationPrincipal Usuario actor,
                                                           @Valid @RequestBody UpdateMyNameRequestDto dto) {
        log.info("PATCH /users/me by userId={}", actor.getId());
        return ResponseEntity.ok(usuarioService.updateMyName(actor, dto));
    }

    /**
     * Elimina la cuenta del usuario autenticado.
     * Esta accion es irreversible y elimina todos los datos asociados.
     * 
     * @param actor Usuario autenticado
     * @return 204 No Content si se elimino correctamente
     */
    @DeleteMapping("/me")
    @Operation(
        summary = "Eliminar mi cuenta",
        description = "Elimina permanentemente la cuenta del usuario autenticado y todos sus datos asociados"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Cuenta eliminada exitosamente"),
        @ApiResponse(responseCode = "401", description = "Token no valido")
    })
    public ResponseEntity<Void> deleteMyAccount(@AuthenticationPrincipal Usuario actor) {
        if (actor == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        log.info("DELETE /users/me by userId={}", actor.getId());
        usuarioService.deleteMyAccount(actor);
        return ResponseEntity.noContent().build();
    }
}
