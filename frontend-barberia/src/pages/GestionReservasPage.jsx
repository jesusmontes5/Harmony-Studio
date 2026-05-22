import { useCallback, useEffect, useMemo, useState } from "react";
import { mapApiError } from "../api/apiClient";
import { getAgendaDia } from "../api/agendaApi";
import { assignReservationTime, updateReservationStatus } from "../api/reservasApi";
import { useAuth } from "../hooks/useAuth";
import { useNotificationMessage } from "../hooks/useNotifications";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DangerButton } from "../components/ui/DangerButton";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { Skeleton } from "../components/ui/Skeleton";
import { premiumCardClass, premiumInputClass, premiumSecondaryButtonClass } from "../styles/uiClasses";

/**
 * Icono de calendario usado en el filtro de agenda diaria.
 */
function FieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M6.75 4.75v2.5M17.25 4.75v2.5M4.75 9.25h14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="4.75" y="6.75" width="14.5" height="12.5" rx="2.25" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

/**
 * Convierte una fecha al formato yyyy-MM-dd usado por el filtro diario.
 */
function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Muestra solo hora y minutos de una fecha/hora de reserva.
 */
function formatTime(dateValue) {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Suma minutos a una hora HH:mm:ss y devuelve una nueva hora HH:mm:ss.
 */
function addMinutes(timeText, minutes) {
  const [h, m] = timeText.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toTimeString().slice(0, 8);
}

/**
 * Divide los tramos horarios del barbero en slots visuales de 30 minutos.
 */
function generateSlots(horarios) {
  const slots = [];
  horarios.forEach((horario) => {
    let current = horario.horaInicio;
    while (current < horario.horaFin) {
      slots.push(current);
      const next = addMinutes(current, 30);
      if (next <= current) break;
      current = next;
    }
  });
  return slots;
}

/**
 * Busca la reserva que ocupa un slot concreto de la agenda diaria.
 */
function findReservationForSlot(reservas, fecha, slotTime) {
  const slotStart = new Date(`${fecha}T${slotTime}`);
  return reservas.find((reserva) => {
    if (!reserva.fechaInicio || !reserva.fechaFin) return false;
    const start = new Date(reserva.fechaInicio);
    const end = new Date(reserva.fechaFin);
    return slotStart >= start && slotStart < end;
  });
}

/**
 * Comprueba si el slot actual coincide con el inicio real de una reserva.
 */
function isReservationStartSlot(reserva, fecha, slotTime) {
  if (!reserva?.fechaInicio) return false;
  const start = new Date(reserva.fechaInicio);
  const slot = new Date(`${fecha}T${slotTime}`);
  return start.getHours() === slot.getHours() && start.getMinutes() === slot.getMinutes();
}

/**
 * Comprueba si un slot horario ya ha pasado respecto a la hora local actual.
 */
function isPastSlot(fecha, slotTime) {
  return new Date(`${fecha}T${slotTime}`) < new Date();
}

/**
 * Asocia estados de reserva con colores semanticos de interfaz.
 */
function getEstadoTone(estado) {
  if (estado === "COMPLETADA") return "success";
  if (estado === "PENDIENTE" || estado === "PENDIENTE_HORA") return "warning";
  if (estado === "CANCELADA" || estado === "NO_PRESENTADO") return "danger";
  return "neutral";
}

/**
 * Muestra estados de reserva con texto legible.
 */
function formatEstadoReserva(estado) {
  const labels = {
    PENDIENTE_HORA: "Pendiente de hora",
    PENDIENTE: "Pendiente",
    COMPLETADA: "Completada",
    CANCELADA: "Cancelada",
    NO_PRESENTADO: "No presentado",
  };
  return labels[estado] || estado;
}

/**
 * Calcula la duracion total de los servicios de una reserva.
 */
function getReservationDurationMinutes(reserva) {
  /** Total de minutos contratados para calcular ocupacion en agenda. */
  const total = (reserva.servicios || []).reduce((sum, service) => sum + Number(service.duracionAplicadaMinutos || 0), 0);
  return total > 0 ? total : 30;
}

/**
 * Devuelve true si una reserva con hora bloquea agenda.
 */
function isBlockingReservation(reserva) {
  return reserva.estado !== "CANCELADA" && reserva.estado !== "PENDIENTE_HORA" && reserva.fechaInicio && reserva.fechaFin;
}

/**
 * Comprueba solape entre un candidato y las reservas con hora.
 */
function hasOverlap(reservas, start, end) {
  return reservas.filter(isBlockingReservation).some((reserva) => {
    const reservaStart = new Date(reserva.fechaInicio);
    const reservaEnd = new Date(reserva.fechaFin);
    return start < reservaEnd && end > reservaStart;
  });
}

/**
 * Calcula horas libres para asignar una cita pendiente.
 */
function buildAssignableSlots(horarios, reservas, fecha, durationMinutes) {
  const options = [];
  horarios.forEach((horario) => {
    let current = horario.horaInicio;
    while (current < horario.horaFin) {
      const next = addMinutes(current, durationMinutes);
      if (next > horario.horaFin) break;

      const start = new Date(`${fecha}T${current}`);
      const end = new Date(`${fecha}T${next}`);
      if (!hasOverlap(reservas, start, end) && start >= new Date()) {
        options.push(current);
      }

      const step = addMinutes(current, 30);
      if (step <= current) break;
      current = step;
    }
  });
  return options;
}

/**
 * GestionReservasPage - Página de gestión de reservas.
 * Permite a barberos/admin ver, filtrar y actualizar estado de reservas.
 * @page
 * @param {Object} props
 * @param {boolean} props.embedded - Si se renderiza como componente embebido
 * @param {number} props.refreshKey - Valor externo para forzar recarga de agenda
 * @returns {React.ReactElement}
 */
export function GestionReservasPage({ embedded = false, controlledFecha, onFechaChange, refreshKey = 0 }) {
  const { user } = useAuth();
  const [internalFecha, setInternalFecha] = useState(toDateInputValue(new Date()));
  const fecha = controlledFecha || internalFecha;
  const setFecha = onFechaChange || setInternalFecha;
  const [agenda, setAgenda] = useState({ horarios: [], reservas: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});
  const [selectedAssignSlots, setSelectedAssignSlots] = useState({});
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("Incidencia de agenda");

  useNotificationMessage(error, "error", "No se pudo cargar la agenda");
  useNotificationMessage(
    feedback?.text,
    feedback?.type === "success" ? "success" : "error",
    feedback?.type === "success" ? "Reserva actualizada" : "Revisa la reserva"
  );

  /**
   * Carga agenda diaria del barbero autenticado.
   */
  const loadAgenda = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");
    try {
      const data = await getAgendaDia({ barberoId: user.id, fecha });
      setAgenda({
        horarios: data?.horarios || [],
        reservas: data?.reservas || [],
      });
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [fecha, user?.id]);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda, refreshKey]);

  /**
   * Genera los slots visibles de la agenda a partir de los horarios.
   */
  const slots = useMemo(() => generateSlots(agenda.horarios), [agenda.horarios]);

  /**
   * Separa citas normales y citas pendientes de hora.
   */
  const timedReservations = useMemo(
    () => agenda.reservas.filter((reserva) => reserva.estado !== "PENDIENTE_HORA" && reserva.fechaInicio && reserva.fechaFin),
    [agenda.reservas]
  );
  const pendingTimeReservations = useMemo(
    () => agenda.reservas.filter((reserva) => reserva.estado === "PENDIENTE_HORA"),
    [agenda.reservas]
  );

  const assignableSlotsByReservation = useMemo(() => {
    const entries = pendingTimeReservations.map((reserva) => [
      reserva.id,
      buildAssignableSlots(agenda.horarios, timedReservations, fecha, getReservationDurationMinutes(reserva)),
    ]);
    return Object.fromEntries(entries);
  }, [agenda.horarios, fecha, pendingTimeReservations, timedReservations]);
  const visibleSlots = useMemo(
    () => slots.filter((slot) => findReservationForSlot(timedReservations, fecha, slot) || !isPastSlot(fecha, slot)),
    [fecha, slots, timedReservations]
  );

  /**
   * Cambia el estado de una reserva usando el payload final.
   */
  const performChangeStatus = async (reserva, estado, motivoCancelacion = "") => {
    let payload = { estado };

    if (estado === "CANCELADA") {
      const motivo = motivoCancelacion.trim();
      if (!motivo) return;
      payload = { ...payload, motivoCancelacion: motivo };
    }

    setFeedback(null);
    setStatusLoading((prev) => ({ ...prev, [reserva.id]: true }));

    try {
      await updateReservationStatus(reserva.id, payload);
      setFeedback({ type: "success", text: `Reserva #${reserva.id} actualizada a ${formatEstadoReserva(estado)}` });
      await loadAgenda();
    } catch (err) {
      const mapped = mapApiError(err);
      setFeedback({ type: "error", text: mapped.message });
    } finally {
      setStatusLoading((prev) => ({ ...prev, [reserva.id]: false }));
    }
  };

  /**
   * Decide si cambia estado directamente o abre el modal de cancelacion.
   */
  const handleChangeStatus = async (reserva, estado) => {
    if (estado === "CANCELADA") {
      setCancelTarget(reserva);
      setCancelReason("Incidencia de agenda");
      return;
    }
    await performChangeStatus(reserva, estado);
  };

  /**
   * Cierra el modal de cancelacion del barbero.
   */
  const closeCancelModal = () => {
    if (cancelTarget && statusLoading[cancelTarget.id]) return;
    setCancelTarget(null);
    setCancelReason("Incidencia de agenda");
  };

  /**
   * Confirma la cancelacion desde el modal con el motivo indicado.
   */
  const confirmCancelReservation = async () => {
    if (!cancelTarget?.id || !cancelReason.trim()) return;
    await performChangeStatus(cancelTarget, "CANCELADA", cancelReason);
    setCancelTarget(null);
    setCancelReason("Incidencia de agenda");
  };

  /**
   * Asigna un tramo libre a una cita pendiente de hora.
   */
  const handleAssignTime = async (reserva) => {
    const horaInicio = selectedAssignSlots[reserva.id];
    if (!horaInicio) {
      setFeedback({ type: "error", text: "Selecciona una hora libre" });
      return;
    }

    const horaFin = addMinutes(horaInicio, getReservationDurationMinutes(reserva));
    setFeedback(null);
    setStatusLoading((prev) => ({ ...prev, [reserva.id]: true }));

    try {
      await assignReservationTime(reserva.id, { horaInicio, horaFin });
      setFeedback({ type: "success", text: "Hora asignada correctamente" });
      setSelectedAssignSlots((prev) => ({ ...prev, [reserva.id]: "" }));
      await loadAgenda();
    } catch (err) {
      const mapped = mapApiError(err);
      setFeedback({ type: "error", text: mapped.message });
    } finally {
      setStatusLoading((prev) => ({ ...prev, [reserva.id]: false }));
    }
  };

  return (
    <div className="space-y-5 sm:space-y-7">
      <Card
        title={embedded ? "Gestión de reservas" : "Agenda del día"}
        subtitle="Controla cada franja horaria y el estado de sus reservas"
        className={`${premiumCardClass} animate-fade-up`}
        contentClassName="p-7 sm:p-8"
        actions={
          <Input
            id="agendaFecha"
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
            className="w-full sm:min-w-52"
            icon={<FieldIcon />}
            inputClassName={premiumInputClass}
          />
        }
      >
        <div className="space-y-5">
          {feedback ? (
            <div className="animate-fade-up">
              <Alert tone={feedback.type === "success" ? "success" : "error"}>
                {feedback.text}
              </Alert>
            </div>
          ) : null}
          {error ? (
            <div className="animate-fade-up">
              <Alert tone="error">{error}</Alert>
            </div>
          ) : null}

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full rounded-[1.5rem]" />
              <Skeleton className="h-28 w-full rounded-[1.5rem]" />
            </div>
          ) : null}

          {!loading && !error && slots.length === 0 ? (
            <div className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-2 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.45)] animate-fade-up">
              <EmptyState
                title="Sin horario configurado"
                description="No hay tramos disponibles para la fecha seleccionada."
                icon=""
              />
            </div>
          ) : null}

          {!loading && !error && slots.length > 0 && visibleSlots.length === 0 ? (
            <div className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-2 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.45)] animate-fade-up">
              <EmptyState
                title="Sin tramos futuros"
                description="Los huecos libres de esta jornada ya han pasado."
                icon=""
              />
            </div>
          ) : null}

          {!loading && !error && pendingTimeReservations.length > 0 ? (
            <section className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-5 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.5)] animate-fade-up sm:p-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold text-primary">Citas pendientes</h3>
                  <p className="mt-1 text-sm text-neutral-text/70">Asigna una hora dentro de los tramos libres del dia.</p>
                </div>
                <Badge tone="warning">{pendingTimeReservations.length}</Badge>
              </div>
              <ul className="grid gap-4">
                {pendingTimeReservations.map((reserva) => {
                  const assignableSlots = assignableSlotsByReservation[reserva.id] || [];
                  /** Texto de servicios asociado a la cita pendiente de hora. */
                  const servicios = (reserva.servicios || []).map((service) => service.nombreServicio).join(", ") || "Servicio";
                  return (
                    <li
                      key={reserva.id}
                      className="rounded-[1.25rem] border border-neutral-border/60 bg-white/88 p-4 shadow-soft transition-all duration-200 hover:border-accent/30 hover:bg-white sm:p-5"
                    >
                      <div className="grid gap-4 lg:grid-cols-[1fr_260px_auto] lg:items-end">
                        <div>
                          <p className="font-display text-lg font-bold text-primary">{reserva.clienteNombre}</p>
                          <p className="mt-1 text-sm font-semibold text-neutral-text/75">{servicios}</p>
                          <p className="mt-2 text-sm text-neutral-text/70">
                            {reserva.observacionesCliente || "Sin notas"}
                          </p>
                        </div>
                        <label className="grid gap-2 text-sm font-bold text-primary">
                          Hora libre
                          <select
                            value={selectedAssignSlots[reserva.id] || ""}
                            onChange={(event) =>
                              setSelectedAssignSlots((prev) => ({ ...prev, [reserva.id]: event.target.value }))
                            }
                            disabled={assignableSlots.length === 0}
                            className={`${premiumInputClass} w-full disabled:cursor-not-allowed disabled:bg-neutral/70 disabled:text-neutral-text`}
                          >
                            <option value="">
                              {assignableSlots.length === 0 ? "Sin tramos libres" : "Selecciona hora"}
                            </option>
                            {assignableSlots.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot.slice(0, 5)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                          <PrimaryButton
                            loading={statusLoading[reserva.id]}
                            disabled={assignableSlots.length === 0 || !selectedAssignSlots[reserva.id]}
                            onClick={() => handleAssignTime(reserva)}
                            className="min-h-12 px-md py-2.5 text-xs lg:w-auto"
                          >
                            Asignar
                          </PrimaryButton>
                          <DangerButton
                            loading={statusLoading[reserva.id]}
                            onClick={() => handleChangeStatus(reserva, "CANCELADA")}
                            className="min-h-12 px-md py-2.5 text-xs lg:w-auto"
                          >
                            Cancelar
                          </DangerButton>
                        </div>
                      </div>
                      {assignableSlots.length === 0 ? (
                        <p className="mt-3 text-sm font-medium text-neutral-text/65">
                          Abre un tramo horario libre para poder asignar esta cita.
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {!loading && !error && visibleSlots.length > 0 ? (
            <ul className="grid gap-4">
              {visibleSlots.map((slot, idx) => {
                const reserva = findReservationForSlot(timedReservations, fecha, slot);
                return (
                  <li 
                    key={slot} 
                    className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-5 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-elegant animate-fade-up sm:p-6"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-gradient-to-br from-primary/10 to-accent/10 font-bold text-primary shadow-soft">
                          {slot.slice(0, 5)}
                        </span>
                        <span className="text-sm font-semibold text-neutral-text/70">
                          {reserva ? "Con reserva" : "Disponible"}
                        </span>
                      </div>
                      <Badge tone={reserva ? getEstadoTone(reserva.estado) : "success"}>
                        {reserva ? formatEstadoReserva(reserva.estado) : "Libre"}
                      </Badge>
                    </div>

                    {reserva ? (
                      <div className="mt-5 space-y-4 border-t border-neutral-border/40 pt-4">
                        <div className="grid gap-2">
                          <p className="font-display font-bold text-primary">{reserva.clienteNombre}</p>
                          <p className="text-sm text-neutral-text">
                            {formatTime(reserva.fechaInicio)} - {formatTime(reserva.fechaFin)}
                          </p>
                          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-text/50">
                            Referencia #{reserva.id}
                          </p>
                        </div>

                        {isReservationStartSlot(reserva, fecha, slot) ? (
                          <div className="flex flex-wrap gap-2 pt-3">
                            {reserva.estado === "PENDIENTE" ? (
                              <>
                                <PrimaryButton
                                  loading={statusLoading[reserva.id]}
                                  onClick={() => handleChangeStatus(reserva, "COMPLETADA")}
                                  className="min-h-12 px-md py-2.5 text-xs sm:w-auto"
                                >
                                  Completar
                                </PrimaryButton>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  loading={statusLoading[reserva.id]}
                                  onClick={() => handleChangeStatus(reserva, "NO_PRESENTADO")}
                                  className={`w-full sm:w-auto ${premiumSecondaryButtonClass}`}
                                >
                                  No presentado
                                </Button>
                              </>
                            ) : null}

                            {reserva.estado === "PENDIENTE" ? (
                              <DangerButton
                                loading={statusLoading[reserva.id]}
                                onClick={() => handleChangeStatus(reserva, "CANCELADA")}
                                className="min-h-12 px-md py-2.5 text-xs sm:w-auto"
                              >
                                Cancelar
                              </DangerButton>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </Card>

      <Modal
        open={Boolean(cancelTarget)}
        title="Cancelar reserva"
        onClose={closeCancelModal}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={cancelTarget ? Boolean(statusLoading[cancelTarget.id]) : false}
              onClick={closeCancelModal}
            >
              Volver
            </Button>
            <DangerButton
              type="button"
              className="w-full sm:w-auto"
              loading={cancelTarget ? Boolean(statusLoading[cancelTarget.id]) : false}
              disabled={!cancelReason.trim()}
              onClick={confirmCancelReservation}
            >
              Confirmar cancelacion
            </DangerButton>
          </div>
        }
      >
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-neutral-text/80">
            Indica el motivo para cancelar esta reserva. El cambio quedara registrado en el historial.
          </p>
          {cancelTarget ? (
            <div className="rounded-[1.35rem] border border-accent/15 bg-white/82 p-4 shadow-soft">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-neutral-text/50">
                Reserva #{cancelTarget.id}
              </p>
              <h4 className="mt-2 font-display text-xl font-bold text-primary">
                {cancelTarget.clienteNombre || "Cliente"}
              </h4>
              <p className="mt-1 text-sm font-medium text-neutral-text/70">
                {cancelTarget.fechaInicio && cancelTarget.fechaFin
                  ? `${formatTime(cancelTarget.fechaInicio)} - ${formatTime(cancelTarget.fechaFin)}`
                  : "Cita pendiente de hora"}
              </p>
            </div>
          ) : null}
          <Input
            id="barberCancelReason"
            label="Motivo de cancelacion"
            as="textarea"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Ej: Incidencia de agenda"
            required
          />
        </div>
      </Modal>
    </div>
  );
}
