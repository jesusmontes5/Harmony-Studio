package org.vedruna.barberia.shared.exception;

/**
 * Excepcion para errores de autenticacion.
 */
public class UnauthorizedException extends ApiException {

    /**
     * @param code codigo funcional.
     * @param message mensaje detallado.
     */
    public UnauthorizedException(String code, String message) {
        super(401, code, message);
    }
}
