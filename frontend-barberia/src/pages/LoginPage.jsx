import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { AuthShell } from "../components/auth/AuthShell";
import { useAuth } from "../hooks/useAuth";
import { Alert } from "../components/ui/Alert";
import { Input } from "../components/ui/Input";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useNotificationMessage } from "../hooks/useNotifications";

const INITIAL_VALUES = {
  email: "",
  password: "",
  remember: false,
};

const authInputClass =
  "h-14 rounded-xl border-neutral-border/80 bg-white/95 px-lg shadow-[0_14px_30px_-26px_rgba(17,24,39,0.55)] hover:border-accent/40 focus:border-accent focus:ring-accent/30 sm:h-14";

/**
 * Devuelve el icono adecuado para cada campo del formulario de acceso.
 */
function FieldIcon({ type }) {
  const common = "h-5 w-5";
  if (type === "email") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
        <path d="M4.5 7.5h15v9h-15v-9Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
      <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6.5 10h11A1.5 1.5 0 0 1 19 11.5v7A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-7A1.5 1.5 0 0 1 6.5 10Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 14v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Pagina de inicio de sesion con email/password y acceso mediante Google.
 */
export function LoginPage() {
  const { login, googleLogin } = useAuth();
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";
  const routeMessage = location.state?.appMessage || "";
  const routeMessageTone = location.state?.appMessageTone || "warning";

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useNotificationMessage(routeMessage, routeMessageTone, routeMessageTone === "success" ? "Listo" : "Aviso");
  useNotificationMessage(errors.form, "error", "No se pudo iniciar sesion");

  /**
   * Sincroniza los campos del formulario de login.
   */
  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Valida credenciales y autentica al usuario con email y contrasena.
   */
  const onSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    const normalizedEmail = values.email.trim().toLowerCase();

    if (!values.email || !values.password) {
      setErrors({ form: "Debes completar email y contrasena" });
      return;
    }
    if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(normalizedEmail)) {
      setErrors({ form: "Debes usar un correo Gmail valido" });
      return;
    }

    setLoading(true);
    const result = await login({
      email: normalizedEmail,
      password: values.password,
      remember: values.remember,
    });
    setLoading(false);

    if (!result.ok) {
      if (result.error?.title === "PENDING_APPROVAL") {
        setErrors({ form: "Tu cuenta esta a la espera de ser aceptada por el barbero." });
        return;
      }
      setErrors({ form: result.error.message });
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  /**
   * Procesa el token de Google recibido tras un login correcto.
   */
  const onGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse?.credential;
    if (!token) {
      setErrors({ form: "No se pudo obtener el token de Google" });
      return;
    }

    setLoading(true);
    const result = await googleLogin(token, values.remember);
    setLoading(false);

    if (!result.ok) {
      if (result.error?.title === "GOOGLE_ACCOUNT_NOT_REGISTERED") {
        navigate("/register", {
          replace: true,
          state: {
            googleCredential: token,
            appMessage: "Completa telefono y contrasena para terminar tu registro con Google.",
          },
        });
        return;
      }
      setErrors({ form: result.error.message });
      return;
    }

    const loggedUser = result.data?.user;
    const missingName = !String(loggedUser?.nombre || "").trim();
    const missingPhone = !String(loggedUser?.telefono || "").trim();
    if (missingName || missingPhone) {
      navigate("/completar-perfil", {
        replace: true,
        state: {
          appMessage: "Completa nombre y telefono para terminar el acceso con Google.",
          appMessageTone: "warning",
        },
      });
      return;
    }

    navigate("/", { replace: true });
  };

  /**
   * Muestra feedback cuando Google no completa la autenticacion.
   */
  const onGoogleError = () => {
    setErrors({ form: "No se pudo iniciar sesion con Google" });
  };

  return (
    <AuthShell
      tag="Acceso"
      title="Iniciar sesion"
      subtitle="Accede a tu espacio privado de cliente o barbero."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          id="loginEmail"
          label="Email"
          type="email"
          name="email"
          value={values.email}
          onChange={onChange}
          error={errors.email}
          autoComplete="email"
          placeholder="tu@email.com"
          icon={<FieldIcon type="email" />}
          inputClassName={authInputClass}
          required
        />

        <Input
          id="loginPassword"
          label="Contrasena"
          type="password"
          name="password"
          value={values.password}
          onChange={onChange}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Tu contrasena"
          icon={<FieldIcon type="password" />}
          inputClassName={authInputClass}
          required
        />

        <div className="space-y-4 pt-1">
          <label className="inline-flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="remember"
              checked={values.remember}
              onChange={onChange}
              className="h-5 w-5 rounded border-neutral-border bg-white text-primary transition cursor-pointer focus:ring-2 focus:ring-accent"
            />
            <span className="font-medium text-neutral-text">Recordarme en este dispositivo</span>
          </label>
          <button type="button" className="block text-sm font-bold text-accent transition hover:text-primary">
            ¿Olvidaste tu contrasena?
          </button>
        </div>

        {routeMessage ? <Alert tone={routeMessageTone}>{routeMessage}</Alert> : null}
        {errors.form ? <Alert tone="error">{errors.form}</Alert> : null}

        <PrimaryButton
          type="submit"
          loading={loading}
          fullWidth
        >
          Entrar
        </PrimaryButton>

        {hasGoogleClientId ? (
          <>
            <div className="relative py-md">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-border/60" />
              </div>
              <span className="relative flex justify-center text-xs uppercase tracking-widest text-neutral-text/70 font-bold">
                <span className="bg-white px-md">o continua con</span>
              </span>
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-neutral-border/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-soft">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                text="continue_with"
                theme="outline"
                shape="rectangular"
                width="100%"
              />
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-accent/30 bg-accent/10 px-lg py-md text-xs font-medium text-primary">
            Login con Google no disponible: configura VITE_GOOGLE_CLIENT_ID en tu entorno.
          </div>
        )}
      </form>

      <p className="mt-lg text-center text-sm text-neutral-text">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="font-bold text-accent transition hover:text-primary">
          Registrate aqui
        </Link>
      </p>
    </AuthShell>
  );
}
