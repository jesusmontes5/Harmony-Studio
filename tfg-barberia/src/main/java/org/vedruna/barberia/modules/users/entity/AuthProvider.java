package org.vedruna.barberia.modules.users.entity;

/**
 * Proveedor de autenticacion vinculado al usuario.
 */
public enum AuthProvider {
    /** Usuario registrado con email y contrasena local. */
    LOCAL,
    /** Usuario autenticado mediante Google. */
    GOOGLE
}
