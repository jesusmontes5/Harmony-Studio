import { useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { PageTransition } from "./components/layout/PageTransition";
import { AppRouter } from "./routes/AppRouter";

/**
 * Punto de entrada visual que decide si una ruta usa shell general o layout auth.
 */
export default function App() {
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";

  if (isAuthRoute) {
    return (
      <PageTransition>
        <AppRouter />
      </PageTransition>
    );
  }

  return (
    <AppShell>
      <AppRouter />
    </AppShell>
  );
}
