package org.vedruna.barberia.shared.exception;

/**
 * Excepcion base de dominio para la API.
 *
 * <p>Esta jerarquia permite evitar excepciones estandar de Java en la capa de servicio y
 * centralizar el mapeo HTTP en el {@code @RestControllerAdvice}.</p>
 */
public abstract class ApiException extends RuntimeException {

    /** Codigo HTTP asociado a la excepcion. */
    private final int statusCode;

    /** Codigo funcional interno para frontends y trazabilidad. */
    private final String code;

    /**
     * Constructor principal.
     *
     * @param statusCode codigo HTTP.
     * @param code codigo funcional.
     * @param message mensaje de negocio.
     */
    protected ApiException(int statusCode, String code, String message) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }

    /**
     * @return codigo HTTP de la excepcion.
     */
    public int getStatusCode() {
        return statusCode;
    }

    /**
     * @return codigo funcional de la excepcion.
     */
    public String getCode() {
        return code;
    }
}
