import { Button } from "./Button";

/**
 * EmptyState - Componente para mostrar estado vacío.
 * Muestra icono, título, descripción y acción opcional.
 * @component
 * @param {Object} props
 * @param {string} props.title - Título del estado vacío
 * @param {string} props.description - Descripción detallada
 * @param {string} props.actionLabel - Etiqueta del botón de acción
 * @param {Function} props.onAction - Callback de la acción
 * @param {string} props.icon - Icono opcional a mostrar
 * @returns {React.ReactElement}
 */
export function EmptyState({ title, description, actionLabel, onAction, icon = "" }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-accent/20 bg-gradient-to-br from-white via-white to-accent/5 p-xl text-center shadow-[0_18px_45px_-36px_rgba(17,24,39,0.45)] transition-all duration-200 animate-fade-up">
      {icon ? (
        <div className="mb-lg flex justify-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/80 bg-white text-3xl shadow-soft">{icon}</span>
        </div>
      ) : null}
      <h3 className="font-display text-2xl font-bold leading-tight text-primary">{title}</h3>
      <p className="mx-auto mt-md max-w-sm text-base leading-relaxed text-neutral-text/70">{description}</p>
      {actionLabel && onAction ? (
        <div className="mt-lg">
          <Button variant="primary" size="md" onClick={onAction} className="animate-fade-up" style={{ animationDelay: "100ms" }}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
