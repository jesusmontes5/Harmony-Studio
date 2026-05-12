import { cn } from "../../utils/cn";

/**
 * Spinner - Componente de carga/spinner.
 * Muestra indicador animado de carga.
 * @component
 * @param {Object} props
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.size - Tamaño (sm, md, lg)
 * @returns {React.ReactElement}
 */
export function Spinner({ className = "", size = "md" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-3",
  };

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block animate-spin rounded-full border-current/20 border-t-current",
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    />
  );
}
