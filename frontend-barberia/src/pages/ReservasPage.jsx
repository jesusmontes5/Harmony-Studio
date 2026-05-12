import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createReservation,
  getAvailability,
  listBarbers,
  listMyReservations,
  listServices,
  updateReservationStatus,
} from "../api/reservasApi";
import { listBarberReviews } from "../api/reviewsApi";
import { mapApiError } from "../api/apiClient";
import { BarberReviewsPanel } from "../components/reviews/BarberReviewsPanel";
import { ReviewFormModal } from "../components/reviews/ReviewFormModal";
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
import { useNotificationMessage } from "../hooks/useNotifications";
import { premiumCardClass, premiumInputClass, premiumSecondaryButtonClass } from "../styles/uiClasses";

/**
 * Cabecera compacta para separar los pasos del flujo de reserva.
 */
function StepHeader({ number, title, tone = "primary" }) {
  const isAccent = tone === "accent";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-accent/12 bg-gradient-to-br from-white via-white to-accent/5 px-4 py-3 shadow-[0_16px_32px_-28px_rgba(17,24,39,0.45)]">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white shadow-[0_14px_26px_-18px_rgba(17,24,39,0.9)] ${
          isAccent ? "bg-accent" : "bg-gradient-to-br from-primary to-[#070b16]"
        }`}
      >
        {number}
      </span>
      <p className={`text-xs font-extrabold uppercase tracking-[0.22em] ${isAccent ? "text-accent" : "text-primary"}`}>
        {title}
      </p>
    </div>
  );
}

/**
 * Devuelve el icono lineal correspondiente al tipo de campo mostrado.
 */
function FieldIcon({ type }) {
  const common = "h-5 w-5";

  if (type === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
        <path d="M7 4v3M17 4v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="4.5" y="6" width="15" height="13" rx="2.4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5 10h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
      <path d="M6 7.5h12M6 12h12M6 16.5h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Convierte una fecha JavaScript al formato admitido por input type="date".
 */
function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Formatea una fecha/hora ISO para mostrarla al usuario.
 */
function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

/**
 * Resuelve el texto de fecha de una reserva, incluyendo citas pendientes de hora.
 */
function formatReservationDateTime(reserva) {
  if (reserva.fechaInicio) return formatDateTime(reserva.fechaInicio);
  if (reserva.fecha) return `${new Date(`${reserva.fecha}T00:00:00`).toLocaleDateString()} - Pendiente de hora`;
  return "Pendiente de hora";
}

/**
 * Comprueba si la reserva ya esta dentro de la ventana no cancelable de 24 horas.
 */
function isCancellationWindowClosed(reserva) {
  const startDate = new Date(reserva.fechaInicio);
  if (Number.isNaN(startDate.getTime())) {
    return true;
  }
  const cancelLimit = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return startDate <= cancelLimit;
}

/**
 * Indica si una reserva puede cancelarse segun su estado y fecha.
 */
function canCancelReserva(reserva) {
  return reserva.estado === "PENDIENTE" && !isCancellationWindowClosed(reserva);
}

/**
 * Identifica reservas que bloquean la creacion de una nueva cita activa.
 */
function isActiveReservation(reserva) {
  return reserva.estado === "PENDIENTE" || reserva.estado === "PENDIENTE_HORA";
}

/**
 * Traduce el estado funcional de la reserva al tono visual del badge.
 */
function getEstadoTone(estado) {
  if (estado === "COMPLETADA") return "success";
  if (estado === "PENDIENTE" || estado === "PENDIENTE_HORA") return "warning";
  if (estado === "CANCELADA" || estado === "NO_PRESENTADO") return "danger";
  return "neutral";
}

/**
 * Convierte el estado tecnico de backend en una etiqueta legible.
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
 * Pagina de cliente para crear reservas, consultar historial y dejar resenas.
 */
export function ReservasPage() {
  const [barberos, setBarberos] = useState([]);
  const [barberoId, setBarberoId] = useState(null);
  const [fecha, setFecha] = useState(toDateInputValue(new Date()));
  const [services, setServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [reservas, setReservas] = useState([]);
  const [reservasLoading, setReservasLoading] = useState(false);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("No puedo asistir");
  const [selectedReviewReserva, setSelectedReviewReserva] = useState(null);
  const [reviewsByBarber, setReviewsByBarber] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  useNotificationMessage(
    feedback?.text,
    feedback?.type === "success" ? "success" : "error",
    feedback?.type === "success" ? "Listo" : "Revisa la reserva"
  );

  useEffect(() => {
    /**
     * Carga servicios y barberos necesarios para iniciar el formulario.
     */
    const fetchInitialData = async () => {
      try {
        const [servicesData, barbersData] = await Promise.all([listServices(), listBarbers()]);
        setServices(servicesData || []);
        setBarberos(barbersData || []);

        if (barbersData?.length > 0) {
          setBarberoId(barbersData[0].id);
        }
      } catch (error) {
        const mapped = mapApiError(error);
        setFeedback({ type: "error", text: mapped.message });
      }
    };

    fetchInitialData();
  }, []);

  /**
   * Recupera las reservas del cliente autenticado.
   */
  const fetchReservas = async () => {
    setReservasLoading(true);
    try {
      const data = await listMyReservations();
      setReservas(data || []);
    } catch (error) {
      const mapped = mapApiError(error);
      setFeedback({ type: "error", text: mapped.message });
    } finally {
      setReservasLoading(false);
    }
  };

  /**
   * Consulta huecos disponibles para el barbero, fecha y servicios seleccionados.
   */
  const refreshAvailability = useCallback(async () => {
    if (!fecha || !barberoId) {
      setSlots([]);
      return;
    }

    setAvailabilityLoading(true);
    try {
      const data = await getAvailability({
        barberoId,
        fecha,
        servicios: selectedServiceIds,
      });
      setSlots(data?.slots || []);
    } catch (error) {
      const mapped = mapApiError(error);
      setFeedback({ type: "error", text: mapped.message });
      setSlots([]);
    } finally {
      setAvailabilityLoading(false);
    }
  }, [barberoId, fecha, selectedServiceIds]);

  useEffect(() => {
    fetchReservas();
  }, []);

  useEffect(() => {
    setSelectedSlot(null);
    refreshAvailability();
  }, [refreshAvailability]);

  const fetchBarberReviews = useCallback(
    async (targetBarberoId = barberoId, showLoading = true) => {
      if (!targetBarberoId) return null;
      if (showLoading) {
        setReviewsLoading(true);
      }
      setReviewsError("");
      try {
        const data = await listBarberReviews(targetBarberoId);
        setReviewsByBarber((prev) => ({ ...prev, [targetBarberoId]: data }));
        return data;
      } catch (error) {
        const mapped = mapApiError(error);
        setReviewsError(mapped.message);
        return null;
      } finally {
        if (showLoading) {
          setReviewsLoading(false);
        }
      }
    },
    [barberoId]
  );

  useEffect(() => {
    if (barberoId) {
      fetchBarberReviews(barberoId);
    }
  }, [barberoId, fetchBarberReviews]);

  const availableSlots = useMemo(() => slots.filter((slot) => slot.available), [slots]);
  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(service.id)),
    [services, selectedServiceIds]
  );
  const selectedDurationMinutes = useMemo(
    () => selectedServices.reduce((total, service) => total + Number(service.duracionMinutos || 0), 0),
    [selectedServices]
  );
  const selectedServiceNames = useMemo(
    () => selectedServices.map((service) => service.nombre),
    [selectedServices]
  );

  const selectedBarberReviews = reviewsByBarber[barberoId] || null;
  const activeReservation = useMemo(
    () => reservas.find(isActiveReservation) || null,
    [reservas]
  );
  const historyReservations = useMemo(
    () => reservas.filter((reserva) => reserva.id !== activeReservation?.id),
    [reservas, activeReservation]
  );

  const hasReviewForReserva = useCallback(
    (reserva) => {
      const barberoReviews = reviewsByBarber[reserva.barberoId];
      if (!barberoReviews?.reviews?.length) return false;
      return barberoReviews.reviews.some((review) => review.reservaId === reserva.id);
    },
    [reviewsByBarber]
  );

  /**
   * Alterna un servicio dentro de la seleccion actual.
   */
  const toggleService = (serviceId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  /**
   * Actualiza el hueco horario seleccionado desde el selector de disponibilidad.
   */
  const handleSlotSelect = (event) => {
    const nextStart = event.target.value;
    if (!nextStart) {
      setSelectedSlot(null);
      return;
    }

    const found = availableSlots.find((slot) => slot.start === nextStart) || null;
    setSelectedSlot(found);
  };

  /**
   * Valida el formulario y crea la reserva en backend.
   */
  const handleReservar = async () => {
    setFeedback(null);

    if (activeReservation) {
      setFeedback({
        type: "error",
        text: "Ya tienes una reserva activa. Cancela o completa tu cita actual antes de crear otra.",
      });
      return;
    }

    if (!barberoId) {
      setFeedback({ type: "error", text: "No hay barberos disponibles" });
      return;
    }

    if (!selectedSlot) {
      setFeedback({ type: "error", text: "Selecciona una hora disponible" });
      return;
    }

    if (selectedServiceIds.length === 0) {
      setFeedback({ type: "error", text: "Selecciona al menos un servicio" });
      return;
    }

    setSubmitLoading(true);

    try {
      await createReservation({
        barberoId: Number(barberoId),
        fechaInicio: selectedSlot.start,
        servicios: selectedServiceIds.map((servicioId) => ({ servicioId })),
      });

      setFeedback({ type: "success", text: "Reserva creada correctamente" });
      setSelectedSlot(null);
      await Promise.all([refreshAvailability(), fetchReservas()]);
    } catch (error) {
      const mapped = mapApiError(error);
      setFeedback({ type: "error", text: mapped.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Abre el modal de cancelacion para recoger el motivo con interfaz propia.
   */
  const openCancelModal = (reserva) => {
    setCancelTarget(reserva);
    setCancelReason("No puedo asistir");
  };

  /**
   * Cierra el modal de cancelacion si no hay una peticion en curso.
   */
  const closeCancelModal = () => {
    if (cancelLoadingId) return;
    setCancelTarget(null);
    setCancelReason("No puedo asistir");
  };

  /**
   * Cancela una reserva activa usando el motivo introducido en el modal.
   */
  const handleCancelarReserva = async () => {
    const motivo = cancelReason.trim();
    if (!cancelTarget?.id || !motivo) return;

    setFeedback(null);
    setCancelLoadingId(cancelTarget.id);

    try {
      await updateReservationStatus(cancelTarget.id, {
        estado: "CANCELADA",
        motivoCancelacion: motivo,
      });

      setFeedback({ type: "success", text: "Reserva cancelada. Ya puedes pedir una nueva cita." });
      closeCancelModal();
      await Promise.all([fetchReservas(), refreshAvailability()]);
    } catch (error) {
      const mapped = mapApiError(error);
      setFeedback({ type: "error", text: mapped.message });
    } finally {
      setCancelLoadingId(null);
    }
  };

  /**
   * Refresca las resenas tras crear una nueva valoracion.
   */
  const handleReviewCreated = async (reserva) => {
    setFeedback({ type: "success", text: "Resena enviada" });
    await fetchBarberReviews(reserva.barberoId, false);
    if (barberoId === reserva.barberoId) {
      await fetchBarberReviews(barberoId, true);
    }
  };

  return (
    <div className="relative -mx-md -my-lg overflow-hidden bg-[#fbf7ef] px-md py-lg sm:-mx-lg sm:-my-xl sm:px-lg sm:py-xl lg:-mx-xl lg:px-xl">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#fbf7ef]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_18%,rgba(201,151,62,0.12),transparent_30%),radial-gradient(circle_at_86%_34%,rgba(201,151,62,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(251,247,239,0.76))]" />
      <div className="pointer-events-none fixed -left-28 top-48 -z-10 h-[34rem] w-[34rem] rounded-full border border-accent/10" />
      <div className="pointer-events-none fixed right-4 top-28 -z-10 hidden h-32 w-32 bg-[radial-gradient(circle,rgba(201,151,62,0.28)_1px,transparent_1.5px)] bg-[length:14px_14px] opacity-25 lg:block" />
      <div className="pointer-events-none fixed -right-32 bottom-6 -z-10 h-[28rem] w-[28rem] rounded-full border border-accent/20" />

      <div className="mx-auto max-w-7xl space-y-7 sm:space-y-8">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
          <Card
            title="1. Nueva reserva"
            subtitle="Configura tu cita"
            className={`${premiumCardClass} animate-fade-up`}
            contentClassName="p-6 sm:p-8"
          >
            <div className="space-y-6">
              <StepHeader number="1" title="Paso 1: Profesional y dia" />

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  id="barberoId"
                  label="Barbero"
                  as="select"
                  value={barberoId ?? ""}
                  onChange={(e) => setBarberoId(Number(e.target.value))}
                  disabled={barberos.length === 0}
                  icon={<FieldIcon type="user" />}
                  inputClassName={premiumInputClass}
                >
                  {barberos.length === 0 ? <option value="">Sin barberos disponibles</option> : null}
                  {barberos.map((barbero) => (
                    <option key={barbero.id} value={barbero.id}>
                      {barbero.nombre}
                    </option>
                  ))}
                </Input>

                <Input
                  id="fechaReserva"
                  label="Dia"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  icon={<FieldIcon type="calendar" />}
                  inputClassName={premiumInputClass}
                />
              </div>

              <StepHeader number="2" title="Paso 2: Servicios" tone="accent" />

              <div>
                <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-text/62">
                  Selecciona servicios
                </p>
                <div className="grid gap-3 rounded-[1.35rem] border border-accent/12 bg-gradient-to-br from-white via-white to-accent/5 p-3 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.45)] sm:p-4">
                  {services.map((service, idx) => {
                    const selected = selectedServiceIds.includes(service.id);
                    return (
                      <label
                        key={service.id}
                        className={`group flex min-h-[4.25rem] cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm transition-all duration-200 animate-fade-up ${
                          selected
                            ? "border-accent/55 bg-accent/10 shadow-[0_18px_32px_-26px_rgba(201,151,62,0.75)]"
                            : "border-neutral-border/55 bg-white/86 hover:-translate-y-0.5 hover:border-accent/35 hover:bg-white"
                        }`}
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-primary transition-colors duration-200 group-hover:text-primary">
                            {service.nombre}
                          </span>
                          <span className="mt-1 block text-xs font-medium text-neutral-text/60">
                            {service.duracionMinutos}m · {service.precio}€
                          </span>
                        </span>
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-200 ${
                            selected
                              ? "border-accent bg-accent text-white shadow-[0_12px_22px_-14px_rgba(201,151,62,0.9)]"
                              : "border-neutral-border bg-white text-transparent group-hover:border-accent/45"
                          }`}
                        >
                          <span className="text-xs font-bold">✓</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleService(service.id)}
                          className="sr-only"
                        />
                      </label>
                    );
                  })}

                  {services.length === 0 ? (
                    <p className="rounded-2xl border border-neutral-border/60 bg-white/80 px-4 py-3 text-sm italic text-neutral-text">
                      No hay servicios disponibles.
                    </p>
                  ) : null}

                  {selectedServiceNames.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2 border-t border-neutral-border/40 pt-4">
                      <p className="w-full text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-text/62">
                        Seleccionados:
                      </p>
                      {selectedServiceNames.map((name, idx) => (
                        <Badge key={name} tone="accent" style={{ animationDelay: `${idx * 30}ms` }}>
                          {name}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <StepHeader number="3" title="Paso 3: Horario" />

              <div>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-primary">Hora disponible</p>
                    {availabilityLoading ? (
                      <p className="mt-1 text-xs font-medium text-neutral-text/60">Cargando disponibilidad...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="mt-1 text-xs font-medium text-neutral-text/60">
                        No hay horas disponibles para este dia/servicio.
                      </p>
                    ) : (
                      <p className="mt-1 text-xs font-medium text-neutral-text/60">
                        Se muestran solo huecos libres que caben completos
                        {selectedDurationMinutes > 0 ? ` (${selectedDurationMinutes} min).` : "."}
                      </p>
                    )}
                  </div>
                  <Badge tone={availableSlots.length > 0 ? "accent" : "neutral"}>
                    {availableSlots.length} hueco{availableSlots.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <select
                  id="reservaSlot"
                  value={selectedSlot?.start || ""}
                  onChange={handleSlotSelect}
                  disabled={availabilityLoading || availableSlots.length === 0}
                  className="sr-only"
                  aria-label="Hora disponible"
                >
                  <option value="">Selecciona una hora</option>
                  {availableSlots.map((slot) => (
                    <option key={slot.start} value={slot.start}>
                      {new Date(slot.start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </option>
                  ))}
                </select>

                <div className="rounded-[1.35rem] border border-accent/12 bg-gradient-to-br from-white via-white to-accent/5 p-3 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.45)] sm:p-4">
                  {availabilityLoading ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {availableSlots.map((slot, idx) => {
                        const selected = selectedSlot?.start === slot.start;
                        const label = new Date(slot.start).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        return (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`min-h-12 rounded-xl border px-3 text-sm font-bold transition-all duration-200 animate-fade-up focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${
                              selected
                                ? "border-accent bg-accent text-white shadow-[0_16px_28px_-18px_rgba(201,151,62,0.9)]"
                                : "border-neutral-border/65 bg-white/88 text-primary shadow-soft hover:-translate-y-0.5 hover:border-accent/45 hover:bg-white"
                            }`}
                            style={{ animationDelay: `${idx * 25}ms` }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-neutral-border/60 bg-white/80 px-4 py-5 text-sm font-medium text-neutral-text/65">
                      No hay horas disponibles para este dia/servicio.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-5 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/25 sm:p-6">
                <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
                  Resumen de tu reserva
                </p>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/80 bg-white/82 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-text/50">Servicios</p>
                    <p className={selectedServiceNames.length > 0 ? "mt-1 font-bold text-primary" : "mt-1 italic text-neutral-text/50"}>
                      {selectedServiceNames.length > 0
                        ? `${selectedServiceNames.length} seleccionado(s)`
                        : "Sin servicios seleccionados"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/82 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-text/50">Hora</p>
                    <p className={selectedSlot ? "mt-1 font-bold text-primary" : "mt-1 italic text-neutral-text/50"}>
                      {selectedSlot
                        ? new Date(selectedSlot.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Aun no has elegido hora"}
                    </p>
                  </div>
                </div>
              </div>

              {feedback ? (
                <Alert
                  tone={feedback.type === "success" ? "success" : "error"}
                  onClose={() => setFeedback(null)}
                  className="rounded-2xl border-white/75 bg-white/90 shadow-[0_18px_45px_-34px_rgba(17,24,39,0.45)]"
                >
                  {feedback.text}
                </Alert>
              ) : null}

              <PrimaryButton
                onClick={handleReservar}
                disabled={availabilityLoading || barberos.length === 0}
                loading={submitLoading}
                fullWidth
              >
                Confirmar reserva
              </PrimaryButton>
            </div>
          </Card>

          <Card
            title="2. Mis reservas"
            subtitle="Historial y estado actual"
            className={`${premiumCardClass} animate-fade-up`}
            contentClassName="p-6 sm:p-8"
            style={{ animationDelay: "50ms" }}
          >
            {reservasLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            ) : null}

            {!reservasLoading && reservas.length === 0 ? (
              <div className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-2 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.45)]">
                <EmptyState
                  title="Sin reservas aún"
                  description="Crea tu primera cita para comenzar."
                  icon=""
                />
              </div>
            ) : null}

            {!reservasLoading && reservas.length > 0 ? (
              <div className="space-y-5">
                {activeReservation ? (
                  <div className="rounded-[1.5rem] border border-accent/25 bg-gradient-to-br from-white via-white to-accent/8 p-5 shadow-[0_22px_55px_-38px_rgba(17,24,39,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">Proxima cita</p>
                        <h3 className="mt-2 truncate font-display text-xl font-bold text-primary">
                          Cita con {activeReservation.barberoNombre || "tu barbero"}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-neutral-text/70">
                          {formatReservationDateTime(activeReservation)}
                        </p>
                      </div>
                      <Badge tone={getEstadoTone(activeReservation.estado)}>
                        {formatEstadoReserva(activeReservation.estado)}
                      </Badge>
                    </div>

                    <div className="mt-5 grid gap-3 rounded-2xl border border-white/80 bg-white/82 p-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-text/50">Referencia</p>
                        <p className="mt-1 font-bold text-primary">#{activeReservation.id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-text/50">Barbero</p>
                        <p className="mt-1 font-bold text-primary">{activeReservation.barberoNombre || "Asignado"}</p>
                      </div>
                    </div>

                    {canCancelReserva(activeReservation) ? (
                      <DangerButton
                        loading={cancelLoadingId === activeReservation.id}
                        onClick={() => openCancelModal(activeReservation)}
                        fullWidth
                        className="mt-4"
                      >
                        Cancelar cita
                      </DangerButton>
                    ) : null}

                    {activeReservation.estado === "PENDIENTE" && isCancellationWindowClosed(activeReservation) ? (
                      <p className="mt-4 rounded-2xl border border-accent/25 bg-white/82 px-4 py-3 text-xs font-semibold text-accent">
                        No se puede cancelar con menos de 24 horas de antelacion.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-bold text-primary">Historial</h3>
                    <Badge tone="neutral">{historyReservations.length} citas</Badge>
                  </div>
                  {historyReservations.length === 0 ? (
                    <p className="rounded-2xl border border-neutral-border/60 bg-white/80 px-4 py-3 text-sm text-neutral-text/70">
                      Todavia no tienes citas anteriores.
                    </p>
                  ) : (
                    <div className="max-h-[28rem] overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
                      <ul className="grid gap-3">
                        {historyReservations.map((reserva, idx) => (
                          <li
                            key={reserva.id}
                            className="rounded-[1.35rem] border border-neutral-border/60 bg-white/86 shadow-[0_16px_36px_-30px_rgba(17,24,39,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-white animate-fade-up"
                            style={{ animationDelay: `${idx * 30}ms` }}
                          >
                            <details className="group">
                              <summary className="list-none cursor-pointer px-4 py-4 sm:px-5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate font-display text-lg font-bold text-primary">
                                      Cita con {reserva.barberoNombre || "tu barbero"}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-neutral-text/60">
                                      {formatReservationDateTime(reserva)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge tone={getEstadoTone(reserva.estado)} icon="">
                                      {formatEstadoReserva(reserva.estado)}
                                    </Badge>
                                    <span className="grid h-8 w-8 place-items-center rounded-full border border-neutral-border bg-white text-sm font-bold text-primary shadow-soft group-open:hidden">
                                      +
                                    </span>
                                    <span className="hidden h-8 w-8 place-items-center rounded-full border border-neutral-border bg-white text-sm font-bold text-primary shadow-soft group-open:grid">
                                      -
                                    </span>
                                  </div>
                                </div>
                              </summary>
                              <div className="border-t border-neutral-border/45 bg-accent/5 px-4 py-4 sm:px-5">
                                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-text/50">
                                  Referencia #{reserva.id}
                                </p>

                                {canCancelReserva(reserva) ? (
                                  <DangerButton
                                    loading={cancelLoadingId === reserva.id}
                                    onClick={() => openCancelModal(reserva)}
                                    fullWidth
                                    className="mt-4"
                                  >
                                    Cancelar cita
                                  </DangerButton>
                                ) : null}

                                {reserva.estado === "PENDIENTE" && isCancellationWindowClosed(reserva) ? (
                                  <p className="mt-4 rounded-2xl border border-accent/25 bg-white/82 px-4 py-3 text-xs font-semibold text-accent">
                                    No se puede cancelar con menos de 24 horas de antelacion.
                                  </p>
                                ) : null}

                                {reserva.estado === "COMPLETADA" ? (
                                  <div className="mt-4">
                                    {hasReviewForReserva(reserva) ? (
                                      <Badge tone="success" className="w-full justify-center text-center">
                                        Reseñada
                                      </Badge>
                                    ) : (
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setSelectedReviewReserva(reserva)}
                                        fullWidth
                                        className={premiumSecondaryButtonClass}
                                      >
                                        Dejar reseña
                                      </Button>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </details>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        <BarberReviewsPanel
          title="Resenas del barbero seleccionado"
          subtitle="Opiniones publicas del profesional elegido."
          loading={reviewsLoading}
          response={selectedBarberReviews}
          error={reviewsError}
          onRefresh={() => fetchBarberReviews(barberoId)}
        />

        <ReviewFormModal
          open={Boolean(selectedReviewReserva)}
          reserva={selectedReviewReserva}
          onClose={() => setSelectedReviewReserva(null)}
          onCreated={handleReviewCreated}
        />

        <Modal
          open={Boolean(cancelTarget)}
          title="Cancelar cita"
          onClose={closeCancelModal}
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                disabled={Boolean(cancelLoadingId)}
                onClick={closeCancelModal}
              >
                Volver
              </Button>
              <DangerButton
                type="button"
                className="w-full sm:w-auto"
                loading={cancelLoadingId === cancelTarget?.id}
                disabled={!cancelReason.trim()}
                onClick={handleCancelarReserva}
              >
                Confirmar cancelacion
              </DangerButton>
            </div>
          }
        >
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-neutral-text/80">
              Indica el motivo de cancelacion para dejar constancia en la reserva.
            </p>
            {cancelTarget ? (
              <div className="rounded-[1.35rem] border border-accent/15 bg-white/82 p-4 shadow-soft">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-neutral-text/50">
                  Reserva #{cancelTarget.id}
                </p>
                <h4 className="mt-2 font-display text-xl font-bold text-primary">
                  Cita con {cancelTarget.barberoNombre || "tu barbero"}
                </h4>
                <p className="mt-1 text-sm font-medium text-neutral-text/70">
                  {formatReservationDateTime(cancelTarget)}
                </p>
              </div>
            ) : null}
            <Input
              id="cancelReason"
              label="Motivo de cancelacion"
              as="textarea"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="Ej: No puedo asistir"
              required
            />
          </div>
        </Modal>
      </div>
    </div>
  );
}
