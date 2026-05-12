import { cn } from "../../utils/cn";

const sizes = {
  sm: {
    harmony: "text-[14px] tracking-[.40em] pr-[.40em] group-hover/logo:tracking-[.46em] group-hover/logo:pr-[.46em]",
    bar: "my-[6px]",
    gem: "w-[3px] h-[3px] mx-[6px]",
    studio: "text-[5.5px] tracking-[.55em] pr-[.55em] group-hover/logo:tracking-[.59em] group-hover/logo:pr-[.59em]",
  },
  md: {
    harmony: "text-[21px] tracking-[.40em] pr-[.40em] group-hover/logo:tracking-[.46em] group-hover/logo:pr-[.46em]",
    bar: "my-[9px]",
    gem: "w-[4.5px] h-[4.5px] mx-[9px]",
    studio: "text-[7.5px] tracking-[.55em] pr-[.55em] group-hover/logo:tracking-[.59em] group-hover/logo:pr-[.59em]",
  },
  lg: {
    harmony: "text-[34px] tracking-[.42em] pr-[.42em] group-hover/logo:tracking-[.48em] group-hover/logo:pr-[.48em]",
    bar: "my-[13px]",
    gem: "w-[6px] h-[6px] mx-[13px]",
    studio: "text-[10.5px] tracking-[.55em] pr-[.55em] group-hover/logo:tracking-[.59em] group-hover/logo:pr-[.59em]",
  },
};

/**
 * Renderiza el logotipo textual Harmony Studio con sus variantes de tamano y tema.
 */
export function Logo({
  align = "start",
  animated = true,
  size = "md",
  theme = "light",
  href,
  className = "",
}) {
  const s = sizes[size] || sizes.md;
  const isDark = theme === "dark";
  const Tag = href ? "a" : "span";

  return (
    <Tag
      href={href}
      role={href ? undefined : "img"}
      aria-label="Harmony Studio"
      className={cn(
        "[cursor:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect x='4.5' y='4.5' width='7' height='7' transform='rotate(45 8 8)' fill='none' stroke='%23b8892a' stroke-width='1'/%3E%3C/svg%3E\")_8_8,pointer]",
        "group/logo relative inline-flex flex-col rounded-[2px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#b8892a]/40",
        "before:absolute before:-inset-[6px] before:z-[2] before:pointer-events-none before:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")] before:bg-[size:200px_80px] before:opacity-[0.022] before:mix-blend-multiply before:content-['']",
        align === "center" ? "items-center" : "items-start",
        className
      )}
    >
      <span
        className={cn(
          "font-logo font-light leading-none [-webkit-font-smoothing:antialiased]",
          "[font-feature-settings:'kern'_1,'smcp'_1,'liga'_1]",
          "transition-[opacity,letter-spacing,padding] duration-[650ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
          isDark
            ? "text-[#ede8df] opacity-[0.82] group-hover/logo:opacity-100"
            : "text-[#0a0b0d] opacity-[0.82] group-hover/logo:opacity-100",
          animated && "animate-logo-up [animation-delay:0ms] motion-reduce:animate-none",
          s.harmony
        )}
      >
        Harmony
      </span>

      <span
        aria-hidden="true"
        className={cn(
          "flex w-full items-center",
          s.bar,
          animated && "animate-logo-up [animation-delay:60ms] motion-reduce:animate-none"
        )}
      >
        <span className="relative h-px flex-1 overflow-hidden animate-logo-expand [animation-delay:240ms] motion-reduce:animate-none">
          <span
            className={cn(
              "absolute inset-0 transition-opacity duration-[550ms]",
              isDark
                ? "bg-gradient-to-r from-transparent via-[#c9973e] to-[#d4a84b] opacity-[0.35] group-hover/logo:opacity-[0.72]"
                : "bg-gradient-to-r from-transparent via-[#b8892a] to-[#d4a84b] opacity-[0.32] group-hover/logo:opacity-[0.7]"
            )}
          />
          <span className="absolute -bottom-px -top-px -left-[50%] w-[35%] bg-gradient-to-r from-transparent via-[rgba(255,240,180,0.92)] to-transparent opacity-0 transition-opacity duration-150 group-hover/logo:animate-logo-ray group-hover/logo:opacity-100 motion-reduce:hidden" />
        </span>

        <span
          className={cn(
            "relative flex-shrink-0 rotate-45 border-[.5px] transition-[opacity,transform,border-color] duration-[550ms] ease-[cubic-bezier(.34,1.56,.64,1)] group-hover/logo:scale-[1.3]",
            "after:absolute after:inset-[1px] after:bg-gradient-to-br after:from-[rgba(255,240,180,0.85)] after:to-transparent after:opacity-0 after:transition-opacity after:duration-[400ms] after:content-[''] group-hover/logo:after:opacity-100",
            isDark
              ? "border-[#c9973e] opacity-[0.38] group-hover/logo:border-[#d4a84b] group-hover/logo:opacity-100"
              : "border-[#b8892a] opacity-[0.38] group-hover/logo:border-[#d4a84b] group-hover/logo:opacity-100",
            s.gem
          )}
        />

        <span className="relative h-px flex-1 overflow-hidden animate-logo-expand [animation-delay:320ms] motion-reduce:animate-none">
          <span
            className={cn(
              "absolute inset-0 transition-opacity duration-[550ms]",
              isDark
                ? "bg-gradient-to-l from-transparent via-[#c9973e] to-[#d4a84b] opacity-[0.35] group-hover/logo:opacity-[0.72]"
                : "bg-gradient-to-l from-transparent via-[#b8892a] to-[#d4a84b] opacity-[0.32] group-hover/logo:opacity-[0.7]"
            )}
          />
          <span className="absolute -bottom-px -top-px -left-[50%] w-[35%] bg-gradient-to-r from-transparent via-[rgba(255,240,180,0.92)] to-transparent opacity-0 transition-opacity duration-150 group-hover/logo:animate-logo-ray group-hover/logo:opacity-100 [animation-delay:160ms] motion-reduce:hidden" />
        </span>
      </span>

      <span
        className={cn(
          "text-center font-logo-sans font-thin uppercase leading-none [-webkit-font-smoothing:antialiased]",
          "transition-[opacity,color,letter-spacing,padding] duration-[650ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
          isDark
            ? "text-[#c9973e] opacity-[0.52] group-hover/logo:text-[#d4a84b] group-hover/logo:opacity-100"
            : "text-[#b8892a] opacity-[0.52] group-hover/logo:text-[#c9973e] group-hover/logo:opacity-100",
          animated && "animate-logo-up [animation-delay:110ms] motion-reduce:animate-none",
          s.studio
        )}
      >
        STUDIO
      </span>
    </Tag>
  );
}
