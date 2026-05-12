import { cn } from "../../utils/cn";

/**
 * Skeleton - Componente placeholder de carga.
 * Muestra un esqueleto animado mientras se cargan datos.
 * @component
 * @param {Object} props
 * @param {string} props.className - Clases CSS adicionales
 * @returns {React.ReactElement}
 */
export function Skeleton({ className = "" }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-lg bg-gradient-to-r from-neutral via-neutral-border to-neutral border border-neutral-border/50",
        className
      )}
      aria-hidden="true"
      role="status"
    />
  );
}
