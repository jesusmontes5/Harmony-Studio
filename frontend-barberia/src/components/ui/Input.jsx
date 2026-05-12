import { useState } from "react";
import { cn } from "../../utils/cn";

/**
 * Input - Componente input de texto reutilizable.
 * Campo de entrada con etiqueta, placeholder, y manejo de errores.
 * @component
 * @param {Object} props
 * @param {string} props.id - ID del input
 * @param {string} props.name - Nombre del campo
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.type - Tipo de input (text, email, password, etc)
 * @param {string} props.value - Valor actual
 * @param {string} props.placeholder - Texto placeholder
 * @param {Function} props.onChange - Manejador de cambio
 * @param {string} props.error - Mensaje de error
 * @returns {React.ReactElement}
 */
export function Input({
  label,
  id,
  error = "",
  hint = "",
  className = "",
  inputClassName = "",
  icon = null,
  as = "input",
  children,
  required = false,
  ...props
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const Component = as;
  const messageId = `${id}-message`;
  const isPasswordInput = as === "input" && props.type === "password";
  const hasPasswordValue = Boolean(String(props.value || ""));
  const inputType = isPasswordInput && passwordVisible ? "text" : props.type;
  const hasIcon = Boolean(icon);
  /** Elemento de entrada base que se reutiliza dentro del wrapper normal o password. */
  const inputElement = (
    <Component
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error || hint ? messageId : undefined}
      className={cn(
        "w-full rounded-xl border bg-white/95 px-lg text-base text-primary shadow-[0_14px_30px_-26px_rgba(17,24,39,0.55)] placeholder:text-neutral-text/50 transition-all duration-200 hover:shadow-soft focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:border-neutral-border/60 disabled:bg-neutral/70 disabled:text-neutral-text",
        as === "textarea" ? "min-h-32 py-md leading-relaxed" : "h-14 py-xs",
        hasIcon ? "pl-12" : "",
        isPasswordInput ? "pr-12" : "",
        error
          ? "border-danger/50 bg-danger/5 text-danger focus:border-danger focus:ring-danger/20"
          : "border-neutral-border/80 hover:border-accent/40 focus:border-accent focus:ring-accent/30",
        inputClassName
      )}
      {...props}
      type={inputType}
    >
      {children}
    </Component>
  );

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label htmlFor={id} className="mb-xs block text-sm font-bold text-primary">
          {label}
          {required ? <span className="ml-1 text-danger">*</span> : null}
        </label>
      ) : null}

      {isPasswordInput ? (
        <div className="relative">
          {hasIcon ? (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-neutral-text/65">
              {icon}
            </span>
          ) : null}
          {inputElement}
          {hasPasswordValue ? (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-neutral-text/60 transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={passwordVisible ? "Ocultar contrasena" : "Mostrar contrasena"}
            >
              {passwordVisible ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M9.5 5.7A8.7 8.7 0 0 1 12 5c4.8 0 8 4.5 9 7-.4 1-1.2 2.2-2.3 3.3M6.7 6.8C4.9 8.1 3.6 10.2 3 12c1 2.5 4.2 7 9 7 1.6 0 3-.5 4.2-1.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M3 12s3.2-7 9-7 9 7 9 7-3.2 7-9 7-9-7-9-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              )}
            </button>
          ) : null}
        </div>
      ) : (
        <div className={hasIcon ? "relative" : ""}>
          {hasIcon ? (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-neutral-text/65">
              {icon}
            </span>
          ) : null}
          {inputElement}
        </div>
      )}

      {error ? (
        <p id={messageId} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="field-help">
          {hint}
        </p>
      ) : (
        <p className="field-help" aria-hidden="true" />
      )}
    </div>
  );
}
