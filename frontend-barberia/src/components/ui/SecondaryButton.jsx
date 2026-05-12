import { cn } from "../../utils/cn";
import { Spinner } from "./Spinner";

/**
 * Icono lineal para acciones de cierre de sesion.
 */
function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

/**
 * Boton secundario oscuro para acciones relevantes pero no principales.
 */
export function SecondaryButton({
  children = "Cerrar sesion",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  fullWidth = false,
  className = "",
  icon = <LogoutIcon />,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex min-h-12 select-none items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/90 px-lg py-2.5 text-center text-sm font-semibold leading-none tracking-normal text-white shadow-[0_12px_28px_-20px_rgba(17,24,39,0.82),0_0_10px_0_rgba(201,151,62,0.1)] ring-1 ring-accent/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-22px_rgba(17,24,39,0.9),0_0_16px_0_rgba(201,151,62,0.2)] active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100",
        fullWidth ? "w-full" : "w-full sm:w-auto",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-accent/22 to-transparent" />
      <span className="relative inline-flex items-center justify-center gap-sm">
        {loading ? (
          <>
            <Spinner className="h-4 w-4" />
            Cargando...
          </>
        ) : (
          <>
            {icon ? <span className="text-accent/78">{icon}</span> : null}
            {children}
          </>
        )}
      </span>
    </button>
  );
}
