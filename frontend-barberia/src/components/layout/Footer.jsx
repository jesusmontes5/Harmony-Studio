import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Logo } from "./Logo";

/**
 * Footer - Pie de pagina de la aplicacion.
 * Muestra informacion de contacto y enlaces.
 * @component
 * @returns {React.ReactElement}
 */
export function Footer() {
  const { user } = useAuth();
  const isCliente = user?.rol === "CLIENTE";
  const canManage = user?.rol === "BARBERO" || user?.rol === "ADMIN";

  const linkClass =
    "group inline-flex items-center gap-2 text-sm font-medium text-neutral-text/72 transition-all duration-200 hover:translate-x-0.5 hover:text-accent focus:outline-none focus-visible:text-accent";

  return (
    <footer className="relative mt-10 overflow-hidden border-t border-white/70 bg-[#fbf7ef]/95">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_30%,rgba(201,151,62,0.12),transparent_32%),radial-gradient(circle_at_88%_74%,rgba(201,151,62,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.94),rgba(251,247,239,0.86))]" />
      <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full border border-accent/12" />
      <div className="pointer-events-none absolute -right-20 bottom-4 h-52 w-52 rounded-full border border-accent/12" />

      <div className="relative mx-auto w-full max-w-7xl px-sm py-xl sm:px-md sm:py-2xl lg:px-lg lg:py-3xl">
        <div className="rounded-[1.45rem] border border-white/85 bg-white/78 p-lg shadow-[0_32px_85px_-56px_rgba(17,24,39,0.58),0_14px_28px_-22px_rgba(201,151,62,0.34),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl sm:p-xl lg:p-2xl">
          <div className="grid gap-xl lg:grid-cols-3 lg:gap-2xl">
            <div className="space-y-4 text-center animate-fade-up lg:text-left">
              <div className="flex flex-col items-center lg:items-start">
                <h3>
                  <Logo align="center" />
                </h3>
              </div>

            </div>

            {isCliente ? (
              <div className="space-y-4 animate-fade-up" style={{ animationDelay: "50ms" }}>
                <h4 className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-neutral-text/60">
                  Enlaces rápidos
                </h4>
                <nav className="flex flex-col gap-3">
                  <Link to="/reservas" className={linkClass}>
                    <span className="text-accent/85 transition-colors duration-200 group-hover:text-accent">
                      →
                    </span>
                    Reservas
                  </Link>
                </nav>
              </div>
            ) : canManage ? (
              <div className="space-y-4 animate-fade-up" style={{ animationDelay: "50ms" }}>
                <h4 className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-neutral-text/60">
                  Enlaces rápidos
                </h4>
                <nav className="flex flex-col gap-3">
                  <Link to="/panel" className={linkClass}>
                    <span className="text-accent/85 transition-colors duration-200 group-hover:text-accent">
                      →
                    </span>
                    Panel
                  </Link>
                  <Link to="/mi-horario" className={linkClass}>
                    <span className="text-accent/85 transition-colors duration-200 group-hover:text-accent">
                      →
                    </span>
                    Horario
                  </Link>
                  <Link to="/mis-resenas" className={linkClass}>
                    <span className="text-accent/85 transition-colors duration-200 group-hover:text-accent">
                      →
                    </span>
                    Reseñas
                  </Link>
                  <Link to="/clientes" className={linkClass}>
                    <span className="text-accent/85 transition-colors duration-200 group-hover:text-accent">
                      →
                    </span>
                    Clientes
                  </Link>
                  <Link to="/gestion-servicios" className={linkClass}>
                    <span className="text-accent/85 transition-colors duration-200 group-hover:text-accent">
                      →
                    </span>
                    Servicios
                  </Link>
                </nav>
              </div>
            ) : (
              <div aria-hidden="true" className="hidden lg:block" />
            )}

            {!isCliente && canManage ? (
              <div aria-hidden="true" className="hidden lg:block" />
            ) : null}
          </div>

          <div className="my-lg h-px bg-gradient-to-r from-transparent via-neutral-border/65 to-transparent sm:my-xl" />

          <div
            className="flex flex-col items-start justify-between gap-3 text-xs text-neutral-text/58 sm:flex-row sm:items-center animate-fade-up"
            style={{ animationDelay: "150ms" }}
          >
            <p>© 2026 Harmony Studio. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
