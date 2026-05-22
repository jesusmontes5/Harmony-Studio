import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { useLocation } from "react-router-dom";

const MotionMain = m.main;

const pageTransition = {
  duration: 0.3,
  ease: "easeOut",
};

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: pageTransition,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

/**
 * Aplica una transicion suave al contenido cuando cambia la ruta activa.
 */
export function PageTransition({ children, className = "" }) {
  const location = useLocation();

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial={false}>
        <MotionMain
          key={location.pathname}
          className={className}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </MotionMain>
      </AnimatePresence>
    </LazyMotion>
  );
}
