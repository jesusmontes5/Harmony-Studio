import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";

/**
 * Enlace de navegacion de escritorio con estado activo de React Router.
 */
function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "group relative inline-flex h-12 items-center rounded-xl px-md text-xs font-semibold uppercase tracking-[0.04em] transition-all duration-200 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
          isActive ? "active text-accent bg-accent/10" : "text-primary/75 hover:text-accent hover:bg-accent/5"
        )
      }
    >
      {children}
      <span className="absolute inset-x-md bottom-2 h-0.5 origin-center scale-x-0 rounded-full bg-accent shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-transform duration-200 group-hover:scale-x-100 group-focus-visible:scale-x-100 group-[.active]:scale-x-100" />
    </NavLink>
  );
}

/**
 * Enlace del menu movil con animacion escalonada al abrir/cerrar.
 */
function MobileNavItem({ to, children, onClick, index, open }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onClick}
      style={{ transitionDelay: open ? `${90 + index * 45}ms` : "0ms" }}
      className={({ isActive }) =>
        cn(
          "group relative flex h-11 items-center rounded-xl px-md text-xs font-extrabold uppercase tracking-[0.04em] transition-all duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:outline-none",
          open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
          isActive ? "text-accent" : "text-primary/62"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span>{children}</span>
          <span
            className={cn(
              "absolute inset-x-md bottom-1.5 h-0.5 origin-center rounded-full bg-accent shadow-[0_0_8px_rgba(245,158,11,0.35)] transition-transform duration-300 group-focus-visible:scale-x-100",
              isActive ? "scale-x-100" : "scale-x-0"
            )}
          />
        </>
      )}
    </NavLink>
  );
}

/**
 * Calcula iniciales para mostrar un avatar textual cuando no hay imagen.
 */
function getInitials(user) {
  const source = user?.nombre || user?.email || "US";
  return source
    .split(" ")
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join("")
    .toUpperCase();
}

/**
 * Renderiza la foto de perfil o sus iniciales manteniendo el mismo estilo visual.
 */
function UserAvatar({ user, className = "h-8 w-8 text-xs" }) {
  const initials = getInitials(user);
  const avatarUrl = user?.avatarUrl;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Avatar de ${user?.nombre || "usuario"}`}
        referrerPolicy="no-referrer"
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "grid place-items-center rounded-full border border-white/80 bg-gradient-to-br from-primary via-primary to-[#070b16] font-semibold text-white ring-2 ring-white/90 shadow-[0_14px_28px_-18px_rgba(17,24,39,0.9)] transition-all duration-200",
        className
      )}
    >
      {initials}
    </span>
  );
}

/**
 * Icono de usuario usado en el desplegable de perfil.
 */
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Icono animado que alterna entre hamburguesa y cierre en mobile.
 */
function MenuIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <g
        className={cn(
          "origin-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "scale-90 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </g>
      <g
        className={cn(
          "origin-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "rotate-0 scale-100 opacity-100" : "-rotate-12 scale-90 opacity-0"
        )}
      >
        <path d="M6 6l12 12" />
        <path d="M18 6L6 18" />
      </g>
    </svg>
  );
}

/**
 * Barra superior responsive. Construye enlaces segun autenticacion y rol.
 */
export function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const shellRef = useRef(null);
  const location = useLocation();

  const canManage = user?.rol === "BARBERO" || user?.rol === "ADMIN";
  const canBook = user?.rol === "CLIENTE";
  const accountName = user?.nombre || user?.email || "Usuario";
  const accountEmail = user?.email || "";

  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileOpen(false);
      setMenuOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen && !menuOpen) return undefined;

    /**
     * Cierra menus cuando el usuario pulsa fuera de la barra.
     */
    const handlePointerDown = (event) => {
      if (!shellRef.current?.contains(event.target)) {
        setMobileOpen(false);
        setMenuOpen(false);
      }
    };

    /**
     * Permite cerrar menus con Escape para mejorar accesibilidad.
     */
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, menuOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  const links = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }

    const base = [{ to: "/", label: "Inicio" }];

    if (canBook) {
      base.push({ to: "/reservas", label: "Reservas" });
    }

    if (canManage) {
      base.push(
        { to: "/panel", label: "Panel" },
        { to: "/mi-horario", label: "Horario" },
        { to: "/mis-resenas", label: "Reseñas" },
        { to: "/clientes", label: "Clientes" },
        { to: "/gestion-servicios", label: "Servicios" }
      );
    }

    base.push({ to: "/perfil", label: "Perfil" });
    return base;
  }, [isAuthenticated, canManage, canBook]);

  const desktopLinks = links.filter((item) => item.to !== "/perfil");
  const mobileLinks = links.filter((item) => item.to !== "/perfil");

  return (
    <header ref={shellRef} className="sticky top-4 z-40 px-md sm:px-lg lg:px-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-sm rounded-[1.35rem] border border-white/80 bg-[#fffaf2]/82 px-md py-sm shadow-[0_30px_80px_-48px_rgba(17,24,39,0.55),0_16px_36px_-30px_rgba(245,158,11,0.55),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:gap-md sm:px-lg lg:px-xl">
        <NavLink to="/" className="group inline-flex shrink-0 items-center py-1 transition-all duration-200">
          <span className="inline-flex flex-col items-start gap-[0.15rem] sm:gap-[0.2rem]">
             <span className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.14em] sm:tracking-[0.18em] lg:tracking-[0.22em] text-primary leading-[0.95] font-feature-settings:'liga','kern','calt'">
               HARMONY
             </span>
             <span className="font-display text-[0.55rem] sm:text-[0.6rem] font-extralight tracking-[0.35em] sm:tracking-[0.4em] text-primary/30 leading-[1.1] font-feature-settings:'liga','kern'">
               STUDIO
             </span>
          </span>
        </NavLink>

        <nav className="hidden flex-1 items-center justify-center gap-3 md:flex lg:gap-6">
          {desktopLinks.map((item, idx) => (
            <div key={item.to} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-up">
              <NavItem to={item.to}>{item.label}</NavItem>
            </div>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 md:flex">
          {isAuthenticated ? (
            <div className="relative group">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-transparent p-0 text-sm text-neutral-text transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 active:translate-y-0"
                aria-expanded={menuOpen}
                aria-label="Abrir menu de usuario"
              >
                <UserAvatar user={user} className="h-12 w-12 text-base ring-2 ring-white/95 group-hover:shadow-[0_20px_32px_-22px_rgba(17,24,39,1)]" />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.85rem)] z-50 w-[min(20rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-[1.5rem] border border-white/85 bg-[#fffaf2] p-3 shadow-[0_34px_90px_-54px_rgba(17,24,39,0.7),0_18px_42px_-32px_rgba(245,158,11,0.55),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl animate-scale-in">
                  <div className="flex min-w-0 items-center gap-3 px-2.5 py-3">
                    <UserAvatar user={user} className="h-12 w-12 shrink-0 text-base ring-2 ring-white/95" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold leading-5 text-primary">{accountName}</p>
                      {accountEmail ? (
                        <p className="truncate text-xs font-medium leading-5 text-neutral-text/75">{accountEmail}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="my-1 border-t border-primary/10" />
                  <NavLink
                    to="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="group/item flex items-center gap-sm rounded-2xl px-md py-sm text-sm font-semibold text-primary/72 transition-all duration-200 hover:bg-accent/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl text-primary/55 transition-colors duration-200 group-hover/item:text-accent">
                      <UserIcon />
                    </span>
                    Ver perfil
                  </NavLink>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <NavLink to="/login">
                <Button variant="secondary" size="sm">
                  Login
                </Button>
              </NavLink>
              <NavLink to="/register">
                <Button size="sm">Registro</Button>
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-11 min-w-14 items-center justify-center rounded-xl border border-white/80 bg-white/85 px-sm text-xs font-semibold text-primary/70 shadow-soft transition-all duration-200 hover:border-accent/40 hover:bg-accent/5 hover:text-primary focus:outline-none focus-visible:outline-none active:translate-y-0 active:scale-[0.97] md:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
        >
          <MenuIcon open={mobileOpen} />
        </button>
      </div>

      <div
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-x-4 top-[calc(4rem+0.5rem)] z-50 mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/80 bg-[#fffaf2]/95 px-md shadow-[0_24px_60px_-42px_rgba(17,24,39,0.55)] backdrop-blur-xl transition-all duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden",
          mobileOpen
            ? "max-h-[calc(100vh-6rem)] translate-y-0 scale-100 py-sm opacity-100"
            : "pointer-events-none max-h-0 -translate-y-3 scale-[0.985] py-0 opacity-0"
        )}
      >
          <nav className="mb-xs grid gap-xs">
            {mobileLinks.map((item, index) => (
              <MobileNavItem
                key={item.to}
                to={item.to}
                index={index}
                open={mobileOpen}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </MobileNavItem>
            ))}
          </nav>

          <div
            className={cn(
              "mt-xs border-t border-neutral-border/30 pt-xs transition-all duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              mobileOpen ? "translate-y-0 opacity-100 delay-[260ms]" : "-translate-y-2 opacity-0 delay-0"
            )}
          >
            {isAuthenticated ? (
              <NavLink
                to="/perfil"
                onClick={() => setMobileOpen(false)}
                className="flex min-w-0 items-center gap-xs rounded-xl border border-white/80 bg-white/80 px-md py-md text-xs text-neutral-text shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-elegant focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
              >
                <UserAvatar user={user} className="h-8 w-8 shrink-0 text-xs" />
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate font-bold text-primary">{accountName}</span>
                  {accountEmail ? <span className="truncate text-[0.72rem] text-neutral-text/75">{accountEmail}</span> : null}
                </span>
              </NavLink>
            ) : (
              <div className="grid gap-xs">
                <NavLink to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" fullWidth>
                    Login
                  </Button>
                </NavLink>
                <NavLink to="/register" onClick={() => setMobileOpen(false)}>
                  <Button fullWidth>Registro</Button>
                </NavLink>
              </div>
            )}
          </div>
        </div>
    </header>
  );
}
