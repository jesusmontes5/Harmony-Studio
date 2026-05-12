import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { mapApiError } from "../api/apiClient";
import { updateMyProfile } from "../api/userApi";
import { useAuth } from "../hooks/useAuth";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useNotificationMessage } from "../hooks/useNotifications";

/**
 * Evita redirigir de nuevo a completar perfil tras guardar los datos.
 */
function getSafeNextPath(pathname) {
  if (!pathname || pathname === "/completar-perfil") return "/";
  return pathname;
}

/**
 * CompletarPerfilPage - Página para completar/editar perfil del usuario.
 * Permite actualizar nombre, teléfono y otros datos de perfil.
 * @page
 * @returns {React.ReactElement}
 */
export function CompletarPerfilPage() {
  const { user, setUserData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [telefono, setTelefono] = useState(user?.telefono || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useNotificationMessage(error, "error", "Revisa tu perfil");

  /**
   * Valida nombre y telefono antes de completar el perfil.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedName = nombre.trim();
    const normalizedPhone = telefono.trim();

    if (!normalizedName) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!/^[0-9]{7,20}$/.test(normalizedPhone)) {
      setError("El telefono debe tener entre 7 y 20 digitos.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateMyProfile({
        nombre: normalizedName,
        telefono: normalizedPhone,
      });
      setUserData(updated);
      const nextPath = getSafeNextPath(location.state?.from?.pathname);
      navigate(nextPath, {
        replace: true,
        state: {
          appMessage: "Perfil completado correctamente.",
          appMessageTone: "success",
        },
      });
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-7">
      <Card
        className="mx-auto max-w-xl animate-fade-up"
        title="Datos obligatorios"
        subtitle="El email viene de Google. Solo completa los campos pendientes."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="animate-fade-up" style={{ animationDelay: "50ms" }}>
            <Input
              id="completeProfileEmail"
              label="Email"
              value={user?.email || ""}
              disabled
              readOnly
            />
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
            <Input
              id="completeProfileName"
              label="Nombre"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
            <Input
              id="completeProfilePhone"
              label="Teléfono"
              type="tel"
              value={telefono}
              onChange={(event) => setTelefono(event.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              maxLength={20}
              placeholder="Ej: 600123123"
              required
            />
          </div>

          {error ? (
            <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
              <Alert tone="error">{error}</Alert>
            </div>
          ) : null}

          <div className="animate-fade-up" style={{ animationDelay: "250ms" }}>
            <PrimaryButton type="submit" loading={saving} fullWidth>
              Guardar y continuar
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
