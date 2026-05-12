/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#111827",
        "primary-light": "#374151",
        neutral: "#f3f4f6",
        "neutral-border": "#e5e7eb",
        "neutral-text": "#6b7280",
        accent: "#c9973e",
        success: "#10b981",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "sans-serif"],
        display: ["Cormorant Garamond", "Playfair Display", "serif"],
        logo: ['"Cormorant SC"', '"Cormorant Garamond"', "Georgia", "serif"],
        "logo-sans": ['"Josefin Sans"', "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      spacing: {
        xs: "0.5rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "2.5rem",
        "3xl": "3rem",
      },
      boxShadow: {
        premium: "0 20px 45px -24px rgba(15, 23, 42, 0.35)",
        elegant: "0 10px 30px -12px rgba(17, 24, 39, 0.15)",
        dramatic: "0 25px 50px -12px rgba(17, 24, 39, 0.25)",
        soft: "0 4px 12px rgba(17, 24, 39, 0.08)",
        inner: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
      },
      transitionDuration: {
        150: "150ms",
        250: "250ms",
        350: "350ms",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInDown: {
          "0%": { opacity: "0", transform: "translateY(-24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounce2: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulse2: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(201, 151, 62, 0.5)" },
          "50%": { boxShadow: "0 0 30px rgba(201, 151, 62, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "logo-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "logo-expand": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "logo-ray": {
          from: { left: "-50%" },
          to: { left: "150%" },
        },
        "diamond-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(232,201,106,0)" },
          "50%": { boxShadow: "0 0 6px 1px rgba(232,201,106,0.45)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 320ms ease-out",
        "fade-in": "fadeIn 260ms ease-out",
        "slide-in-left": "slideInLeft 400ms ease-out",
        "slide-in-right": "slideInRight 400ms ease-out",
        "slide-in-down": "slideInDown 400ms ease-out",
        "scale-in": "scaleIn 300ms ease-out",
        "bounce2": "bounce2 2s infinite",
        "pulse2": "pulse2 2s infinite",
        "shimmer": "shimmer 2s infinite",
        "glow": "glow 2s infinite",
        "float": "float 3s ease-in-out infinite",
        "logo-up": "logo-up 0.9s cubic-bezier(.22,1,.36,1) both",
        "logo-expand": "logo-expand 1.2s cubic-bezier(.22,1,.36,1) both",
        "logo-ray": "logo-ray 1.8s ease-in-out infinite",
        "diamond-pulse": "diamond-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
