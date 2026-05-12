import { cn } from "../../utils/cn";

const toneConfig = {
  neutral: {
    border: "border-neutral-border/50",
    bg: "bg-neutral/50",
    text: "text-neutral-text font-semibold",
  },
  primary: {
    border: "border-primary/30",
    bg: "bg-primary/10",
    text: "text-primary font-semibold",
  },
  accent: {
    border: "border-accent/30",
    bg: "bg-accent/10",
    text: "text-accent font-semibold",
  },
  success: {
    border: "border-success/30",
    bg: "bg-success/10",
    text: "text-success font-semibold",
  },
  warning: {
    border: "border-accent/40",
    bg: "bg-accent/15",
    text: "text-accent font-semibold",
  },
  danger: {
    border: "border-danger/30",
    bg: "bg-danger/10",
    text: "text-danger font-semibold",
  },
};

/**
 * Badge - Componente etiqueta/badge.
 * Muestra etiquetas con diferentes colores según su tono.
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido de la etiqueta
 * @param {string} props.tone - Color/tono (neutral, success, warning, danger)
 * @param {string} props.className - Clases CSS adicionales
 * @param {React.ReactNode} props.icon - Icono opcional
 * @returns {React.ReactElement}
 */
export function Badge({ children, tone = "neutral", className = "", icon = null }) {
  const config = toneConfig[tone] || toneConfig.neutral;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-sm rounded-full border px-md py-xs text-xs font-bold leading-none transition-all duration-250",
        config.border,
        config.bg,
        config.text,
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
