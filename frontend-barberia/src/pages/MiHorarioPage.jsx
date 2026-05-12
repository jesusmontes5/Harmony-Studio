import { useEffect, useMemo, useState } from "react";
import { mapApiError } from "../api/apiClient";
import { getBarberSchedule, replaceBarberSchedule } from "../api/scheduleApi";
import { useAuth } from "../hooks/useAuth";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { Skeleton } from "../components/ui/Skeleton";
import { useNotificationMessage } from "../hooks/useNotifications";
import { premiumCardClass, premiumInputClass, premiumSecondaryButtonClass } from "../styles/uiClasses";
import { GestionReservasPage } from "./GestionReservasPage";

/**
 * Devuelve el icono adecuado para campos de fecha u hora del horario.
 */
function FieldIcon({ type }) {
  const common = "h-5 w-5";

  if (type === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
        <path d="M6.75 4.75v2.5M17.25 4.75v2.5M4.75 9.25h14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="4.75" y="6.75" width="14.5" height="12.5" rx="2.25" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

/**
 * Adapta horas HH:mm:ss de API al formato HH:mm de los inputs.
 */
function toTimeInput(value) {
  if (!value) return "";
  return value.slice(0, 5);
}

/**
 * Adapta horas HH:mm del formulario al formato HH:mm:ss esperado por API.
 */
function toApiTime(value) {
  return `${value}:00`;
}

/**
 * Devuelve la fecha actual en formato yyyy-MM-dd para nuevas filas.
 */
function todayDateInput() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Suma minutos a una hora HH:mm y devuelve HH:mm, acotado al final del dia.
 */
function addMinutesToTimeInput(time, minutes) {
  const [hours, mins] = time.split(":").map(Number);
  const total = Math.min(hours * 60 + mins + minutes, 23 * 60 + 59);
  const nextHours = Math.floor(total / 60);
  const nextMinutes = total % 60;
  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
}

/**
 * Propone un tramo libre para poder anadir varios en el mismo dia sin solaparlos.
 */
function getNextDefaultSlot(rows, fecha) {
  const rowsForDate = rows
    .filter((row) => row.fecha === fecha && row.horaInicio && row.horaFin)
    .sort((a, b) => a.horaFin.localeCompare(b.horaFin));

  if (rowsForDate.length === 0) {
    return { horaInicio: "10:00", horaFin: "14:00" };
  }

  const lastEnd = rowsForDate[rowsForDate.length - 1].horaFin;
  const horaInicio = lastEnd >= "23:00" ? "23:00" : lastEnd;
  const horaFin = addMinutesToTimeInput(horaInicio, horaInicio >= "22:00" ? 59 : 240);
  return { horaInicio, horaFin };
}

/**
 * Ordena tramos horarios por fecha y hora de inicio antes de guardarlos.
 */
function sortByDateAndTime(rows) {
  return [...rows].sort((a, b) => {
    const dateDiff = a.fecha.localeCompare(b.fecha);
    if (dateDiff !== 0) return dateDiff;
    return a.horaInicio.localeCompare(b.horaInicio);
  });
}

/**
 * Detecta solapamientos entre tramos horarios de un mismo dia.
 */
function hasOverlaps(rows) {
  const grouped = rows.reduce((acc, row) => {
    if (!acc[row.fecha]) acc[row.fecha] = [];
    acc[row.fecha].push(row);
    return acc;
  }, {});

  return Object.values(grouped).some((items) => {
    const sorted = [...items].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    for (let i = 0; i < sorted.length - 1; i += 1) {
      if (sorted[i].horaFin > sorted[i + 1].horaInicio) return true;
    }
    return false;
  });
}

/**
 * MiHorarioPage - Pagina de gestion del horario del barbero.
 * Permite a barberos configurar su horario diario de trabajo.
 * @page
 * @returns {React.ReactElement}
 */
export function MiHorarioPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agendaFecha, setAgendaFecha] = useState(todayDateInput());
  const [agendaRefreshKey, setAgendaRefreshKey] = useState(0);

  useNotificationMessage(error, "error", "Revisa el horario");
  useNotificationMessage(success, "success", "Horario actualizado");

  /**
   * Habilita guardado cuando el barbero esta identificado, incluso si no quedan tramos.
   */
  const canSave = useMemo(() => Boolean(user?.id) && !saving, [saving, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    /**
     * Carga el horario del barbero y lo adapta al formato editable.
     */
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const schedule = await getBarberSchedule(user.id);
        /** Filas normalizadas para editar los tramos recibidos desde backend. */
        const mappedRows = (schedule || []).map((item, index) => ({
            key: `${item.id ?? "n"}-${index}`,
            fecha: item.fecha,
            horaInicio: toTimeInput(item.horaInicio),
            horaFin: toTimeInput(item.horaFin),
            bloqueadoPorReservas: Boolean(item.bloqueadoPorReservas),
          }));
        setRows(mappedRows);
        if (mappedRows.length > 0) {
          setAgendaFecha(mappedRows[0].fecha);
        }
      } catch (err) {
        setError(mapApiError(err).message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  /**
   * Anade un tramo horario inicial para el dia actual.
   */
  const addRow = () => {
    const fecha = agendaFecha || todayDateInput();
    const nextSlot = getNextDefaultSlot(rows, fecha);
    setAgendaFecha(fecha);
    setRows((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}-${Math.random()}`,
        fecha,
        ...nextSlot,
      },
    ]);
  };

  /**
   * Elimina un tramo horario del formulario.
   */
  const removeRow = (key) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  /**
   * Actualiza un campo concreto de un tramo horario.
   */
  const updateRow = (key, field, value) => {
    if (field === "fecha" && value) {
      setAgendaFecha(value);
    }
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  /**
   * Valida horarios, evita solapes y reemplaza el horario completo del barbero.
   */
  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!user?.id) {
      setError("No se ha podido identificar al barbero");
      return;
    }

    const invalid = rows.find((r) => !r.fecha || !r.horaInicio || !r.horaFin || r.horaInicio >= r.horaFin);
    if (invalid) {
      setError("Revisa los tramos: fecha y horas validas (inicio < fin)");
      return;
    }

    if (hasOverlaps(rows)) {
      setError("Hay tramos solapados en la misma fecha");
      return;
    }

    const payload = sortByDateAndTime(rows).map((r) => ({
      fecha: r.fecha,
      horaInicio: toApiTime(r.horaInicio),
      horaFin: toApiTime(r.horaFin),
    }));

    setSaving(true);
    try {
      const saved = await replaceBarberSchedule(user.id, payload);
      setRows(
        (saved || []).map((item, index) => ({
          key: `${item.id ?? "n"}-${index}`,
          fecha: item.fecha,
          horaInicio: toTimeInput(item.horaInicio),
          horaFin: toTimeInput(item.horaFin),
          bloqueadoPorReservas: Boolean(item.bloqueadoPorReservas),
        }))
      );
      setSuccess("Horario guardado correctamente");
      setAgendaRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-24 w-full rounded-[1.75rem]" />
        <Skeleton className="h-64 w-full rounded-[1.75rem]" />
        <Skeleton className="h-80 w-full rounded-[1.75rem]" />
      </div>
    );
  }

  return (
    <div className="relative -mx-md -my-lg overflow-hidden px-md py-lg sm:-mx-lg sm:-my-xl sm:px-lg sm:py-xl lg:-mx-xl lg:px-xl">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#fbf7ef]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_18%,rgba(201,151,62,0.12),transparent_30%),radial-gradient(circle_at_86%_34%,rgba(201,151,62,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(251,247,239,0.76))]" />
      <div className="pointer-events-none fixed -left-28 top-48 -z-10 h-[34rem] w-[34rem] rounded-full border border-accent/10" />
      <div className="pointer-events-none fixed right-4 top-28 -z-10 hidden h-32 w-32 bg-[radial-gradient(circle,rgba(201,151,62,0.28)_1px,transparent_1.5px)] bg-[length:14px_14px] opacity-25 lg:block" />
      <div className="pointer-events-none fixed -right-32 bottom-6 -z-10 h-[28rem] w-[28rem] rounded-full border border-accent/20" />

      <div className="mx-auto max-w-5xl space-y-7 sm:space-y-8">
        <Card
          title="Tramos horarios"
          subtitle={"Define disponibilidad por d\u00eda y franja horaria"}
          className={`${premiumCardClass} animate-fade-up`}
          contentClassName="p-7 sm:p-8"
          actions={
            <PrimaryButton onClick={addRow} className="min-h-12 px-md py-2.5 text-xs sm:w-auto">
              {"A\u00f1adir tramo"}
            </PrimaryButton>
          }
        >
          <div className="space-y-5">
            {error ? (
              <div className="animate-fade-up">
                <Alert tone="error">{error}</Alert>
              </div>
            ) : null}
            {success ? (
              <div className="animate-fade-up">
                <Alert tone="success">{success}</Alert>
              </div>
            ) : null}

            {rows.length === 0 ? (
              <div className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-2 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.45)] animate-fade-up">
                <EmptyState
                  title="Sin tramos configurados"
                  description={"A\u00f1ade tu primer tramo para publicar disponibilidad."}
                  icon=""
                  actionLabel={"A\u00f1adir tramo"}
                  onAction={addRow}
                />
              </div>
            ) : null}

            {rows.length > 0 ? (
              <div className="grid gap-4">
                {rows.map((row, idx) => {
                  const removeDisabled = row.bloqueadoPorReservas;
                  return (
                    <div
                      key={row.key}
                      className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-5 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-elegant animate-fade-up sm:p-6"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                        <Input
                          id={`${row.key}-fecha`}
                          label="Fecha"
                          type="date"
                          value={row.fecha}
                          onChange={(event) => updateRow(row.key, "fecha", event.target.value)}
                          icon={<FieldIcon type="calendar" />}
                          inputClassName={premiumInputClass}
                        />
                        <Input
                          id={`${row.key}-inicio`}
                          label="Inicio"
                          type="time"
                          value={row.horaInicio}
                          onChange={(event) => updateRow(row.key, "horaInicio", event.target.value)}
                          icon={<FieldIcon type="time" />}
                          inputClassName={premiumInputClass}
                        />
                        <Input
                          id={`${row.key}-fin`}
                          label="Fin"
                          type="time"
                          value={row.horaFin}
                          onChange={(event) => updateRow(row.key, "horaFin", event.target.value)}
                          icon={<FieldIcon type="time" />}
                          inputClassName={premiumInputClass}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => removeRow(row.key)}
                          disabled={removeDisabled}
                          className={`w-full md:w-auto ${premiumSecondaryButtonClass}`}
                        >
                          Quitar
                        </Button>
                      </div>
                      {removeDisabled ? (
                        <p className="mt-3 rounded-2xl border border-accent/20 bg-white/75 px-4 py-3 text-xs font-semibold text-neutral-text/70">
                          Este tramo tiene reservas pendientes y no se puede quitar.
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <PrimaryButton onClick={handleSave} disabled={!canSave} loading={saving} fullWidth>
              Guardar horario
            </PrimaryButton>
          </div>
        </Card>

        <GestionReservasPage
          embedded
          controlledFecha={agendaFecha}
          onFechaChange={setAgendaFecha}
          refreshKey={agendaRefreshKey}
        />
      </div>
    </div>
  );
}
