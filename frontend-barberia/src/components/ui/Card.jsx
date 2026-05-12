import { cn } from "../../utils/cn";

/**
 * Card - Componente tarjeta base para contenedores.
 * Proporciona estructura con titulo, subtítulo, acciones y contenido flexible.
 * @component
 * @param {Object} props
 * @param {string} props.title - Título de la tarjeta
 * @param {string} props.subtitle - Subtítulo descriptivo
 * @param {React.ReactNode} props.children - Contenido principal
 * @param {React.ReactNode} props.actions - Acciones/botones en el encabezado
 * @param {string} props.className - Clases CSS adicionales
 * @returns {React.ReactElement}
 */
export function Card({
  title,
  subtitle,
  actions,
  className = "",
  contentClassName = "",
  children,
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/94 shadow-[0_24px_70px_-44px_rgba(17,24,39,0.46)] ring-1 ring-white/70 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-[0_28px_80px_-46px_rgba(17,24,39,0.56)]",
        className
      )}
    >
      {(title || subtitle || actions) && (
        <header className="flex flex-col gap-sm border-b border-neutral-border/55 bg-white/76 px-lg py-lg sm:px-xl md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-xs">
            {title ? <h2 className="break-words font-display text-xl font-bold leading-tight text-primary sm:text-2xl">{title}</h2> : null}
            {subtitle ? <p className="max-w-2xl text-sm font-medium leading-relaxed text-neutral-text/72 sm:text-[15px]">{subtitle}</p> : null}
          </div>
          {actions ? <div className="shrink-0 md:pt-1">{actions}</div> : null}
        </header>
      )}
      <div className={cn("p-md sm:p-lg lg:p-xl", contentClassName)}>{children}</div>
    </section>
  );
}
