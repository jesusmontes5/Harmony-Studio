import { useMemo, useState } from "react";
import { createReview } from "../../api/reviewsApi";
import { mapApiError } from "../../api/apiClient";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { PrimaryButton } from "../ui/PrimaryButton";
import { useNotificationMessage } from "../../hooks/useNotifications";

const INITIAL_FORM = {
  puntuacion: "5",
  comentario: "",
};

const scoreActiveStyles = {
  success: "border-success bg-success/10 shadow-soft",
  accent: "border-accent bg-accent/10 shadow-soft",
  primary: "border-primary bg-primary/10 shadow-soft",
  warning: "border-accent bg-accent/10 shadow-soft",
  danger: "border-danger bg-danger/10 shadow-soft",
};

/**
 * ReviewFormModal - Modal para escribir resenas.
 * Permite a clientes crear reseñas de barberos.
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Si está abierto
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Object} props.reservation - Datos de la reserva
 * @param {Function} props.onSubmit - Callback al enviar
 * @returns {React.ReactElement}
 */
export function ReviewFormModal({ open, reserva, onClose, onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useNotificationMessage(error, "error", "No se pudo guardar la resena");

  /**
   * Calcula el titulo del modal segun la reserva seleccionada.
   */
  const title = useMemo(() => {
    if (!reserva) return "Crear reseña";
    return `Reseñar reserva #${reserva.id}`;
  }, [reserva]);

  /**
   * Cierra el modal y limpia el formulario para el siguiente uso.
   */
  const closeAndReset = () => {
    setForm(INITIAL_FORM);
    setError("");
    onClose();
  };

  /**
   * Envia la resena al backend y notifica al padre cuando se crea correctamente.
   */
  const submit = async () => {
    if (!reserva?.id) return;
    setError("");
    setSaving(true);
    try {
      await createReview({
        reservaId: reserva.id,
        puntuacion: Number(form.puntuacion),
        comentario: form.comentario?.trim() || null,
      });
      setForm(INITIAL_FORM);
      onCreated?.(reserva);
      onClose();
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const scoreOptions = [
    { value: "5", label: "Excelente", color: "success" },
    { value: "4", label: "Muy buena", color: "accent" },
    { value: "3", label: "Buena", color: "primary" },
    { value: "2", label: "Mejorable", color: "warning" },
    { value: "1", label: "Mala", color: "danger" },
  ];

  const selectedOption = scoreOptions.find(opt => opt.value === form.puntuacion);

  return (
    <Modal
      open={open}
      title={title}
      onClose={closeAndReset}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={closeAndReset}>
            Cancelar
          </Button>
          <PrimaryButton onClick={submit} loading={saving} className="sm:w-auto">
            Guardar reseña
          </PrimaryButton>
        </div>
      }
    >
      <div className="space-y-6 py-2 animate-fade-up">
        {/* Score Selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-neutral-text/60 mb-4 block">
            ¿Qué puntuación le das?
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {scoreOptions.map((option, idx) => (
              <button
                key={option.value}
                onClick={() => setForm((prev) => ({ ...prev, puntuacion: option.value }))}
                className={`flex min-h-20 flex-col items-center justify-center rounded-lg border-2 p-3 transition-all duration-250 hover:-translate-y-0.5 ${
                  form.puntuacion === option.value
                    ? scoreActiveStyles[option.color]
                    : "border-neutral-border/50 hover:border-neutral-border bg-white hover:bg-neutral/30"
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
                aria-pressed={form.puntuacion === option.value}
              >
                <span className="mb-1 font-display text-2xl font-bold text-primary">{option.value}/5</span>
                <span className={`text-xs font-bold ${
                  form.puntuacion === option.value 
                    ? "text-neutral-text" 
                    : "text-neutral-text/50"
                }`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
          {selectedOption && (
            <p className="text-sm text-primary font-semibold mt-3 animate-fade-up">
              Seleccionaste: {selectedOption.label}
            </p>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-neutral-border to-transparent" />

        {/* Comment Field */}
        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <Input
            id="review-comment"
            as="textarea"
            label="Cuéntanos tu experiencia (opcional)"
            placeholder="¿Qué te gustó? ¿Algo a mejorar?..."
            maxLength={2000}
            value={form.comentario}
            onChange={(event) => setForm((prev) => ({ ...prev, comentario: event.target.value }))}
            className="min-h-[120px]"
          />
          <p className="text-xs text-neutral-text/50 mt-2">
            {form.comentario.length} / 2000 caracteres
          </p>
        </div>

        {error ? <Alert tone="error" className="animate-fade-up">{error}</Alert> : null}
      </div>
    </Modal>
  );
}
