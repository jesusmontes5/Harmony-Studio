import { Card } from "../ui/Card";

/**
 * AboutSection - Seccion "Acerca de" en la pagina de inicio.
 * Describe informacion de la barberia.
 * @component
 * @returns {React.ReactElement}
 */
export function AboutSection() {
  return (
    <section aria-labelledby="sobre-mi-title" className="animate-fade-up">
      <Card
        title="Sobre mi"
        subtitle="Experiencia y trato cercano para cada cliente"
        className="h-full overflow-hidden"
      >
        <div className="grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-center">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/80 shadow-[0_18px_45px_-34px_rgba(17,24,39,0.55)]">
            <img
              src="https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1200&q=80"
              alt="Barbero trabajando en la barberia"
              className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-72"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/35 to-transparent" />
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-display text-2xl font-bold text-primary">
                Profesionalidad con cercania
              </h3>
              <div className="space-y-3 text-base leading-relaxed text-neutral-text/90">
                <p>
                  Soy barbero profesional con mas de 10 anos de experiencia. Me especializo en cortes modernos, degradados precisos y arreglo de barba artesanal.
                </p>
                <p>
                  Mi objetivo es que cada cliente salga con un look impecable y una experiencia memorable en cada visita.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-md py-sm text-sm font-semibold text-accent shadow-soft">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" />
                </svg>
                10+ anos en barberia
              </span>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
