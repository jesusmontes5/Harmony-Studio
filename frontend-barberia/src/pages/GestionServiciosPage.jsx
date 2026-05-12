import { useEffect, useState } from "react";
import { mapApiError } from "../api/apiClient";
import { createService, deleteService, listServices, updateService } from "../api/servicesApi";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { DangerButton } from "../components/ui/DangerButton";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { Skeleton } from "../components/ui/Skeleton";
import { useNotificationMessage } from "../hooks/useNotifications";
import { premiumCardClass, premiumInputClass } from "../styles/uiClasses";

const initialCreateForm = {
  nombre: "",
  duracionMinutos: "30",
  precio: "10.00",
};

/**
 * Devuelve el icono correspondiente a nombre, duracion o precio del servicio.
 */
function FieldIcon({ type }) {
  const common = "h-5 w-5";

  if (type === "clock") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "price") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
        <path d="M12 4v16M15.5 7.5a3.5 3.5 0 0 0-3.5-2.5c-2 0-3.5 1-3.5 2.8 0 4.3 7 2.3 7 6.2 0 1.8-1.6 3-3.6 3a3.8 3.8 0 0 1-3.9-2.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
      <path d="M5 8.5h14M5 12h10M5 15.5h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="4.5" y="6" width="15" height="12" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

/**
 * GestionServiciosPage - Página de gestión de servicios.
 * Permite crear, editar y eliminar servicios de barbería.
 * Acceso restringido a admin.
 * @page
 * @returns {React.ReactElement}
 */
export function GestionServiciosPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [editForms, setEditForms] = useState({});

  useNotificationMessage(error, "error", "Revisa servicios");
  useNotificationMessage(success, "success", "Servicios actualizados");

  /**
   * Carga servicios desde API y prepara los formularios de edicion por servicio.
   */
  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listServices(false);
      setServices(data || []);
      setEditForms(
        Object.fromEntries(
          (data || []).map((s) => [
            s.id,
            {
              nombre: s.nombre ?? "",
              duracionMinutos: String(s.duracionMinutos ?? ""),
              precio: String(s.precio ?? ""),
            },
          ])
        )
      );
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  /**
   * Valida y crea un servicio nuevo desde el formulario superior.
   */
  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!createForm.nombre.trim()) {
      setError("El titulo del servicio es obligatorio");
      return;
    }

    setSaving(true);
    try {
      await createService({
        nombre: createForm.nombre.trim(),
        duracionMinutos: Number(createForm.duracionMinutos),
        precio: Number(createForm.precio),
      });
      setCreateForm(initialCreateForm);
      setSuccess("Servicio creado");
      await loadServices();
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Guarda los cambios de un servicio existente.
   */
  const handleUpdate = async (serviceId) => {
    setError("");
    setSuccess("");
    const form = editForms[serviceId];
    if (!form?.nombre?.trim()) {
      setError("El titulo del servicio es obligatorio");
      return;
    }

    setSaving(true);
    try {
      await updateService(serviceId, {
        nombre: form.nombre.trim(),
        duracionMinutos: Number(form.duracionMinutos),
        precio: Number(form.precio),
      });
      setSuccess("Servicio actualizado");
      await loadServices();
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Elimina un servicio si no esta asociado a reservas existentes.
   */
  const handleDelete = async (serviceId) => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await deleteService(serviceId);
      setSuccess("Servicio eliminado");
      await loadServices();
    } catch (err) {
      const apiError = mapApiError(err);
      if (apiError.status === 409 && apiError.title === "SERVICE_IN_USE") {
        setError("No se puede borrar: este servicio ya esta asociado a reservas");
      } else {
        setError(apiError.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative -mx-md -my-lg overflow-hidden px-md py-lg sm:-mx-lg sm:-my-xl sm:px-lg sm:py-xl lg:-mx-xl lg:px-xl">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#fbf7ef]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_18%,rgba(201,151,62,0.12),transparent_30%),radial-gradient(circle_at_86%_34%,rgba(201,151,62,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(251,247,239,0.76))]" />
      <div className="pointer-events-none fixed -left-28 top-48 -z-10 h-[34rem] w-[34rem] rounded-full border border-accent/10" />
      <div className="pointer-events-none fixed right-4 top-28 -z-10 hidden h-32 w-32 bg-[radial-gradient(circle,rgba(201,151,62,0.28)_1px,transparent_1.5px)] bg-[length:14px_14px] opacity-25 lg:block" />
      <div className="pointer-events-none fixed -right-32 bottom-6 -z-10 h-[28rem] w-[28rem] rounded-full border border-accent/20" />

      <div className="mx-auto max-w-6xl space-y-7 sm:space-y-8">
        <Card title="Nuevo servicio" subtitle="Define nombre, duración y precio" className={`${premiumCardClass} animate-fade-up`} contentClassName="p-7 sm:p-8">
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
            <Input
              id="createServicioNombre"
              label="Nombre del servicio"
              value={createForm.nombre}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, nombre: event.target.value }))}
              placeholder="Ej: Corte clásico"
              icon={<FieldIcon type="service" />}
              inputClassName={premiumInputClass}
              required
            />
            <Input
              id="createServicioDuracion"
              label="Duración (minutos)"
              type="number"
              min="1"
              value={createForm.duracionMinutos}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, duracionMinutos: event.target.value }))
              }
              icon={<FieldIcon type="clock" />}
              inputClassName={premiumInputClass}
            />
            <Input
              id="createServicioPrecio"
              label="Precio (€)"
              type="number"
              min="0.01"
              step="0.01"
              value={createForm.precio}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, precio: event.target.value }))}
              icon={<FieldIcon type="price" />}
              inputClassName={premiumInputClass}
            />
            <PrimaryButton type="submit" loading={saving} className="lg:w-auto">
              Añadir servicio
            </PrimaryButton>
          </form>
        </Card>

        {error ? <Alert tone="error">{error}</Alert> : null}
        {success ? <Alert tone="success">{success}</Alert> : null}

        <Card title="Listado de servicios" subtitle="Edita o elimina servicios existentes" className={`${premiumCardClass} animate-fade-up`} contentClassName="p-7 sm:p-8" style={{ animationDelay: "50ms" }}>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-[1.5rem]" />
              ))}
            </div>
          ) : null}

          {!loading && services.length === 0 ? (
            <div className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-2 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.45)]">
              <EmptyState
                title="Sin servicios"
                description="Crea tu primer servicio para comenzar a recibir reservas."
                icon=""
              />
            </div>
          ) : null}

          {!loading && services.length > 0 ? (
            <div className="grid gap-4">
              {services.map((service, idx) => {
                const form = editForms[service.id] || { nombre: "", duracionMinutos: "", precio: "" };
                return (
                  <div
                    key={service.id}
                    className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-5 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-elegant animate-fade-up sm:p-6"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="grid gap-4 md:grid-cols-[1.6fr_0.8fr_0.8fr_auto_auto] md:items-end">
                      <Input
                        id={`service-${service.id}-nombre`}
                        label="Nombre"
                        value={form.nombre}
                        onChange={(event) =>
                          setEditForms((prev) => ({
                            ...prev,
                            [service.id]: { ...form, nombre: event.target.value },
                          }))
                        }
                        icon={<FieldIcon type="service" />}
                        inputClassName={premiumInputClass}
                      />
                      <Input
                        id={`service-${service.id}-duracion`}
                        label="Min."
                        type="number"
                        min="1"
                        value={form.duracionMinutos}
                        onChange={(event) =>
                          setEditForms((prev) => ({
                            ...prev,
                            [service.id]: { ...form, duracionMinutos: event.target.value },
                          }))
                        }
                        icon={<FieldIcon type="clock" />}
                        inputClassName={premiumInputClass}
                      />
                      <Input
                        id={`service-${service.id}-precio`}
                        label="Precio (€)"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.precio}
                        onChange={(event) =>
                          setEditForms((prev) => ({
                            ...prev,
                            [service.id]: { ...form, precio: event.target.value },
                          }))
                        }
                        icon={<FieldIcon type="price" />}
                        inputClassName={premiumInputClass}
                      />
                      <PrimaryButton onClick={() => handleUpdate(service.id)} loading={saving} className="min-h-12 px-md py-2.5 text-xs md:w-auto">
                        Guardar
                      </PrimaryButton>
                      <DangerButton
                        onClick={() => handleDelete(service.id)}
                        loading={saving}
                        className="min-h-12 px-md py-2.5 text-xs md:w-auto"
                      >
                        Eliminar
                      </DangerButton>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
