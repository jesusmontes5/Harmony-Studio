import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

/**
 * Icono de calendario del CTA de reserva.
 */
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M7 3.75v3M17 3.75v3M5.25 9.25h13.5M6.75 5.25h10.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H6.75a2 2 0 0 1-2-2V7.25a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M8.25 12.25h.01M12 12.25h.01M15.75 12.25h.01M8.25 15.75h.01M12 15.75h.01M15.75 15.75h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

/**
 * Icono de flecha que refuerza la navegacion hacia reservas.
 */
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * CTA principal que lleva al usuario a la pagina de reservas.
 */
export function PrimaryCTAButton({
  to = "/reservas",
  children = "Reservar ahora",
  className = "",
  ...props
}) {
  return (
    <Link
      to={to}
      {...props}
      className={cn(
        "group inline-flex min-h-16 w-full select-none items-center justify-center gap-md rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/90 px-xl py-3.5 text-base font-semibold leading-none text-white shadow-[0_18px_35px_-22px_rgba(17,24,39,0.9),0_0_14px_0_rgba(201,151,62,0.14)] ring-1 ring-accent/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-22px_rgba(17,24,39,0.95),0_0_24px_0_rgba(201,151,62,0.3)] active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7ef] sm:w-auto sm:min-h-14 sm:px-xl sm:py-3",
        className
      )}
    >
      <span className="text-accent/80 transition-colors duration-200 group-hover:text-accent">
        <CalendarIcon />
      </span>
      <span>{children}</span>
      <span className="text-accent/75 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent">
        <ArrowIcon />
      </span>
    </Link>
  );
}
