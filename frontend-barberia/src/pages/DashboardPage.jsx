import { useCallback, useEffect, useMemo, useState } from "react";
import { mapApiError } from "../api/apiClient";
import { listMyReservations } from "../api/reservasApi";
import { DashboardBarChart } from "../components/dashboard/DashboardBarChart";
import { DashboardStatCard } from "../components/dashboard/DashboardStatCard";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { Skeleton } from "../components/ui/Skeleton";
import { useNotificationMessage } from "../hooks/useNotifications";
import { premiumCardClass } from "../styles/uiClasses";

const DAY_MS = 24 * 60 * 60 * 1000;

const currencyCompactFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const dateLabelFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
});

const longDateLabelFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

const premiumInputClass =
  "h-14 rounded-xl border border-neutral-border/80 bg-white/95 px-lg text-sm font-semibold text-primary shadow-[0_14px_30px_-26px_rgba(17,24,39,0.55)] outline-none transition hover:border-accent/40 hover:shadow-soft focus:border-accent focus:ring-2 focus:ring-accent/30";

const premiumButtonClass =
  "rounded-xl shadow-[0_18px_35px_-22px_rgba(17,24,39,0.9)] hover:shadow-[0_22px_42px_-22px_rgba(17,24,39,0.95)]";

/**
 * Formatea una cantidad numerica como importe compacto en euros.
 */
function formatCurrency(value) {
  return currencyCompactFormatter.format(value || 0);
}

/**
 * Redondea un valor numerico y lo presenta como porcentaje.
 */
function formatPercent(value) {
  return `${Math.round(value || 0)}%`;
}

/**
 * Convierte importes recibidos desde API a numero seguro para calculos.
 */
function parseAmount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Convierte un Date al formato yyyy-MM-dd usado por inputs de fecha.
 */
function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parsea una fecha de input y permite fijarla al inicio o final del dia.
 */
function parseInputDate(value, endOfDay = false) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Convierte un Date local al formato ISO sin zona horaria que espera el backend.
 */
function toApiDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Devuelve una copia de la fecha situada al inicio del dia.
 */
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

/**
 * Devuelve una copia de la fecha situada al final del dia.
 */
function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

/**
 * Suma o resta dias a una fecha conservando la hora original.
 */
function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

/**
 * Calcula el numero de dias entre dos fechas incluyendo ambos extremos.
 */
function daysBetweenInclusive(from, to) {
  return Math.floor((startOfDay(to) - startOfDay(from)) / DAY_MS) + 1;
}

/**
 * Calcula el texto y tono visual de una variacion porcentual entre periodos.
 */
function formatPercentTrend(current, previous) {
  if (!previous) {
    if (!current) return { text: "0%", tone: "neutral" };
    return { text: "+100%", tone: "positive" };
  }

  /** Variacion porcentual entre el periodo actual y el periodo anterior. */
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change);
  if (rounded > 0) return { text: `+${rounded}%`, tone: "positive" };
  if (rounded < 0) return { text: `${rounded}%`, tone: "negative" };
  return { text: "0%", tone: "neutral" };
}

/**
 * Genera todas las fechas de un rango para alimentar graficas por dia.
 */
function enumerateDays(from, to) {
  const days = [];
  let cursor = startOfDay(from);
  const end = startOfDay(to);

  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }

  return days;
}

/**
 * Renderiza el estado de carga estructural del dashboard.
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 sm:h-32" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

/**
 * DashboardPage - Página de dashboard ejecutivo.
 * Muestra métricas de reservas, ingresos y gráficos de tendencias.
 * Acceso restringido a barberos y admin.
 * @page
 * @returns {React.ReactElement}
 */
export function DashboardPage() {
  /**
   * Fija la fecha base del dashboard durante el ciclo de vida de la pagina.
   */
  const today = useMemo(() => new Date(), []);
  /**
   * Fecha inicial por defecto: ultimos siete dias.
   */
  const defaultFrom = useMemo(() => toDateInputValue(addDays(today, -6)), [today]);
  /**
   * Fecha final por defecto: dia actual.
   */
  const defaultTo = useMemo(() => toDateInputValue(today), [today]);

  const [filters, setFilters] = useState({ from: defaultFrom, to: defaultTo });
  const [draftFilters, setDraftFilters] = useState({ from: defaultFrom, to: defaultTo });
  const [activePreset, setActivePreset] = useState("7d");
  const [rangeError, setRangeError] = useState("");

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useNotificationMessage(rangeError, "warning", "Rango no valido");
  useNotificationMessage(error, "error", "No se pudo cargar el dashboard");

  /**
   * Carga reservas del rango actual y del periodo anterior para calcular tendencias.
   */
  const loadDashboard = useCallback(async (range) => {
    const fromDate = parseInputDate(range.from, false);
    const toDate = parseInputDate(range.to, true);

    if (!fromDate || !toDate || fromDate > toDate) {
      setRangeError("Selecciona un rango de fechas valido.");
      return;
    }

    setRangeError("");
    setLoading(true);
    setError("");

    try {
      const totalDays = daysBetweenInclusive(fromDate, toDate);
      const previousStart = addDays(fromDate, -totalDays);

      const data = await listMyReservations({
        desde: toApiDateTime(startOfDay(previousStart)),
        hasta: toApiDateTime(endOfDay(toDate)),
      });

      setReservations(Array.isArray(data) ? data : []);
      setFilters(range);
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard({ from: defaultFrom, to: defaultTo });
  }, [defaultFrom, defaultTo, loadDashboard]);

  /**
   * Aplica el rango manual introducido por el usuario.
   */
  const applyDraftFilters = () => {
    setActivePreset("custom");
    loadDashboard(draftFilters);
  };

  /**
   * Calcula y aplica rangos rapidos como 7 dias, 30 dias o mes actual.
   */
  const applyPreset = (preset) => {
    const now = new Date();
    let fromDate = startOfDay(now);
    let toDate = endOfDay(now);

    if (preset === "7d") {
      fromDate = startOfDay(addDays(now, -6));
    }
    if (preset === "30d") {
      fromDate = startOfDay(addDays(now, -29));
    }
    if (preset === "month") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    const next = {
      from: toDateInputValue(fromDate),
      to: toDateInputValue(toDate),
    };

    setActivePreset(preset);
    setDraftFilters(next);
    loadDashboard(next);
  };

  /**
   * Agrega metricas, graficas y listados derivados de las reservas cargadas.
   */
  const dashboard = useMemo(() => {
    const fromDate = parseInputDate(filters.from, false);
    const toDate = parseInputDate(filters.to, true);

    if (!fromDate || !toDate) {
      return {
        kpis: [],
        incomeSeries: [],
        cutsSeries: [],
        topUsers: [],
        busiest: null,
        rangeLabel: "",
        daysInRange: 0,
      };
    }

    const totalDays = daysBetweenInclusive(fromDate, toDate);
    const previousStart = startOfDay(addDays(fromDate, -totalDays));
    const previousEnd = endOfDay(addDays(fromDate, -1));

    const completed = reservations
      .filter((reservation) => reservation.estado === "COMPLETADA")
      .map((reservation) => ({
        ...reservation,
        date: new Date(reservation.fechaInicio),
        amount: parseAmount(reservation.precioTotal),
      }))
      .filter((reservation) => !Number.isNaN(reservation.date.getTime()));

    const currentPeriod = completed.filter((item) => item.date >= fromDate && item.date <= toDate);
    const previousPeriod = completed.filter((item) => item.date >= previousStart && item.date <= previousEnd);
    const allInCurrentRange = reservations.filter((reservation) => {
      const date = new Date(reservation.fechaInicio);
      return !Number.isNaN(date.getTime()) && date >= fromDate && date <= toDate;
    });

    const currentIncome = currentPeriod.reduce((sum, item) => sum + item.amount, 0);
    const previousIncome = previousPeriod.reduce((sum, item) => sum + item.amount, 0);
    const currentCuts = currentPeriod.length;
    const previousCuts = previousPeriod.length;

    const currentMonthStart = new Date(toDate.getFullYear(), toDate.getMonth(), 1, 0, 0, 0, 0);
    const currentMonthEnd = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0, 23, 59, 59, 999);
    const previousMonthStart = new Date(toDate.getFullYear(), toDate.getMonth() - 1, 1, 0, 0, 0, 0);
    const previousMonthEnd = new Date(toDate.getFullYear(), toDate.getMonth(), 0, 23, 59, 59, 999);

    const currentMonthPeriod = completed.filter((item) => item.date >= currentMonthStart && item.date <= currentMonthEnd);
    const previousMonthPeriod = completed.filter((item) => item.date >= previousMonthStart && item.date <= previousMonthEnd);

    const currentMonthIncome = currentMonthPeriod.reduce((sum, item) => sum + item.amount, 0);
    const previousMonthIncome = previousMonthPeriod.reduce((sum, item) => sum + item.amount, 0);
    const currentMonthCuts = currentMonthPeriod.length;
    const previousMonthCuts = previousMonthPeriod.length;

    const cutsRangeTrend = formatPercentTrend(currentCuts, previousCuts);
    const cutsMonthTrend = formatPercentTrend(currentMonthCuts, previousMonthCuts);
    const incomeRangeTrend = formatPercentTrend(currentIncome, previousIncome);
    const incomeMonthTrend = formatPercentTrend(currentMonthIncome, previousMonthIncome);

    const days = enumerateDays(fromDate, toDate);
    const incomeSeries = days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const value = currentPeriod
        .filter((item) => item.date >= dayStart && item.date <= dayEnd)
        .reduce((sum, item) => sum + item.amount, 0);
      return {
        label: dateLabelFormatter.format(day),
        value: Math.round(value),
      };
    });

    const cutsSeries = days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const value = currentPeriod.filter((item) => item.date >= dayStart && item.date <= dayEnd).length;
      return {
        label: dateLabelFormatter.format(day),
        value,
      };
    });

    const frequentUsersMap = new Map();
    currentPeriod.forEach((item) => {
      const key = item.clienteId || item.clienteNombre || item.id;
      const current = frequentUsersMap.get(key) || {
        name: item.clienteNombre || `Cliente #${item.clienteId ?? "N/A"}`,
        visits: 0,
        total: 0,
      };
      current.visits += 1;
      current.total += item.amount;
      frequentUsersMap.set(key, current);
    });

    const topUsers = Array.from(frequentUsersMap.values())
      .sort((a, b) => {
        if (b.visits !== a.visits) return b.visits - a.visits;
        return b.total - a.total;
      })
      .slice(0, 5)
      .map((item) => ({
        ...item,
        amountLabel: formatCurrency(item.total),
      }));

    const completionRate = allInCurrentRange.length
      ? (currentCuts / allInCurrentRange.length) * 100
      : 0;

    const busiestSeriesItem = cutsSeries.reduce((best, current, index) => {
      if (!best || current.value > best.value) {
        return {
          ...current,
          index,
        };
      }
      return best;
    }, null);

    const busiest = busiestSeriesItem
      ? {
          label: longDateLabelFormatter.format(days[busiestSeriesItem.index]),
          value: busiestSeriesItem.value,
        }
      : null;

    return {
      kpis: [
        {
          title: "Ingresos del periodo",
          value: formatCurrency(currentIncome),
          helper: `Completadas (${currentCuts} servicios)`,
          trend: incomeRangeTrend.text,
          tone: incomeRangeTrend.tone,
        },
        {
          title: "Cortes completados",
          value: `${currentCuts}`,
          helper: `Tasa cierre ${formatPercent(completionRate)}`,
          trend: cutsRangeTrend.text,
          tone: cutsRangeTrend.tone,
        },
        {
          title: "Ingresos este mes",
          value: formatCurrency(currentMonthIncome),
          helper: "Facturacion mensual",
          trend: incomeMonthTrend.text,
          tone: incomeMonthTrend.tone,
        },
        {
          title: "Cortes este mes",
          value: `${currentMonthCuts}`,
          helper: "Servicios completados",
          trend: cutsMonthTrend.text,
          tone: cutsMonthTrend.tone,
        },
      ],
      incomeSeries,
      cutsSeries,
      topUsers,
      busiest,
      rangeLabel: `${filters.from} -> ${filters.to}`,
      daysInRange: totalDays,
    };
  }, [filters.from, filters.to, reservations]);

  return (
    <div className="relative -mx-md -my-lg overflow-hidden px-md py-lg sm:-mx-lg sm:-my-xl sm:px-lg sm:py-xl lg:-mx-xl lg:px-xl">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#fbf7ef]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_18%,rgba(201,151,62,0.12),transparent_30%),radial-gradient(circle_at_86%_34%,rgba(201,151,62,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(251,247,239,0.76))]" />
      <div className="pointer-events-none fixed -left-28 top-48 -z-10 h-[34rem] w-[34rem] rounded-full border border-accent/10" />
      <div className="pointer-events-none fixed right-4 top-28 -z-10 hidden h-32 w-32 bg-[radial-gradient(circle,rgba(201,151,62,0.28)_1px,transparent_1.5px)] bg-[length:14px_14px] opacity-25 lg:block" />
      <div className="pointer-events-none fixed -right-32 bottom-6 -z-10 h-[28rem] w-[28rem] rounded-full border border-accent/20" />

      <div className="mx-auto max-w-6xl space-y-7 sm:space-y-8">
      <Card className={`${premiumCardClass} animate-fade-up`} contentClassName="p-7 sm:p-8">
        <div className="grid gap-lg lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-sm">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">Rango activo</p>
            <p className="break-words font-display text-2xl font-bold text-primary sm:text-3xl">
              {dashboard.rangeLabel || "Cargando..."}
            </p>
            <p className="text-sm text-neutral-text/80">
              {dashboard.daysInRange ? `${dashboard.daysInRange} días analizados` : "Analizando datos..."}
            </p>
          </div>
          <div className="grid gap-md sm:grid-cols-2">
            <div className="rounded-2xl border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 px-lg py-md shadow-[0_18px_45px_-36px_rgba(17,24,39,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-elegant">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-text/60">Facturación</p>
              <p className="text-2xl font-bold text-primary mt-2">
                {dashboard.kpis[0]?.value || formatCurrency(0)}
              </p>
              <p className="text-xs text-neutral-text/60 mt-1">{dashboard.kpis[0]?.helper || ""}</p>
            </div>
            <div className="rounded-2xl border border-success/15 bg-gradient-to-br from-white via-white to-success/5 px-lg py-md shadow-[0_18px_45px_-36px_rgba(17,24,39,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:border-success/25 hover:shadow-elegant">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-text/60">Servicios</p>
              <p className="text-2xl font-bold text-success mt-2">
                {dashboard.kpis[1]?.value || "0"}
              </p>
              <p className="text-xs text-neutral-text/60 mt-1">{dashboard.kpis[1]?.helper || "Completados"}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Filtro por calendario"
        subtitle="Combina presets rápidos con rango personalizado para analizar rendimiento."
        className={`${premiumCardClass} animate-fade-up`}
        contentClassName="p-7 sm:p-8"
        style={{ animationDelay: "50ms" }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label className="grid gap-2 text-sm text-primary">
            <span className="font-bold">Desde</span>
            <input
              type="date"
              value={draftFilters.from}
              onChange={(event) => {
                setActivePreset("custom");
                setDraftFilters((prev) => ({ ...prev, from: event.target.value }));
              }}
              className={premiumInputClass}
            />
          </label>

          <label className="grid gap-2 text-sm text-primary">
            <span className="font-bold">Hasta</span>
            <input
              type="date"
              value={draftFilters.to}
              onChange={(event) => {
                setActivePreset("custom");
                setDraftFilters((prev) => ({ ...prev, to: event.target.value }));
              }}
              className={premiumInputClass}
            />
          </label>

          <PrimaryButton className="sm:col-span-2 lg:col-span-1 lg:w-auto" onClick={applyDraftFilters} loading={loading}>
            Aplicar filtro
          </PrimaryButton>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-border/30">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-text/60 mb-3">Presets rápidos</p>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-accent/10 bg-gradient-to-br from-white via-white to-accent/5 p-3 shadow-inner">
            <Button
              size="sm"
              variant={activePreset === "today" ? "primary" : "secondary"}
              className={`flex-1 rounded-xl sm:flex-none ${activePreset === "today" ? premiumButtonClass : "bg-white/90"}`}
              onClick={() => applyPreset("today")}
            >
              Hoy
            </Button>
            <Button
              size="sm"
              variant={activePreset === "7d" ? "primary" : "secondary"}
              className={`flex-1 rounded-xl sm:flex-none ${activePreset === "7d" ? premiumButtonClass : "bg-white/90"}`}
              onClick={() => applyPreset("7d")}
            >
              7 días
            </Button>
            <Button
              size="sm"
              variant={activePreset === "30d" ? "primary" : "secondary"}
              className={`flex-1 rounded-xl sm:flex-none ${activePreset === "30d" ? premiumButtonClass : "bg-white/90"}`}
              onClick={() => applyPreset("30d")}
            >
              30 días
            </Button>
            <Button
              size="sm"
              variant={activePreset === "month" ? "primary" : "secondary"}
              className={`flex-1 rounded-xl sm:flex-none ${activePreset === "month" ? premiumButtonClass : "bg-white/90"}`}
              onClick={() => applyPreset("month")}
            >
              Mes actual
            </Button>
            <Button
              size="sm"
              variant={activePreset === "custom" ? "primary" : "secondary"}
              className={`w-full rounded-xl sm:w-auto ${activePreset === "custom" ? premiumButtonClass : "bg-white/90"}`}
              onClick={applyDraftFilters}
              loading={loading}
            >
              Aplicar
            </Button>
          </div>
        </div>

        {rangeError ? <Alert tone="warning" className="mt-3">{rangeError}</Alert> : null}
        {error ? <Alert tone="error" className="mt-3">{error}</Alert> : null}
      </Card>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {dashboard.kpis.map((item) => (
              <DashboardStatCard key={item.title} {...item} />
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <DashboardBarChart
              title="Ingresos por dia"
              subtitle={`Rango ${filters.from} a ${filters.to}`}
              data={dashboard.incomeSeries}
              barColor="bg-gradient-to-t from-emerald-500 to-emerald-400"
              valueFormatter={(value) => formatCurrency(value)}
            />
            <DashboardBarChart
              title="Cortes por dia"
              subtitle={`Rango ${filters.from} a ${filters.to}`}
              data={dashboard.cutsSeries}
              barColor="bg-gradient-to-t from-sky-500 to-sky-400"
              valueFormatter={(value) => `${value}`}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Card title="Top 5 usuarios mas frecuentes" subtitle="Clientes con mayor recurrencia en el rango seleccionado" className={premiumCardClass} contentClassName="p-7 sm:p-8">
              {dashboard.topUsers.length === 0 ? (
                <p className="text-sm text-neutral-text">Sin datos de reservas completadas para este rango.</p>
              ) : (
                <div>
                  <ul className="grid gap-2 sm:hidden">
                    {dashboard.topUsers.map((user) => (
                      <li key={user.name} className="rounded-2xl border border-accent/10 bg-white/80 px-lg py-md shadow-soft">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-primary">{user.name}</p>
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                            {user.visits} visitas
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-neutral-text">{user.amountLabel}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="hidden overflow-x-auto sm:block">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.18em] text-neutral-text">
                          <th className="pb-3 pr-3">Usuario</th>
                          <th className="pb-3 pr-3">Visitas</th>
                          <th className="pb-3">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.topUsers.map((user) => (
                          <tr key={user.name} className="border-t border-neutral-border/70 text-neutral-text transition-colors hover:bg-accent/5">
                            <td className="py-3 pr-3 font-medium text-primary">{user.name}</td>
                            <td className="py-3 pr-3">{user.visits}</td>
                            <td className="py-3">{user.amountLabel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>

            <Card title="Indicadores extra" subtitle="Resumen del tramo que tienes seleccionado" className={premiumCardClass} contentClassName="p-7 sm:p-8">
              <div className="space-y-4">
                <div className="rounded-2xl border border-accent/10 bg-gradient-to-br from-white via-white to-accent/5 p-lg shadow-soft">
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">Dia con mas trabajo</p>
                  <p className="mt-1 text-lg font-semibold text-primary">{dashboard.busiest?.label || "N/A"}</p>
                  <p className="mt-1 text-sm text-neutral-text">{dashboard.busiest?.value || 0} cortes completados</p>
                </div>
              </div>
            </Card>
          </section>
        </>
      )}
      </div>
    </div>
  );
}
