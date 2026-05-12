package org.vedruna.barberia.shared.exception;

/**
 * Excepcion para operaciones no autorizadas por regla de rol o propiedad de recurso.
 */
public class ForbiddenException extends ApiException {

    /**
     * @param code codigo funcional.
     * @param message mensaje detallado.
     */
    public ForbiddenException(String code, String message) {
        super(403, code, message);
    }
}
