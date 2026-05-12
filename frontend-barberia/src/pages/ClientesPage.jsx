import { useEffect, useState } from "react";
import { mapApiError } from "../api/apiClient";
import { createPendingTimeReservation, listServices } from "../api/reservasApi";
import {
  approveRegistrationRequest,
  blockClient,
  listClients,
  listPendingRegistrationRequests,
  rejectRegistrationRequest,
  unblockClient,
} from "../api/userApi";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DangerButton } from "../components/ui/DangerButton";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../hooks/useAuth";
import { useNotificationMessage } from "../hooks/useNotifications";
import {
  premiumCardClass,
  premiumInputClass,
  premiumInteractiveSecondaryButtonClass as premiumSecondaryButtonClass,
} from "../styles/uiClasses";

const premiumModalInputClass =
  "h-14 rounded-2xl border-neutral-border/80 bg-white/95 px-lg shadow-[0_18px_42px_-32px_rgba(17,24,39,0.62)] placeholder:text-neutral-text/45 transition-all duration-200 hover:border-accent/40 hover:shadow-[0_20px_46px_-34px_rgba(17,24,39,0.68)] focus:border-accent focus:ring-accent/30 disabled:border-neutral-border/70 disabled:bg-neutral/65 disabled:text-neutral-text/70";

/**
 * Calcula iniciales para representar clientes sin avatar.
 */
function getInitials(name, fallback = "CL") {
  const source = String(name || fallback).trim();
  if (!source) return fallback;
  return source
    .split(" ")
    .slice(0, 2)
    .map((chunk) => chunk[0] || "")
    .join("")
    .toUpperCase();
}

/**
 * Icono decorativo usado en filtros y campos de clientes.
 */
function FieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M4.5 6.5h15M4.5 12h15M4.5 17.5h15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="6.5" cy="6.5" r="1.25" fill="currentColor" />
      <circle cx="6.5" cy="12" r="1.25" fill="currentColor" />
      <circle cx="6.5" cy="17.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

/**
 * Lista reutilizable para clientes activos o bloqueados con accion asociada.
 */
function ClientList({
  title,
  emptyText,
  clients,
  actionLabel,
  onAction,
  processingId,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <Card title={title} className={premiumCardClass} contentClassName="space-y-4 p-7 sm:p-8 animate-fade-up">
      {clients.length === 0 ? (
        <div className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-2 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.45)]">
          <EmptyState
            title="Sin clientes"
            description={emptyText}
            icon=""
          />
        </div>
      ) : (
        <ul className="grid max-h-[30rem] gap-4 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
          {clients.map((client, idx) => (
            <li
              key={client.id}
              className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-5 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-elegant animate-fade-up sm:p-6"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/80 bg-gradient-to-br from-primary to-[#070b16] text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(17,24,39,0.9)]">
                    {getInitials(client.nombre)}
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold text-primary">{client.nombre}</p>
                    <p className="mt-2 text-sm text-neutral-text/70">
                      <span className="font-semibold">Email:</span> {client.email}
                    </p>
                    <p className="text-sm text-neutral-text/70">
                      <span className="font-semibold">Teléfono:</span> {client.telefono || "No registrado"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  {secondaryActionLabel ? (
                    <PrimaryButton
                      onClick={() => onSecondaryAction(client)}
                      className="min-h-12 px-md py-2.5 text-xs sm:w-auto"
                    >
                      {secondaryActionLabel}
                    </PrimaryButton>
                  ) : null}
                  {actionLabel === "Bloquear" ? (
                    <DangerButton
                      onClick={() => onAction(client.id)}
                      loading={processingId === client.id}
                      className="min-h-12 px-md py-2.5 text-xs sm:w-auto"
                    >
                      {actionLabel}
                    </DangerButton>
                  ) : (
                    <PrimaryButton
                      onClick={() => onAction(client.id)}
                      loading={processingId === client.id}
                      className="min-h-12 px-md py-2.5 text-xs sm:w-auto"
                    >
                      {actionLabel}
                    </PrimaryButton>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/**
 * ClientesPage - Página de gestión de clientes.
 * Muestra listado de clientes, permite bloqueo/desbloqueo y búsqueda.
 * Acceso restringido a admin.
 * @page
 * @returns {React.ReactElement}
 */
export function ClientesPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "ADMIN";
  const [q, setQ] = useState("");
  const [activeClients, setActiveClients] = useState([]);
  const [blockedClients, setBlockedClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [approvalRoles, setApprovalRoles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [scheduleClient, setScheduleClient] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    fecha: "",
    servicioId: "",
    observacionesCliente: "",
  });
  const [scheduleErrors, setScheduleErrors] = useState({});
  const [scheduleSaving, setScheduleSaving] = useState(false);

  useNotificationMessage(error, "error", "Revisa clientes");
  useNotificationMessage(feedback, "success", "Clientes actualizado");
  useNotificationMessage(scheduleErrors.form, "error", "No se pudo programar la cita");

  /**
   * Carga clientes activos, bloqueados y solicitudes pendientes.
   */
  const loadData = async (query = "") => {
    setLoading(true);
    setError("");
    setFeedback("");
    try {
      const [activeData, blockedData, pendingData] = await Promise.all([
        listClients(query.trim(), true),
        listClients(query.trim(), false),
        listPendingRegistrationRequests(),
      ]);
      setActiveClients(activeData || []);
      setBlockedClients(blockedData || []);
      setPendingRequests(pendingData || []);
      setApprovalRoles((prev) => {
        const next = {};
        (pendingData || []).forEach((req) => {
          next[req.id] = prev[req.id] || "CLIENTE";
        });
        return next;
      });
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    listServices()
      .then((data) => setServices(data || []))
      .catch((err) => setError(mapApiError(err).message));
  }, []);

  /**
   * Aplica la busqueda de clientes evitando recargar la pagina.
   */
  const handleSearch = (event) => {
    event.preventDefault();
    loadData(q);
  };

  /**
   * Aprueba una solicitud de registro con el rol seleccionado.
   */
  const handleApprove = async (requestId) => {
    const selectedRole = isAdmin ? approvalRoles[requestId] || "CLIENTE" : "CLIENTE";
    setProcessingId(requestId);
    setError("");
    setFeedback("");
    try {
      await approveRegistrationRequest(requestId, selectedRole);
      setFeedback(`Solicitud aprobada como ${selectedRole.toLowerCase()}.`);
      await loadData(q);
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Rechaza una solicitud de registro pendiente.
   */
  const handleReject = async (requestId) => {
    const motivo = window.prompt("Motivo de rechazo:", "Datos incompletos")?.trim();
    if (!motivo) return;

    setProcessingId(requestId);
    setError("");
    setFeedback("");
    try {
      await rejectRegistrationRequest(requestId, motivo);
      setFeedback("Solicitud rechazada.");
      await loadData(q);
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Bloquea un cliente activo.
   */
  const handleBlockClient = async (clientId) => {
    const confirmed = window.confirm("Seguro que quieres bloquear a este cliente?");
    if (!confirmed) return;

    setProcessingId(clientId);
    setError("");
    setFeedback("");
    try {
      await blockClient(clientId);
      setFeedback("Cliente bloqueado correctamente.");
      await loadData(q);
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Reactiva un cliente bloqueado.
   */
  const handleUnblockClient = async (clientId) => {
    setProcessingId(clientId);
    setError("");
    setFeedback("");
    try {
      await unblockClient(clientId);
      setFeedback("Cliente desbloqueado correctamente.");
      await loadData(q);
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Abre el modal de cita pendiente para un cliente activo.
   */
  const openScheduleModal = (client) => {
    setScheduleClient(client);
    setScheduleForm({
      fecha: "",
      servicioId: "",
      observacionesCliente: "",
    });
    setScheduleErrors({});
  };

  /**
   * Crea una cita pendiente de hora desde clientes.
   */
  const handleCreatePendingTimeReservation = async () => {
    const nextErrors = {};
    if (!scheduleForm.fecha) nextErrors.fecha = "La fecha es obligatoria";
    if (!scheduleForm.servicioId) nextErrors.servicioId = "El servicio es obligatorio";
    if (Object.keys(nextErrors).length > 0) {
      nextErrors.form = "Completa los campos marcados para programar la cita.";
    }
    setScheduleErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !scheduleClient) return;

    setScheduleSaving(true);
    setError("");
    setFeedback("");
    try {
      await createPendingTimeReservation({
        clienteId: scheduleClient.id,
        fecha: scheduleForm.fecha,
        servicioId: Number(scheduleForm.servicioId),
        observacionesCliente: scheduleForm.observacionesCliente.trim() || null,
      });
      setFeedback("Cita pendiente de hora creada correctamente.");
      setScheduleClient(null);
      await loadData(q);
    } catch (err) {
      setScheduleErrors({ form: mapApiError(err).message });
    } finally {
      setScheduleSaving(false);
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
        <Card
          title="Búsqueda rápida"
          subtitle="Filtra por nombre, email o teléfono"
          className={`${premiumCardClass} animate-fade-up`}
          contentClassName="space-y-4 p-7 sm:p-8"
        >
          <form onSubmit={handleSearch} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Input
              id="clientsSearch"
              label="Buscar cliente"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Nombre, email o teléfono..."
              icon={<FieldIcon />}
              inputClassName={premiumInputClass}
            />
            <PrimaryButton type="submit" loading={loading} className="sm:w-auto">
              Buscar
            </PrimaryButton>
          </form>
        </Card>

        {error ? <Alert tone="error">{error}</Alert> : null}
        {feedback ? <Alert tone="success">{feedback}</Alert> : null}

        <Modal
          open={Boolean(scheduleClient)}
          title="Programar cita"
          onClose={() => (scheduleSaving ? null : setScheduleClient(null))}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setScheduleClient(null)}
                disabled={scheduleSaving}
                className={`min-h-12 w-full px-7 sm:w-auto ${premiumSecondaryButtonClass}`}
              >
                Cancelar
              </Button>
              <PrimaryButton
                type="button"
                loading={scheduleSaving}
                onClick={handleCreatePendingTimeReservation}
                className="min-h-12 px-8 text-xs sm:w-auto"
              >
                Guardar
              </PrimaryButton>
            </div>
          }
        >
          <div className="space-y-6">
            {scheduleErrors.form ? <Alert tone="error">{scheduleErrors.form}</Alert> : null}
            <Input
              id="scheduleClient"
              label="Cliente"
              value={scheduleClient?.nombre || ""}
              disabled
              icon={<FieldIcon />}
              inputClassName={premiumModalInputClass}
            />
            <Input
              id="scheduleDate"
              label="Fecha"
              type="date"
              value={scheduleForm.fecha}
              onChange={(event) => setScheduleForm((prev) => ({ ...prev, fecha: event.target.value }))}
              required
              error={scheduleErrors.fecha}
              inputClassName={premiumModalInputClass}
            />
            <Input
              id="scheduleService"
              label="Servicio"
              as="select"
              value={scheduleForm.servicioId}
              onChange={(event) => setScheduleForm((prev) => ({ ...prev, servicioId: event.target.value }))}
              required
              error={scheduleErrors.servicioId}
              inputClassName={premiumModalInputClass}
            >
              <option value="">Selecciona un servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.nombre}
                </option>
              ))}
            </Input>
            <Input
              id="scheduleComment"
              label="Comentario opcional"
              as="textarea"
              value={scheduleForm.observacionesCliente}
              onChange={(event) =>
                setScheduleForm((prev) => ({
                  ...prev,
                  observacionesCliente: event.target.value,
                }))
              }
              placeholder="Comentario opcional"
              maxLength={255}
              inputClassName="min-h-28 rounded-2xl border-neutral-border/80 bg-white/95 px-lg shadow-[0_18px_42px_-32px_rgba(17,24,39,0.62)] placeholder:text-neutral-text/45 transition-all duration-200 hover:border-accent/40 hover:shadow-[0_20px_46px_-34px_rgba(17,24,39,0.68)] focus:border-accent focus:ring-accent/30"
            />
          </div>
        </Modal>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-[1.5rem]" />
            ))}
          </div>
        ) : null}

        {!loading && (
          <Card
            title="Solicitudes pendientes"
            subtitle={pendingRequests.length > 0 ? `${pendingRequests.length} solicitud(es)` : ""}
            className={`${premiumCardClass} animate-fade-up`}
            contentClassName="p-7 sm:p-8"
            style={{ animationDelay: "50ms" }}
          >
            {pendingRequests.length === 0 ? (
              <div className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-2 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.45)]">
                <EmptyState
                  title="Sin solicitudes"
                  description="No hay registros pendientes de aprobación."
                  icon=""
                />
              </div>
            ) : (
              <ul className="grid max-h-[30rem] gap-4 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
                {pendingRequests.map((req, idx) => (
                  <li
                    key={req.id}
                    className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-5 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-elegant animate-fade-up sm:p-6"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/80 bg-gradient-to-br from-primary to-[#070b16] text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(17,24,39,0.9)]">
                            {getInitials(req.nombre)}
                          </span>
                          <p className="font-display text-lg font-bold text-primary">{req.nombre}</p>
                        </div>
                        <p className="text-sm text-neutral-text/70">{req.email}</p>
                        <p className="text-sm text-neutral-text/70">{req.telefono || "No registrado"}</p>
                        {isAdmin && (
                          <div className="mt-3 border-t border-neutral-border/30 pt-3">
                            <label className="grid gap-2 text-xs">
                              <span className="font-bold uppercase tracking-widest text-neutral-text/70">Rol al aprobar</span>
                              <select
                                value={approvalRoles[req.id] || "CLIENTE"}
                                onChange={(event) =>
                                  setApprovalRoles((prev) => ({
                                    ...prev,
                                    [req.id]: event.target.value,
                                  }))
                                }
                                className="h-11 rounded-xl border border-neutral-border/80 bg-white/95 px-md text-sm font-semibold text-primary outline-none transition hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/30"
                              >
                                <option value="CLIENTE">Cliente</option>
                                <option value="BARBERO">Barbero</option>
                              </select>
                            </label>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:w-auto">
                        <PrimaryButton
                          loading={processingId === req.id}
                          onClick={() => handleApprove(req.id)}
                          className="min-h-12 px-md py-2.5 text-xs sm:w-auto"
                        >
                          Aprobar
                        </PrimaryButton>
                        <DangerButton
                          loading={processingId === req.id}
                          onClick={() => handleReject(req.id)}
                          className="min-h-12 px-md py-2.5 text-xs sm:w-auto"
                        >
                          Rechazar
                        </DangerButton>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {!loading ? (
          <div className="grid gap-5 xl:grid-cols-2">
            <ClientList
              title="Clientes activos"
              emptyText="No hay clientes activos."
              clients={activeClients}
              actionLabel="Bloquear"
              onAction={handleBlockClient}
              processingId={processingId}
              secondaryActionLabel="Programar cita"
              onSecondaryAction={openScheduleModal}
            />
            <ClientList
              title="Clientes bloqueados"
              emptyText="No hay clientes bloqueados."
              clients={blockedClients}
              actionLabel="Desbloquear"
              onAction={handleUnblockClient}
              processingId={processingId}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
