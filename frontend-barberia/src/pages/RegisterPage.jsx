import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleAuthButton } from "../components/auth/GoogleAuthButton";
import { AuthShell } from "../components/auth/AuthShell";
import { useAuth } from "../hooks/useAuth";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useNotificationMessage } from "../hooks/useNotifications";

const INITIAL_VALUES = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const authInputClass =
  "h-14 rounded-xl border-neutral-border/80 bg-white/95 px-lg shadow-[0_14px_30px_-26px_rgba(17,24,39,0.55)] hover:border-accent/40 focus:border-accent focus:ring-accent/30 sm:h-14";

/**
 * Devuelve el icono adecuado para cada campo del formulario de registro.
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
  if (type === "phone") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
        <path d="M7.5 5.5 9 4l3 3-1.5 1.5c.7 1.5 1.8 2.7 3.2 3.4L15 10.6l3 3-1.4 1.5c-.8.8-2 .9-3 .4a15.4 15.4 0 0 1-6.1-6.1c-.5-1-.3-2.1.1-2.9Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "user") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
 * Decodifica el payload basico de una credencial JWT de Google en cliente.
 */
function decodeGoogleCredential(credential) {
  const [, payload] = String(credential || "").split(".");
  if (!payload) return null;
  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=");
  const json = decodeURIComponent(
    atob(paddedPayload)
      .split("")
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join("")
  );
  return JSON.parse(json);
}

/**
 * Pagina de registro de cliente con solicitud pendiente de aprobacion.
 */
export function RegisterPage() {
  const { register } = useAuth();
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const navigate = useNavigate();
  const location = useLocation();
  const googleCredential = location.state?.googleCredential;
  const googleRouteMessage =
    location.state?.appMessage || "Datos de Google cargados. Anade telefono y contrasena para enviar el registro.";

  const googlePrefill = useMemo(() => {
    if (!googleCredential) {
      return { values: null, error: "", notice: "" };
    }
    try {
      const payload = decodeGoogleCredential(googleCredential);
      if (!payload?.email || !payload?.email_verified) {
        return { values: null, error: "No se pudo validar el correo de Google", notice: "" };
      }
      return {
        values: {
          name: payload.name || "",
          email: String(payload.email).toLowerCase(),
        },
        error: "",
        notice: googleRouteMessage,
      };
    } catch {
      return { values: null, error: "No se pudo leer la cuenta de Google", notice: "" };
    }
  }, [googleCredential, googleRouteMessage]);

  const [values, setValues] = useState(() => ({ ...INITIAL_VALUES, ...(googlePrefill.values || {}) }));
  const [errors, setErrors] = useState(() => (googlePrefill.error ? { form: googlePrefill.error } : {}));
  const [googleNotice, setGoogleNotice] = useState(googlePrefill.notice);
  const [loading, setLoading] = useState(false);

  const isPasswordValid = useMemo(() => values.password.length >= 8, [values.password]);

  useNotificationMessage(errors.form, "error", "No se pudo completar el registro");
  useNotificationMessage(googleNotice, "success", "Datos cargados");

  /**
   * Sincroniza los campos del formulario de registro.
   */
  const onChange = (event) => {
    const { name, value } = event.target;
    if (name === "phone") {
      setValues((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
      return;
    }
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Valida datos y crea una solicitud de registro pendiente.
   */
  const onSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    const normalizedEmail = values.email.trim().toLowerCase();
    const normalizedPhone = values.phone.trim();

    if (!values.name.trim()) nextErrors.name = "El nombre es obligatorio";
    if (!values.email.trim()) {
      nextErrors.email = "El email es obligatorio";
    } else if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(normalizedEmail)) {
      nextErrors.email = "Debes usar un correo Gmail valido";
    }
    if (!normalizedPhone) {
      nextErrors.phone = "El telefono es obligatorio";
    } else if (!/^[0-9]{7,20}$/.test(normalizedPhone)) {
      nextErrors.phone = "El telefono debe tener entre 7 y 20 digitos";
    }
    if (!values.password) nextErrors.password = "La contrasena es obligatoria";
    if (values.password && values.password.length < 8) {
      nextErrors.password = "La contrasena debe tener al menos 8 caracteres";
    }
    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Debes confirmar la contrasena";
    } else if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = "Las contrasenas no coinciden";
    }

    if (Object.keys(nextErrors).length > 0) {
      nextErrors.form = "Completa los campos marcados para enviar la solicitud.";
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setGoogleNotice("");
    setLoading(true);

    const result = await register({
      nombre: values.name.trim(),
      email: normalizedEmail,
      telefono: normalizedPhone,
      password: values.password,
    });
    setLoading(false);

    if (!result.ok) {
      setErrors({ form: result.error.message });
      return;
    }

    navigate("/login", { replace: true });
  };

  /**
   * Rellena datos disponibles a partir de la cuenta de Google.
   */
  const onGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse?.credential;
    if (!token) {
      setErrors({ form: "No se pudo obtener el token de Google" });
      return;
    }

    try {
      const payload = decodeGoogleCredential(token);
      if (!payload?.email || !payload?.email_verified) {
        setErrors({ form: "No se pudo validar el correo de Google" });
        return;
      }

      setValues((prev) => ({
        ...prev,
        name: payload.name || prev.name,
        email: String(payload.email).toLowerCase(),
      }));
      setErrors({});
      setGoogleNotice("Datos de Google cargados. Anade telefono y contrasena para enviar el registro.");
    } catch {
      setErrors({ form: "No se pudo leer la cuenta de Google" });
    }
  };

  /**
   * Notifica al usuario si falla el flujo de Google.
   */
  const onGoogleError = () => {
    setErrors({ form: "No se pudo completar el registro con Google" });
  };

  return (
    <AuthShell
      tag="Registro"
      title="Crear cuenta"
      subtitle="Solicita tu acceso y espera la aprobacion del barbero."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          id="registerName"
          label="Nombre completo"
          name="name"
          value={values.name}
          onChange={onChange}
          error={errors.name}
          autoComplete="name"
          placeholder="Tu nombre"
          icon={<FieldIcon type="user" />}
          inputClassName={authInputClass}
          required
        />

        <Input
          id="registerEmail"
          label="Email"
          type="email"
          name="email"
          value={values.email}
          onChange={onChange}
          error={errors.email}
          autoComplete="email"
          placeholder="tuusuario@gmail.com"
          hint="Solo se aceptan correos @gmail.com"
          icon={<FieldIcon type="email" />}
          inputClassName={authInputClass}
          required
        />

        <Input
          id="registerPhone"
          label="Telefono"
          type="tel"
          name="phone"
          value={values.phone}
          onChange={onChange}
          error={errors.phone}
          autoComplete="tel"
          inputMode="numeric"
          maxLength={20}
          placeholder="Ej: 600123123"
          hint="Solo digitos, de 7 a 20"
          icon={<FieldIcon type="phone" />}
          inputClassName={authInputClass}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="registerPassword"
            label="Contrasena"
            type="password"
            name="password"
            value={values.password}
            onChange={onChange}
            error={errors.password}
            autoComplete="new-password"
            placeholder="Minimo 8 caracteres"
            hint="Minimo 8 caracteres"
            icon={<FieldIcon type="password" />}
            inputClassName={authInputClass}
            required
          />
          <Input
            id="registerConfirmPassword"
            label="Confirmar contrasena"
            type="password"
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={onChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
            placeholder="Repite la contrasena"
            icon={<FieldIcon type="password" />}
            inputClassName={authInputClass}
            required
          />
        </div>

        <div className="rounded-xl border border-neutral-border/70 bg-white/80 px-lg py-md text-sm font-semibold text-neutral-text shadow-[0_12px_30px_-26px_rgba(17,24,39,0.55)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Estado de seguridad</span>
            <Badge tone={isPasswordValid ? "success" : "warning"}>
              {isPasswordValid ? "Contrasena valida" : "Pendiente de 8 caracteres"}
            </Badge>
          </div>
        </div>

        {errors.form ? <Alert tone="error">{errors.form}</Alert> : null}
        {googleNotice ? <Alert tone="success">{googleNotice}</Alert> : null}

        <PrimaryButton
          type="submit"
          loading={loading}
          fullWidth
        >
          Crear cuenta
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

            <GoogleAuthButton onSuccess={onGoogleSuccess} onError={onGoogleError} text="signup_with" />
          </>
        ) : (
          <div className="rounded-xl border border-accent/30 bg-accent/10 px-lg py-md text-xs font-medium text-primary">
            Registro con Google no disponible: configura VITE_GOOGLE_CLIENT_ID en tu entorno.
          </div>
        )}
      </form>

      <p className="mt-lg text-center text-sm text-neutral-text">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-bold text-accent transition hover:text-primary">
          Inicia sesion
        </Link>
      </p>
    </AuthShell>
  );
}
