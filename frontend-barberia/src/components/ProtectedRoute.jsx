import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Card } from "./ui/Card";
import { Spinner } from "./ui/Spinner";

/**
 * Convierte la lista de roles permitidos en texto legible para mensajes.
 */
function getAllowedRolesText(allowedRoles) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return "";
  return allowedRoles.join(", ");
}

/**
 * Comprueba si al usuario autenticado le faltan datos obligatorios de perfil.
 */
function hasIncompleteProfile(user) {
  const nombre = String(user?.nombre || "").trim();
  const telefono = String(user?.telefono || "").trim();
  return !nombre || !telefono;
}

/**
 * ProtectedRoute - Componente que protege rutas requiriendo autenticación.
 * Redirige a login si el usuario no está autenticado.
 * @component
 * @param {Object} props
 * @param {React.ComponentType} props.element - Componente a renderizar
 * @returns {React.ReactElement}
 */
export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, authLoading, user, authMessage } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <Card className="mx-auto mt-8 max-w-md animate-fade-up">
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-neutral-text">
          <Spinner className="h-8 w-8" />
          <div className="text-center space-y-1">
            <p className="font-semibold text-primary">Cargando sesión...</p>
            <p className="text-xs text-neutral-text/60">Por favor espera un momento</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          appMessage: authMessage || undefined,
          appMessageTone: authMessage ? "error" : "warning",
        }}
      />
    );
  }

  const profilePending = hasIncompleteProfile(user);
  const isProfileCompletionRoute = location.pathname === "/completar-perfil";

  if (profilePending && !isProfileCompletionRoute) {
    return (
      <Navigate
        to="/completar-perfil"
        replace
        state={{
          from: location,
          appMessage: "Completa tu nombre y telefono para terminar el acceso.",
          appMessageTone: "warning",
        }}
      />
    );
  }

  if (!profilePending && isProfileCompletionRoute) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.rol)) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          appMessage: `No tienes permisos para entrar aqui. Roles permitidos: ${getAllowedRolesText(allowedRoles)}.`,
          appMessageTone: "error",
        }}
      />
    );
  }

  return <Outlet />;
}
