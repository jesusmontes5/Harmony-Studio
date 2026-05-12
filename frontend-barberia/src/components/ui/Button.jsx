import { cn } from "../../utils/cn";
import { Spinner } from "./Spinner";

const variantStyles = {
  primary:
    "border border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-[0_18px_35px_-22px_rgba(17,24,39,0.9),0_0_14px_0_rgba(201,151,62,0.14)] ring-1 ring-accent/15 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-22px_rgba(17,24,39,0.95),0_0_24px_0_rgba(201,151,62,0.3)] active:translate-y-0 active:scale-[0.98]",
  secondary:
    "border border-neutral-border/80 bg-white/90 text-primary shadow-[0_4px_12px_rgba(17,24,39,0.08),0_0_10px_0_rgba(201,151,62,0.07)] hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white hover:shadow-[0_10px_30px_-12px_rgba(17,24,39,0.15),0_0_14px_0_rgba(201,151,62,0.12)] active:translate-y-0 active:scale-[0.97]",
  ghost: "text-neutral-text hover:bg-accent/8 hover:text-primary hover:shadow-[0_0_6px_0_rgba(201,151,62,0.04)] active:bg-neutral-border active:scale-[0.98]",
  danger:
    "border border-danger/25 bg-white/86 text-danger shadow-[0_8px_24px_-20px_rgba(220,38,38,0.26),0_4px_18px_-16px_rgba(17,24,39,0.16)] ring-1 ring-danger/8 hover:-translate-y-0.5 hover:border-danger/40 hover:bg-danger/5 hover:shadow-[0_14px_30px_-22px_rgba(220,38,38,0.36),0_8px_22px_-20px_rgba(17,24,39,0.18)] active:translate-y-0 active:scale-[0.98]",
};

const sizeStyles = {
  sm: "min-h-12 px-md py-2.5 text-xs sm:min-h-10 sm:py-2",
  md: "min-h-14 px-lg py-3 text-sm sm:min-h-12 sm:py-2.5",
  lg: "min-h-16 px-xl py-3.5 text-base sm:min-h-14 sm:py-3",
};

/**
 * Button - Componente botón reutilizable con variantes.
 * Soporta diferentes tamaños, variantes y estados de carga/deshabilitado.
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {string} props.variant - Variante del botón (primary, secondary, danger)
 * @param {string} props.size - Tamaño (sm, md, lg)
 * @param {boolean} props.loading - Si muestra spinner de carga
 * @param {boolean} props.disabled - Si está deshabilitado
 * @param {string} props.className - Clases CSS adicionales
 * @param {Function} props.onClick - Manejador de click
 * @returns {React.ReactElement}
 */
export function Button({
  children,
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center gap-sm rounded-xl text-center font-semibold leading-none tracking-normal transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100",
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        fullWidth ? "w-full" : "",
        className
      )}
    >
      {loading ? (
        <>
          <Spinner className="h-4 w-4" />
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  );
}
