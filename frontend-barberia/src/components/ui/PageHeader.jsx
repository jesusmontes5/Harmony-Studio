/**
 * PageHeader - Encabezado de página.
 * Muestra título, subtítulo y acciones en el encabezado de una página.
 * @component
 * @param {Object} props
 * @param {string} props.title - Título principal
 * @param {string} props.subtitle - Subtítulo descriptivo
 * @param {React.ReactNode} props.actions - Botones/acciones adicionales
 * @returns {React.ReactElement}
 */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="page-animate relative mb-lg overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/82 px-7 py-7 shadow-[0_22px_65px_-42px_rgba(17,24,39,0.45)] backdrop-blur-xl sm:mb-xl sm:px-10 sm:py-10 animate-fade-up">
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-accent/10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_100%_0%,rgba(201,151,62,0.12),transparent_55%)]" />
      <div className="relative flex flex-col gap-md lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 flex-1 space-y-sm">
        <div>
          <h1 className="break-words font-display text-4xl font-bold leading-tight text-primary sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <div className="mt-5 h-1 w-16 rounded-full bg-accent" />
        </div>
        {subtitle ? (
          <p className="mt-5 max-w-3xl text-sm font-medium leading-relaxed text-neutral-text/80 sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="shrink-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
          {actions}
        </div>
      ) : null}
      </div>
    </header>
  );
}
