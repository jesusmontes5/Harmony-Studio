import { Logo } from "../layout/Logo";

/**
 * AuthShell - Contenedor shell para páginas de autenticación.
 * Envuelve el contenido con estructura de página completa.
 * @component
 * @param {React.ReactNode} props.children - Contenido a renderizar
 * @returns {React.ReactElement}
 */
export function AuthShell({ tag, title, subtitle, children }) {
  const isRegister = String(tag || "").toLowerCase().includes("registro");

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#fbf7ef] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_5%,rgba(201,151,62,0.12),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(201,151,62,0.16),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(251,247,239,0.74))]" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full border border-accent/10" />
      <div className="pointer-events-none absolute -right-28 bottom-12 h-96 w-96 rounded-full border border-accent/20" />
      <div className="pointer-events-none absolute right-10 top-24 hidden h-28 w-28 bg-[radial-gradient(circle,rgba(201,151,62,0.34)_1px,transparent_1.5px)] bg-[length:14px_14px] opacity-25 lg:block" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <article className={`page-animate w-full ${isRegister ? "max-w-2xl" : "max-w-xl"} rounded-[1.75rem] border border-white/80 bg-white/95 p-7 shadow-[0_28px_80px_-38px_rgba(17,24,39,0.45)] backdrop-blur-xl sm:p-10 lg:p-12 animate-scale-in`}>
          <header className="mb-7 space-y-4 sm:mb-9 animate-fade-up">
            <div className="flex justify-center pb-2 sm:pb-3">
              <Logo align="center" />
            </div>
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-accent/20 bg-white text-accent shadow-[0_14px_35px_-24px_rgba(201,151,62,0.9)]">
                {isRegister ? (
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                    <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <path d="M6.5 10h11A1.5 1.5 0 0 1 19 11.5v7A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-7A1.5 1.5 0 0 1 6.5 10Z" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M12 14v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              {tag && (
                <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-accent">{tag}</p>
              )}
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-primary sm:text-5xl">
              {title}
            </h1>
            <div className="h-1 w-14 rounded-full bg-accent" />
            {subtitle && (
              <p className="text-sm font-medium leading-relaxed text-neutral-text/80 sm:text-base">
                {subtitle}
              </p>
            )}
          </header>
          <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
            {children}
          </div>
        </article>
      </div>
    </section>
  );
}
