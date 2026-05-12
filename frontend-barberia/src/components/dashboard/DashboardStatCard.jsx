import { Card } from "../ui/Card";

/**
 * DashboardStatCard - Tarjeta de estadística para el dashboard.
 * Muestra métrica con icono, valor y cambio porcentual.
 * @component
 * @param {Object} props
 * @param {string} props.title - Título de la métrica
 * @param {string|number} props.value - Valor a mostrar
 * @param {number} props.change - Cambio porcentual (+/-)
 * @param {React.ReactNode} props.icon - Icono React
 * @returns {React.ReactElement}
 */
export function DashboardStatCard({ title, value, helper, trend, tone = "neutral" }) {
  const trendConfig = {
    positive: {
      badge: "text-success bg-success/10 border-success/20",
      icon: "+",
    },
    neutral: {
      badge: "text-neutral-text bg-neutral/50 border-neutral-border/50",
      icon: "=",
    },
    negative: {
      badge: "text-danger bg-danger/10 border-danger/20",
      icon: "-",
    },
  };

  const accentConfig = {
    positive: "from-success/15 to-success/0",
    neutral: "from-accent/15 to-accent/0",
    negative: "from-danger/15 to-danger/0",
  };

  const config = trendConfig[tone] || trendConfig.neutral;
  const bgGradient = accentConfig[tone] || accentConfig.neutral;

  return (
    <Card
      className="h-full rounded-[1.5rem] border-white/80 bg-white/94 shadow-[0_24px_70px_-48px_rgba(17,24,39,0.5)] backdrop-blur-xl animate-fade-up"
      contentClassName="p-0"
    >
      <div className="group relative overflow-hidden rounded-[1.5rem] p-lg sm:p-xl">
        {/* Background Gradient */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${bgGradient} group-hover:scale-110 transition-transform duration-500`}
        />
        
        {/* Content */}
        <div className="relative space-y-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-neutral-text/70">{title}</p>
          
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-primary leading-tight">{value}</p>
              <p className="mt-2 text-xs text-neutral-text/60 font-medium">{helper}</p>
            </div>
          </div>

          {trend && (
            <div className="flex items-center gap-2 pt-1">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-250 hover:shadow-soft ${config.badge}`}>
                <span>{config.icon}</span>
                {trend}
              </span>
            </div>
          )}
        </div>

        {/* Decorative Corner Accent */}
        <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300 ${
          tone === 'positive' ? 'bg-success' : tone === 'negative' ? 'bg-danger' : 'bg-accent'
        }`} />
      </div>
    </Card>
  );
}
