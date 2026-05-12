import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

/**
 * LocationSection - Sección de ubicación.
 * Muestra dirección y mapa de la barbería.
 * @component
 * @returns {React.ReactElement}
 */
export function LocationSection() {
  return (
    <section id="ubicacion" aria-labelledby="ubicacion-title" className="animate-fade-up">
      <Card
        title="Ubicación"
        subtitle="Encuéntranos fácilmente en el corazón de Dos Hermanas."
        className="h-full"
      >
        <div className="space-y-6">
          <div className="group relative overflow-hidden rounded-lg border border-neutral-border/70 shadow-elegant transition-all duration-300 hover:shadow-dramatic">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
              background: "radial-gradient(circle at center, rgba(201, 151, 62, 0.1), transparent)"
            }} />
            <iframe
              title="Mapa de la barbería"
              src="https://maps.google.com/maps?q=C.%20Desierto%20de%20Tabernas%2C%2041704%20Dos%20Hermanas%2C%20Sevilla&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="h-64 w-full transition-transform duration-300 group-hover:scale-[1.02] sm:h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-accent/20 bg-accent/10 p-lg shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Dirección</p>
              <p className="font-display text-lg font-bold text-primary">
                C. Desierto de Tabernas
              </p>
              <p className="text-sm text-neutral-text/80">
                41704 Dos Hermanas, Sevilla
              </p>
            </div>
            
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-lg shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Cómo llegar</p>
              <p className="text-sm text-neutral-text/90">
                5 min desde el centro. Fácil acceso y estacionamiento disponible.
              </p>
            </div>
          </div>
          
          <a
            href="https://www.google.com/maps/place/C.+Desierto+de+Tabernas,+41704+Dos+Hermanas,+Sevilla/@37.2887276,-5.9194302,1794m/data=!3m2!1e3!4b1!4m6!3m5!1s0xd1270686366f73b:0x60a50999740b7c24!8m2!3d37.2887234!4d-5.9168553!16s%2Fg%2F11byl7c454"
            target="_blank"
            rel="noreferrer"
            className="inline-block w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto">Abrir en Google Maps →</Button>
          </a>
        </div>
      </Card>
    </section>
  );
}
