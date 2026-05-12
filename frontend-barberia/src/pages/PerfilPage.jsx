import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { meRequest } from "../api/authApi";
import { uploadImageToCloudinary } from "../api/cloudinaryApi";
import { mapApiError } from "../api/apiClient";
import { updateMyProfile, deleteMyAccount } from "../api/userApi";
import { useAuth } from "../hooks/useAuth";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { DangerButton } from "../components/ui/DangerButton";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { Skeleton } from "../components/ui/Skeleton";
import { useNotificationMessage } from "../hooks/useNotifications";

const profileInputClass =
  "h-14 rounded-xl border-neutral-border/80 bg-white/95 px-lg shadow-[0_14px_30px_-26px_rgba(17,24,39,0.55)] hover:border-accent/40 focus:border-accent focus:ring-accent/30 sm:h-14";

/**
 * Renderiza el icono asociado a cada campo del formulario de perfil.
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
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Icono de flecha usado en el boton principal de guardado.
 */
function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

/**
 * Calcula iniciales para el avatar cuando no existe imagen subida.
 */
function getInitials(nombre, email) {
  const source = nombre || email || "US";
  return source
    .split(" ")
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join("")
    .toUpperCase();
}

/**
 * Pagina de perfil para editar datos personales, avatar y acciones de cuenta.
 */
export function PerfilPage() {
  const { logout, setUserData } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef(null);

  useNotificationMessage(error, "error", "No se pudo actualizar el perfil");
  useNotificationMessage(success, "success", "Perfil actualizado");
  useNotificationMessage(deleteError, "error", "No se pudo eliminar la cuenta");

  useEffect(() => {
    /**
     * Carga el perfil autenticado y sincroniza el formulario local.
     */
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const me = await meRequest();
        setEmail(me.email || "");
        setNombre(me.nombre || "");
        setTelefono(me.telefono || "");
        setAvatarUrl(me.avatarUrl || "");
      } catch (err) {
        setError(mapApiError(err).message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /**
   * Envia los cambios editables del perfil al backend.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setDeleteError("");

    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!/^[0-9]{7,20}$/.test(telefono.trim())) {
      setError("El telefono debe tener entre 7 y 20 digitos");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateMyProfile({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        avatarUrl,
      });
      setNombre(updated.nombre || "");
      setTelefono(updated.telefono || "");
      setAvatarUrl(updated.avatarUrl || "");
      setUserData(updated);
      setSuccess("Perfil actualizado correctamente");
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Abre el selector de archivos para cambiar el avatar.
   */
  const handleAvatarPick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Sube el avatar seleccionado y actualiza la URL guardada en el perfil.
   */
  const handleAvatarFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecciona una imagen valida");
      return;
    }

    setError("");
    setSuccess("");
    setUploadingAvatar(true);
    try {
      const uploaded = await uploadImageToCloudinary(file);
      const nextAvatarUrl = typeof uploaded === "string" ? uploaded : uploaded?.secure_url || uploaded?.url;
      if (!nextAvatarUrl) {
        throw new Error("No se pudo obtener la URL de la imagen");
      }

      const avatarPayload = {
        nombre: nombre.trim(),
        avatarUrl: nextAvatarUrl,
      };
      if (telefono.trim()) {
        avatarPayload.telefono = telefono.trim();
      }

      const updated = await updateMyProfile(avatarPayload);

      setAvatarUrl(updated.avatarUrl || nextAvatarUrl || "");
      setNombre(updated.nombre || nombre);
      setUserData(updated);
      setSuccess("Foto de perfil actualizada");
    } catch (err) {
      setError(mapApiError(err)?.message || err?.message || "No se pudo subir la foto");
    } finally {
      setUploadingAvatar(false);
    }
  };

  /**
   * Elimina la imagen de perfil actual.
   */
  const handleRemoveAvatar = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const avatarPayload = {
        nombre: nombre.trim(),
        avatarUrl: "",
      };
      if (telefono.trim()) {
        avatarPayload.telefono = telefono.trim();
      }

      const updated = await updateMyProfile(avatarPayload);
      setAvatarUrl("");
      setUserData(updated);
      setSuccess("Foto de perfil eliminada");
    } catch (err) {
      setError(mapApiError(err)?.message || err?.message || "No se pudo eliminar la foto");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Cierra la sesion actual y redirige al login.
   */
  const handleLogout = async () => {
    logout();
    navigate("/login", { replace: true });
  };

  /**
   * Ejecuta la eliminacion definitiva de la cuenta autenticada.
   */
  const handleDeleteAccount = async () => {
    setError("");
    setSuccess("");
    setDeleteError("");
    setDeletingAccount(true);
    try {
      await deleteMyAccount();
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteError(mapApiError(err).message);
    } finally {
      setDeletingAccount(false);
    }
  };

  /**
   * Abre el modal de confirmacion para eliminar cuenta.
   */
  const handleOpenDeleteConfirm = () => {
    setDeleteError("");
    setShowDeleteConfirm(true);
  };

  /**
   * Cierra el modal de eliminacion y limpia errores locales.
   */
  const handleCloseDeleteConfirm = () => {
    if (deletingAccount) return;
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-14 w-64" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="relative -mx-md -my-lg overflow-hidden px-md py-lg sm:-mx-lg sm:-my-xl sm:px-lg sm:py-xl lg:-mx-xl lg:px-xl">
      <div className="pointer-events-none fixed inset-0 -z-[10] bg-[#fbf7ef]" />
      <div className="pointer-events-none fixed inset-0 -z-[10] bg-[radial-gradient(circle_at_10%_18%,rgba(201,151,62,0.12),transparent_30%),radial-gradient(circle_at_86%_34%,rgba(201,151,62,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(251,247,239,0.76))]" />
      <div className="pointer-events-none fixed -left-28 top-48 -z-[10] h-[34rem] w-[34rem] rounded-full border border-accent/10" />
      <div className="pointer-events-none fixed right-4 top-28 -z-[10] hidden h-32 w-32 bg-[radial-gradient(circle,rgba(201,151,62,0.28)_1px,transparent_1.5px)] bg-[length:14px_14px] opacity-25 lg:block" />
      <div className="pointer-events-none fixed -right-32 bottom-6 -z-[10] h-[28rem] w-[28rem] rounded-full border border-accent/20" />

      <div className="mx-auto max-w-5xl space-y-7 sm:space-y-8">
        <section className="mx-auto max-w-3xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/94 shadow-[0_28px_80px_-44px_rgba(17,24,39,0.5)] backdrop-blur-xl animate-fade-up">
          <header className="border-b border-neutral-border/70 px-7 py-6 sm:px-10">
            <h2 className="font-display text-2xl font-bold leading-tight text-primary sm:text-3xl">Datos de la cuenta</h2>
          </header>

          <div className="p-7 sm:p-10">
            <div className="mb-9 rounded-2xl border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 px-6 py-7 shadow-[0_18px_45px_-34px_rgba(17,24,39,0.55)] sm:px-8">
          <div className="flex flex-col items-center gap-lg sm:flex-row sm:items-center">
             <button
               type="button"
               onClick={handleAvatarPick}
               disabled={uploadingAvatar}
               className="rounded-full outline-none transition-transform duration-300 hover:scale-[1.03]"
               title="Cambiar foto"
             >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`Avatar de ${nombre || "usuario"}`}
                  referrerPolicy="no-referrer"
                   className="h-24 w-24 rounded-full object-cover outline-none shadow-[0_18px_35px_-22px_rgba(17,24,39,0.85)]"
                />
              ) : (
                <span className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-primary to-[#070b16] text-2xl font-bold text-white shadow-[0_18px_35px_-22px_rgba(17,24,39,0.9)]">
                  {getInitials(nombre, email)}
                </span>
               )}
             </button>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h3 className="font-display text-3xl font-bold text-primary">{nombre || "Usuario"}</h3>
              <p className="mt-1 break-all text-sm font-medium text-neutral-text">{email}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {avatarUrl ? (
                  <Button type="button" size="sm" variant="secondary" onClick={handleRemoveAvatar} loading={saving} className="rounded-xl border-neutral-border/80 bg-white/90 shadow-soft hover:border-accent/40 hover:bg-white">
                    Quitar foto
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFileChange}
        />

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.22em] text-accent">Informacion personal</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                id="perfilEmail"
                label="Email"
                value={email}
                disabled
                readOnly
                icon={<FieldIcon type="email" />}
                inputClassName={profileInputClass}
              />
              <Input
                id="perfilNombre"
                label="Nombre completo"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                maxLength={100}
                placeholder="Tu nombre"
                icon={<FieldIcon type="user" />}
                inputClassName={profileInputClass}
                required
              />
              <Input
                id="perfilTelefono"
                label="Telefono"
                type="tel"
                value={telefono}
                onChange={(event) => setTelefono(event.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                maxLength={20}
                placeholder="600123456"
                icon={<FieldIcon type="phone" />}
                inputClassName={profileInputClass}
                required
              />
            </div>
          </div>

          {error ? <Alert tone="error">{error}</Alert> : null}
          {success ? <Alert tone="success">{success}</Alert> : null}

          <PrimaryButton
            type="submit"
            loading={saving}
            fullWidth
          >
            <span className="inline-flex w-full items-center justify-center gap-3">
              Guardar cambios
              <span className="text-accent/78">
                <ArrowRightIcon />
              </span>
            </span>
          </PrimaryButton>

          <div className="rounded-[1.125rem] border border-[#e8ddd3]/70 bg-[#fdf9f2] px-6 py-5 shadow-[0_4px_24px_-12px_rgba(17,24,39,0.10)] sm:rounded-[1.25rem] sm:px-8 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-[#fdf4e7]/80">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent/70" fill="none" aria-hidden="true">
                    <path d="M12 3l-8 4v4c0 5.25 3.4 10.14 8 11.4 4.6-1.26 8-6.15 8-11.4V7l-8-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="15.5" r="0.75" fill="currentColor" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[0.95rem] font-semibold leading-snug text-primary tracking-tight">Sesion</p>
                  <p className="mt-0.5 text-sm leading-snug text-neutral-text/70">Cierra tu sesion en este dispositivo.</p>
                </div>
              </div>
              <SecondaryButton
                type="button"
                onClick={handleLogout}
                className="shrink-0 sm:px-6"
              >
                Cerrar sesion
              </SecondaryButton>
            </div>
          </div>

          <div className="rounded-[1.125rem] border border-[#e8ddd3]/70 bg-[#fdf9f2] px-6 py-5 shadow-[0_4px_24px_-12px_rgba(17,24,39,0.10)] sm:rounded-[1.25rem] sm:px-8 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-danger/20 bg-danger/5">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-danger/70" fill="none" aria-hidden="true">
                    <path d="M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[0.95rem] font-semibold leading-snug text-primary tracking-tight">Eliminar cuenta</p>
                  <p className="mt-0.5 text-sm leading-snug text-neutral-text/70">Elimina permanentemente tu cuenta y todos tus datos.</p>
                </div>
              </div>
              <DangerButton
                type="button"
                onClick={handleOpenDeleteConfirm}
                disabled={saving || uploadingAvatar || deletingAccount}
                className="shrink-0 sm:px-6"
              >
                Eliminar cuenta
              </DangerButton>
            </div>
          </div>
        </form>
          </div>
        </section>
      </div>

      <Modal
        open={showDeleteConfirm}
        title="Eliminar cuenta"
        onClose={handleCloseDeleteConfirm}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseDeleteConfirm}
              disabled={deletingAccount}
              className="w-full rounded-xl border-neutral-border/80 bg-white/90 sm:w-auto"
            >
              Cancelar
            </Button>
            <DangerButton
              type="button"
              onClick={handleDeleteAccount}
              loading={deletingAccount}
              disabled={deletingAccount}
              className="sm:w-auto"
            >
              Eliminar cuenta
            </DangerButton>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-red-200/80 bg-red-50">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-red-500" fill="none" aria-hidden="true">
              <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="0.8" fill="currentColor" />
              <path d="M10.3 4.2 2.7 12.6a3.2 3.2 0 0 0 .2 4.5L9 22.6a3.2 3.2 0 0 0 4.6 0l7.2-6.2a3.2 3.2 0 0 0 .2-4.5L13.7 4.2a3.2 3.2 0 0 0-4.6 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.95rem] leading-relaxed text-neutral-text">
              Esta accion eliminara permanentemente tu cuenta y tus datos asociados. No se puede deshacer.
            </p>
            {deleteError && (
              <Alert tone="error" className="mt-4">
                {deleteError}
              </Alert>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
