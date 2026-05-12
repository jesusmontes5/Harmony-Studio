import { PrimaryCTAButton } from "../ui/PrimaryCTAButton";

/**
 * HeroSection - Seccion hero principal de la pagina de inicio.
 * Muestra imagen de fondo, titulo y call-to-action.
 * @component
 * @returns {React.ReactElement}
 */
export function HeroSection({ cta, pedroRating }) {
  const averageLabel = pedroRating.loading
    ? "..."
    : pedroRating.error
      ? "--"
      : `${pedroRating.average.toFixed(2)}/5`;

  const detailLabel = pedroRating.loading
    ? "Cargando valoracion..."
    : pedroRating.error
      ? pedroRating.error
      : `Basado en ${pedroRating.totalReviews} resenas de clientes para ${pedroRating.barberName}.`;

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 p-8 shadow-[0_34px_90px_-56px_rgba(17,24,39,0.5)] backdrop-blur-xl transition-all duration-300 sm:p-12 lg:p-14">
      <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-accent/12" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_100%_0%,rgba(201,151,62,0.12),transparent_56%)]" />
      <div className="relative grid gap-8 sm:gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-14">
        <div className="space-y-6 sm:space-y-7 lg:space-y-8 animate-fade-up">
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.06] text-primary sm:text-[3.45rem] sm:leading-[1.05] lg:text-[4.35rem] lg:leading-[1.04]">
            Un corte impecable, una experiencia inolvidable
          </h1>

          <p className="max-w-xl text-base font-medium leading-8 text-neutral-text/88 sm:text-lg">
            Reserva tu cita en segundos. Descubre nuestros trabajos y toda la informacion que necesitas en un solo lugar moderno y rapido.
          </p>

          <div className="flex flex-wrap gap-3 pt-3">
            <PrimaryCTAButton to={cta.to} className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              {cta.primary}
            </PrimaryCTAButton>
          </div>
        </div>

        <div className="relative animate-scale-in" style={{ animationDelay: "400ms" }}>
          <article className="relative rounded-[1.5rem] border border-white/80 bg-white/82 p-7 shadow-[0_28px_72px_-50px_rgba(17,24,39,0.56)] ring-1 ring-white/70 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_34px_84px_-54px_rgba(17,24,39,0.62)] sm:p-9">
            <div className="space-y-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-text/60">Valoracion promedio</p>
                <p className="mt-3 font-display text-5xl font-bold leading-none text-primary sm:text-6xl">
                  {averageLabel}
                </p>
              </div>

              <div className="h-px bg-gradient-to-r from-accent/20 to-transparent" />

              <p className="text-sm leading-relaxed text-neutral-text/80">
                {detailLabel}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
