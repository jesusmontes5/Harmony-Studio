import { cn } from "../../utils/cn";

const toneConfig = {
  info: {
    border: "border-accent/30",
    bg: "bg-gradient-to-r from-accent/5 to-accent/10",
    textColor: "text-accent",
    textLabel: "text-neutral-text",
    shadow: "shadow-soft"
  },
  success: {
    border: "border-success/30",
    bg: "bg-gradient-to-r from-success/5 to-success/10",
    textColor: "text-success",
    textLabel: "text-neutral-text",
    shadow: "shadow-soft"
  },
  warning: {
    border: "border-accent/50",
    bg: "bg-gradient-to-r from-accent/15 to-accent/25",
    textColor: "text-accent",
    textLabel: "text-neutral-text",
    shadow: "shadow-soft"
  },
  error: {
    border: "border-danger/30",
    bg: "bg-gradient-to-r from-danger/5 to-danger/10",
    textColor: "text-danger",
    textLabel: "text-neutral-text",
    shadow: "shadow-soft"
  },
};

/**
 * Selecciona el icono visual asociado al tono del aviso.
 */
export function AlertIcon({ tone }) {
  if (tone === "success") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="m6 12 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (tone === "error") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="m8 8 8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (tone === "warning") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10.4 4.9 3.8 16.6A1.6 1.6 0 0 0 5.2 19h13.6a1.6 1.6 0 0 0 1.4-2.4L13.6 4.9a1.8 1.8 0 0 0-3.2 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M12 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

/**
 * Alert - Componente de alerta informativa.
 * Muestra mensajes de info, warning, success o error.
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del mensaje
 * @param {string} props.tone - Tipo de alerta (info, warning, success, danger)
 * @param {string} props.className - Clases CSS adicionales
 * @returns {React.ReactElement}
 */
export function Alert({ children, tone = "info", className = "", onClose }) {
  const config = toneConfig[tone] || toneConfig.info;
  const closeLabel = tone === "error" ? "Cerrar error" : "Cerrar mensaje";

  return (
    <div
      role="status"
      className={cn(
        "rounded-xl border px-lg py-md text-sm leading-relaxed transition-all duration-300",
        config.border,
        config.bg,
        config.shadow,
        "animate-fade-up",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/70 ${config.textColor} shadow-soft`}>
          <AlertIcon tone={tone} />
        </span>
        <div className={cn("min-w-0 flex-1", config.textLabel)}>{children}</div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-primary/45 transition-all duration-200 hover:bg-white/80 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="m8 8 8 8M16 8l-8 8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
