import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Devuelve la ventana al inicio cada vez que cambia la ruta.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [pathname]);

  return null;
}
