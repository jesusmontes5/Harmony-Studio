import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { PageTransition } from "./PageTransition";
import { useNotifications } from "../../hooks/useNotifications";

/**
 * AppShell - Shell/contenedor principal de la aplicación.
 * Estructura base para todas las páginas.
 * @component
 * @param {React.ReactNode} props.children - Contenido de la página
 * @returns {React.ReactElement}
 */
export function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useNotifications();

  useEffect(() => {
    if (!location.state?.appMessage) return;

    const message = location.state.appMessage;
    const tone = location.state.appMessageTone || "warning";

    const nextState = { ...(location.state || {}) };
    delete nextState.appMessage;
    delete nextState.appMessageTone;
    const hasNextState = Object.keys(nextState).length > 0;

    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: hasNextState ? nextState : null,
    });

    notify({ message, tone });
  }, [location, navigate, notify]);

  return (
    <div className="min-h-screen bg-[#fbf7ef]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(255,255,255,0)_16rem)]" />
        <Navbar />
        <PageTransition className="relative mx-auto w-full max-w-7xl px-md pb-3xl pt-lg sm:px-lg sm:pb-3xl sm:pt-xl lg:px-xl">
          {children}
        </PageTransition>
      </div>
      <Footer />
    </div>
  );
}
