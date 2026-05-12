import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

/**
 * Enlace circular para redes sociales con etiqueta accesible.
 */
function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {children}
    </a>
  );
}

/**
 * ContactSection - Seccion de contacto.
 * Muestra formas de contactar a la barberia.
 * @component
 * @returns {React.ReactElement}
 */
export function ContactSection() {
  return (
    <section id="contacto" aria-labelledby="contacto-title" className="animate-fade-up">
      <Card title="Contacto" subtitle="Multiples formas de comunicarse con nosotros." className="h-full">
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Telefono", value: "+34 600 000 000" },
              { label: "Email", value: "hola@barberia.com" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.35rem] border border-accent/12 bg-gradient-to-br from-white via-white to-accent/5 p-lg shadow-[0_16px_36px_-30px_rgba(17,24,39,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-elegant"
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-text/60">{item.label}</p>
                <p className="font-display text-sm font-bold text-primary">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <a href="tel:+34600000000" className="min-w-[120px] flex-1">
              <Button className="w-full">Llamar</Button>
            </a>
            <a href="mailto:hola@barberia.com" className="min-w-[120px] flex-1">
              <Button variant="secondary" className="w-full">Email</Button>
            </a>
            <a href="https://wa.me/34600000000" target="_blank" rel="noreferrer" className="min-w-[120px] flex-1">
              <Button variant="secondary" className="w-full">WhatsApp</Button>
            </a>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-neutral-border/65 to-transparent" />

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-text/60">Siguenos</p>
            <div className="flex flex-wrap gap-3">
              <SocialIcon href="https://instagram.com" label="Instagram">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.88 1.12a1.13 1.13 0 1 1 0 2.26 1.13 1.13 0 0 1 0-2.26ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://tiktok.com" label="TikTok">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M14.5 3h2.2a4.9 4.9 0 0 0 3.3 3.3v2.3a7.2 7.2 0 0 1-3.2-.9v6.5a5.2 5.2 0 1 1-5.2-5.2c.3 0 .7 0 1 .1v2.3a2.9 2.9 0 1 0 2.9 2.8V3Z" />
                </svg>
              </SocialIcon>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
