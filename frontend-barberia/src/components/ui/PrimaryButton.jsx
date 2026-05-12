import { cn } from "../../utils/cn";
import { Spinner } from "./Spinner";

/**
 * Boton principal oscuro para acciones importantes de formularios y flujos.
 */
export function PrimaryButton({
  children = "Confirmar reserva",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  fullWidth = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex min-h-14 select-none items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/90 px-xl py-3 text-center text-sm font-semibold leading-none tracking-normal text-white shadow-[0_18px_35px_-22px_rgba(17,24,39,0.9),0_0_14px_0_rgba(201,151,62,0.14)] ring-1 ring-accent/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-22px_rgba(17,24,39,0.95),0_0_24px_0_rgba(201,151,62,0.3)] active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100",
        fullWidth ? "w-full" : "w-full sm:w-auto",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />
      <span className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      <span className="relative inline-flex items-center justify-center gap-sm">
        {loading ? (
          <>
            <Spinner className="h-4 w-4" />
            Cargando...
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}
