import { cn } from "../../utils/cn";

/**
 * Reveal - Componente para revelar contenido con animación.
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a revelar
 * @param {string} props.className - Clases CSS adicionales
 * @param {number} props.delay - Retraso de animación (ms)
 * @param {string} props.direction - Dirección de animación (up, down, left, right)
 * @returns {React.ReactElement}
 */
export function Reveal({ children, className = "", delay = 0, direction = "up" }) {
  const directionClasses = {
    up: "animate-fade-up",
    down: "animate-slide-in-down",
    left: "animate-slide-in-right",
    right: "animate-slide-in-left",
  };

  return (
    <div
      className={cn(
        "transform-gpu",
        directionClasses[direction] || directionClasses.up,
        className
      )}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
