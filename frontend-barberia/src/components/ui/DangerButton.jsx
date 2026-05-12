import { cn } from "../../utils/cn";
import { Spinner } from "./Spinner";

/**
 * Icono de papelera usado en acciones destructivas.
 */
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

/**
 * Boton reutilizable para acciones peligrosas como eliminar o borrar datos.
 */
export function DangerButton({
  children = "Eliminar cuenta",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  fullWidth = false,
  className = "",
  icon = <TrashIcon />,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex min-h-12 select-none items-center justify-center overflow-hidden rounded-2xl border border-danger/25 bg-white/86 px-lg py-2.5 text-center text-sm font-semibold leading-none tracking-normal text-danger shadow-[0_8px_24px_-20px_rgba(220,38,38,0.26),0_4px_18px_-16px_rgba(17,24,39,0.16)] ring-1 ring-danger/8 transition-all duration-200 hover:-translate-y-0.5 hover:border-danger/40 hover:bg-danger/5 hover:text-danger hover:shadow-[0_14px_30px_-22px_rgba(220,38,38,0.36),0_8px_22px_-20px_rgba(17,24,39,0.18)] active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100",
        fullWidth ? "w-full" : "w-full sm:w-auto",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/18 to-transparent" />
      <span className="relative inline-flex items-center justify-center gap-sm">
        {loading ? (
          <>
            <Spinner className="h-4 w-4" />
            Cargando...
          </>
        ) : (
          <>
            {icon ? <span>{icon}</span> : null}
            {children}
          </>
        )}
      </span>
    </button>
  );
}
