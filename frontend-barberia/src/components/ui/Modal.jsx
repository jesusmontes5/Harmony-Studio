import { useEffect } from "react";

/**
 * Modal - Componente modal/diálogo.
 * Muestra contenido en una ventana modal con opciones de cierre.
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Si el modal está abierto
 * @param {string} props.title - Título del modal
 * @param {React.ReactNode} props.children - Contenido del modal
 * @param {Function} props.onClose - Callback al cerrar
 * @param {React.ReactNode} props.footer - Pie del modal (botones)
 * @returns {React.ReactElement}
 */
export function Modal({ open, title, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex touch-none items-end overflow-hidden bg-primary/38 px-sm py-sm backdrop-blur-[10px] sm:items-center sm:justify-center sm:p-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(201,151,62,0.14),transparent_32%),radial-gradient(circle_at_82%_86%,rgba(255,255,255,0.22),transparent_36%)]" />
      <div
        className="relative w-full max-w-xl origin-center overflow-hidden rounded-[1.75rem] border border-white/85 bg-[#fffaf2]/96 p-6 shadow-[0_36px_100px_-56px_rgba(17,24,39,0.78),0_22px_52px_-34px_rgba(201,151,62,0.55),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl transition-all duration-200 sm:p-8 animate-scale-in"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-accent/10" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/90" />
        <div className="relative mb-7 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-3xl font-bold leading-tight text-primary sm:text-4xl">{title}</h3>
            <div className="mt-3 h-1 w-16 rounded-full bg-accent shadow-[0_8px_20px_-10px_rgba(201,151,62,0.95)]" />
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-2xl border border-transparent p-2.5 text-neutral-text/55 transition-all duration-200 hover:border-accent/15 hover:bg-white/70 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-95"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="premium-scrollbar relative max-h-[64vh] touch-auto overflow-y-auto overscroll-contain pr-1">{children}</div>

        {footer ? (
          <div className="relative mt-8 border-t border-neutral-border/35 pt-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
