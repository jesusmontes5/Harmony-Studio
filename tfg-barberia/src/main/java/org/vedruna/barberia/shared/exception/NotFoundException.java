package org.vedruna.barberia.shared.exception;

/**
 * Excepcion para recursos inexistentes.
 */
public class NotFoundException extends ApiException {

    /**
     * @param code codigo funcional.
     * @param message mensaje detallado.
     */
    public NotFoundException(String code, String message) {
        super(404, code, message);
    }
}
