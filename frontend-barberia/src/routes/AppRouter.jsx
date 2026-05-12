import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";

const ClientesPage = lazy(() => import("../pages/ClientesPage").then((module) => ({ default: module.ClientesPage })));
const CompletarPerfilPage = lazy(() => import("../pages/CompletarPerfilPage").then((module) => ({ default: module.CompletarPerfilPage })));
const DashboardPage = lazy(() => import("../pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const GestionServiciosPage = lazy(() => import("../pages/GestionServiciosPage").then((module) => ({ default: module.GestionServiciosPage })));
const HomePage = lazy(() => import("../pages/HomePage").then((module) => ({ default: module.HomePage })));
const LoginPage = lazy(() => import("../pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const MiHorarioPage = lazy(() => import("../pages/MiHorarioPage").then((module) => ({ default: module.MiHorarioPage })));
const MisResenasPage = lazy(() => import("../pages/MisResenasPage").then((module) => ({ default: module.MisResenasPage })));
const PerfilPage = lazy(() => import("../pages/PerfilPage").then((module) => ({ default: module.PerfilPage })));
const RegisterPage = lazy(() => import("../pages/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const ReservasPage = lazy(() => import("../pages/ReservasPage").then((module) => ({ default: module.ReservasPage })));

/**
 * Protege login/registro para que usuarios autenticados no vuelvan a entrar.
 */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return <RouteFallback title="Cargando sesion..." subtitle="Por favor espera un momento" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Muestra una carga minima mientras se descarga o valida una ruta.
 */
function RouteFallback({ title = "Preparando pagina...", subtitle }) {
  return (
    <Card className="mx-auto mt-8 max-w-md animate-fade-up">
      <div className="flex flex-col items-center justify-center gap-4 py-8 text-neutral-text">
        <Spinner className="h-8 w-8" />
        <div className="space-y-1 text-center">
          <p className="font-semibold text-primary">{title}</p>
          {subtitle ? <p className="text-xs text-neutral-text/60">{subtitle}</p> : null}
        </div>
      </div>
    </Card>
  );
}

/**
 * Define el arbol de rutas publicas, privadas y protegidas por rol.
 */
export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Navigate to="/panel" replace />} />
          <Route path="/completar-perfil" element={<CompletarPerfilPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["CLIENTE"]} />}>
          <Route path="/reservas" element={<ReservasPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["BARBERO", "ADMIN"]} />}>
          <Route path="/panel" element={<DashboardPage />} />
          <Route path="/gestion-reservas" element={<Navigate to="/mi-horario" replace />} />
          <Route path="/mi-horario" element={<MiHorarioPage />} />
          <Route path="/mis-resenas" element={<MisResenasPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/gestion-servicios" element={<GestionServiciosPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
