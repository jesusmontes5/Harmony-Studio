import { useState } from "react";
import { Card } from "../ui/Card";
import { premiumCardClass } from "../../styles/uiClasses";

/**
 * DashboardBarChart - Gráfico de barras para dashboard.
 * Muestra estadísticas en formato de gráfico.
 * @component
 * @param {Object} props
 * @param {string} props.title - Título del gráfico
 * @param {Array<Object>} props.data - Datos a graficar
 * @returns {React.ReactElement}
 */
export function DashboardBarChart({
  title,
  subtitle,
  data,
  barColor = "bg-primary",
  valueFormatter,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const formatValue = valueFormatter || ((value) => `${value}`);
  const gridSteps = [100, 75, 50, 25, 0];
  const chartMinWidth = Math.max(data.length * 42, 320);

  return (
    <Card
      title={title}
      subtitle={subtitle}
      className={`h-full ${premiumCardClass} animate-fade-up`}
      contentClassName="p-7 sm:p-8"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-accent/10 bg-gradient-to-br from-white via-white to-accent/5 px-lg py-md text-xs font-medium text-neutral-text shadow-soft">
          Máximo del rango: 
          <span className="ml-1 font-bold text-primary">{formatValue(maxValue)}</span>
        </div>

        <div className="relative overflow-x-auto pb-1">
          {/* Grid Background */}
          <div className="pointer-events-none absolute inset-0 right-2">
            <div className="relative h-48 sm:h-64">
              {gridSteps.map((step) => (
                <div
                  key={step}
                  className="absolute inset-x-0 border-t border-dashed border-neutral-border/20"
                  style={{ top: `${100 - step}%` }}
                />
              ))}
            </div>
          </div>

          {/* Bars Container */}
          <div
            className="relative flex h-48 items-end gap-2 pt-5 sm:h-64 sm:gap-3 sm:pt-7"
            style={{ minWidth: `${chartMinWidth}px` }}
          >
            {data.map((item, idx) => {
              const height = Math.max((item.value / maxValue) * 100, 6);
              const valueLabel = formatValue(item.value);
              const isSelected = selectedIndex === idx;
              return (
                <div 
                  key={item.label} 
                  className="group flex min-w-10 flex-1 cursor-pointer flex-col items-center gap-1 sm:min-w-14 sm:gap-2"
                  role="button"
                  tabIndex={0}
                  aria-label={`${item.label}: ${valueLabel}`}
                  onClick={() => setSelectedIndex(isSelected ? null : idx)}
                  onFocus={() => setSelectedIndex(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedIndex(isSelected ? null : idx);
                    }
                  }}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <span
                    title={valueLabel}
                    className={`max-w-full whitespace-nowrap rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary transition-opacity duration-300 sm:inline-flex ${
                      isSelected ? "inline-flex opacity-100" : "hidden opacity-0 sm:opacity-0 sm:group-hover:opacity-100"
                    }`}
                  >
                    {valueLabel}
                  </span>
                  <div
                    className={`flex h-32 w-full items-end rounded-xl border bg-white p-1.5 shadow-soft transition-all duration-300 group-hover:border-accent/40 group-hover:shadow-elegant sm:h-40 ${
                      isSelected ? "border-accent/50 shadow-elegant" : "border-neutral-border/50"
                    }`}
                  >
                    <div
                      className={`origin-bottom w-full rounded-lg transition-all duration-500 ease-out group-hover:shadow-dramatic ${
                        isSelected ? "shadow-dramatic" : ""
                      } ${barColor}`}
                      style={{ 
                        height: `${height}%`,
                      }}
                    />
                  </div>
                  <span
                    title={item.label}
                    className="whitespace-nowrap text-[9px] font-semibold text-neutral-text/70 sm:text-xs group-hover:text-primary transition-colors duration-300"
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
