import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

/**
 * Boton responsive para Google Login.
 * Google renderiza un iframe propio y funciona mejor con ancho numerico.
 */
export function GoogleAuthButton({ onSuccess, onError, text }) {
  const wrapperRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(320);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return undefined;

    const updateWidth = () => {
      const width = Math.floor(element.getBoundingClientRect().width);
      setButtonWidth(Math.max(240, Math.min(width, 320)));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="flex w-full justify-center">
      <div
        className="overflow-hidden rounded-xl shadow-[0_14px_30px_-26px_rgba(17,24,39,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
        style={{ width: `${buttonWidth}px` }}
      >
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          text={text}
          theme="outline"
          shape="rectangular"
          width={String(buttonWidth)}
        />
      </div>
    </div>
  );
}
