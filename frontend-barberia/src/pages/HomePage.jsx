import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DangerButton } from "../components/ui/DangerButton";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { Reveal } from "../components/ui/Reveal";
import { Skeleton } from "../components/ui/Skeleton";
import { HeroSection } from "../components/home/HeroSection";
import { useAuth } from "../hooks/useAuth";
import { useBoardMessages } from "../hooks/useBoardMessages";
import { useNotificationMessage } from "../hooks/useNotifications";
import { listBarbers } from "../api/reservasApi";
import { listBarberReviews } from "../api/reviewsApi";
import { mapApiError } from "../api/apiClient";

const FEATURED_BARBER_ID = Number.parseInt(import.meta.env.VITE_HOME_FEATURED_BARBER_ID ?? "2", 10);

/**
 * Formatea la fecha de los mensajes del tablon para la pagina de inicio.
 */
function formatDate(value) {
  return new Date(value).toLocaleString();
}

/**
 * Pagina principal con hero, CTA, resenas destacadas y tablon informativo.
 */
export function HomePage() {
  const { user } = useAuth();
  const [deleteMessageTarget, setDeleteMessageTarget] = useState(null);
  const [featuredBarberRating, setFeaturedBarberRating] = useState({
    loading: true,
    average: 0,
    totalReviews: 0,
    barberName: "Barbero destacado",
    error: "",
  });

  const {
    messages,
    loading,
    saving,
    deletingId,
    error,
    feedback,
    form,
    isEditing,
    setForm,
    startEdit,
    submit,
    remove,
    resetForm,
  } = useBoardMessages();

  const canManage = useMemo(
    () => user?.rol === "BARBERO" || user?.rol === "ADMIN",
    [user?.rol]
  );

  useNotificationMessage(error, "error", "No se pudo actualizar el tablon");
  useNotificationMessage(feedback, "success", "Tablon actualizado");

  const reservasCta = useMemo(() => {
    if (user?.rol === "CLIENTE") {
      return {
        to: "/reservas",
        title: "Reserva tu proxima cita",
        description: "Selecciona barbero, servicios y hora en menos de un minuto.",
        primary: "Reservar ahora",
      };
    }
    return {
      to: "/mi-horario",
      title: "Control de horario del dia",
      description: "Revisa agenda y disponibilidad desde tu horario de trabajo.",
      primary: "Ir a horario",
    };
  }, [user?.rol]);

  const loadFeaturedBarberRating = useCallback(async () => {
    setFeaturedBarberRating((prev) => ({ ...prev, loading: true, error: "" }));

    if (!Number.isInteger(FEATURED_BARBER_ID) || FEATURED_BARBER_ID <= 0) {
      setFeaturedBarberRating({
        loading: false,
        average: 0,
        totalReviews: 0,
        barberName: "Barbero destacado",
        error: "Configura VITE_HOME_FEATURED_BARBER_ID con un id valido.",
      });
      return;
    }

    try {
      const barbers = await listBarbers();
      /** Barbero configurado como destacado para mostrar su valoracion en home. */
      const featuredBarber = (barbers || []).find((barber) => Number(barber?.id) === FEATURED_BARBER_ID);

      if (!featuredBarber) {
        setFeaturedBarberRating({
          loading: false,
          average: 0,
          totalReviews: 0,
          barberName: "Barbero destacado",
          error: `No se encontro el barbero configurado (id ${FEATURED_BARBER_ID}).`,
        });
        return;
      }

      const response = await listBarberReviews(featuredBarber.id);
      const average = Number(response?.promedio || 0);
      const totalReviews = Array.isArray(response?.reviews) ? response.reviews.length : 0;

      setFeaturedBarberRating({
        loading: false,
        average: Number.isFinite(average) ? average : 0,
        totalReviews,
        barberName: featuredBarber.nombre || `Barbero #${FEATURED_BARBER_ID}`,
        error: "",
      });
    } catch (err) {
      setFeaturedBarberRating((prev) => ({
        ...prev,
        loading: false,
        error: mapApiError(err).message,
      }));
    }
  }, []);

  useEffect(() => {
    loadFeaturedBarberRating();
  }, [loadFeaturedBarberRating]);

  /**
   * Abre el modal de confirmacion para eliminar un aviso del tablon.
   */
  const openDeleteMessageModal = (message) => {
    setDeleteMessageTarget(message);
  };

  /**
   * Cierra el modal de eliminacion del tablon.
   */
  const closeDeleteMessageModal = () => {
    if (deletingId) return;
    setDeleteMessageTarget(null);
  };

  /**
   * Elimina el aviso seleccionado y cierra el modal cuando termina.
   */
  const confirmDeleteMessage = async () => {
    if (!deleteMessageTarget?.id) return;
    await remove(deleteMessageTarget.id);
    setDeleteMessageTarget(null);
  };

  return (
    <main className="space-y-8 pb-6 sm:space-y-10">
      {error ? <Alert tone="error">{error}</Alert> : null}
      {feedback ? <Alert tone="success">{feedback}</Alert> : null}

      <Reveal>
        <HeroSection cta={reservasCta} pedroRating={featuredBarberRating} />
      </Reveal>

      <Reveal>
        <Card
          title="Tablon de informacion"
          subtitle="Avisos visibles para todos los clientes y gestion de noticias."
          actions={<Badge>{messages.length} aviso{messages.length !== 1 ? "s" : ""}</Badge>}
          contentClassName="p-7 sm:p-9"
        >
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          ) : null}

          {!loading && messages.length === 0 ? (
            <EmptyState
              title="Sin avisos publicados"
              description={
                canManage
                  ? "Publica el primer mensaje para mantener informados a tus clientes."
                  : "Todavia no hay avisos publicados."
              }
              icon=""
            />
          ) : null}

          {!loading && messages.length > 0 ? (
            <ul className="grid gap-3">
              {messages.map((message, idx) => (
                <li
                  key={message.id}
                  className="rounded-[1.35rem] border border-accent/12 bg-gradient-to-br from-white via-white to-accent/5 p-lg shadow-[0_16px_36px_-30px_rgba(17,24,39,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-elegant animate-fade-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-border/30 pb-3">
                    <h3 className="font-display text-lg font-bold text-primary">{message.titulo}</h3>
                    <Badge tone="neutral">{formatDate(message.actualizadoEn || message.creadoEn)}</Badge>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-text/90">{message.mensaje}</p>
                  <p className="mt-3 text-xs text-neutral-text/60">
                    Publicado por: <span className="font-semibold">{message.autorNombre || "Equipo barberia"}</span>
                  </p>

                  {canManage ? (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-border/30 pt-3">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(message)}>
                        Editar
                      </Button>
                      <DangerButton
                        className="min-h-12 px-md py-2.5 text-xs sm:w-auto"
                        loading={deletingId === message.id}
                        onClick={() => openDeleteMessageModal(message)}
                      >
                        Eliminar
                      </DangerButton>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </Reveal>

      {canManage ? (
        <Reveal>
          <Card
            title={isEditing ? "Editar aviso" : "Nuevo aviso"}
            subtitle="Al guardar, se notificara por correo a los clientes activos."
            contentClassName="p-7 sm:p-9"
          >
            <form onSubmit={submit} className="space-y-4">
              <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
                <Input
                  id="board-title"
                  label="Titulo del aviso"
                  value={form.titulo}
                  onChange={(event) => setForm((prev) => ({ ...prev, titulo: event.target.value }))}
                  placeholder="Ej: Cambio de horario esta semana"
                  maxLength={140}
                  required
                />
              </div>

              <div className="animate-fade-up" style={{ animationDelay: "50ms" }}>
                <Input
                  id="board-message"
                  label="Mensaje"
                  as="textarea"
                  value={form.mensaje}
                  onChange={(event) => setForm((prev) => ({ ...prev, mensaje: event.target.value }))}
                  placeholder="Escribe aqui el aviso para tus clientes"
                  maxLength={2000}
                  required
                />
              </div>

              <div className="animate-fade-up flex flex-wrap gap-3" style={{ animationDelay: "100ms" }}>
                <PrimaryButton type="submit" loading={saving} className="sm:w-auto">
                  {isEditing ? "Guardar cambios" : "Publicar aviso"}
                </PrimaryButton>
                {isEditing ? (
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Cancelar edicion
                  </Button>
                ) : null}
              </div>
            </form>
          </Card>
        </Reveal>
      ) : null}

      <Modal
        open={Boolean(deleteMessageTarget)}
        title="Eliminar aviso"
        onClose={closeDeleteMessageModal}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={Boolean(deletingId)}
              onClick={closeDeleteMessageModal}
            >
              Cancelar
            </Button>
            <DangerButton
              type="button"
              className="w-full sm:w-auto"
              loading={deletingId === deleteMessageTarget?.id}
              onClick={confirmDeleteMessage}
            >
              Eliminar aviso
            </DangerButton>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-neutral-text/80">
            Esta accion quitara el aviso del tablon publico y los clientes dejaran de verlo.
          </p>
          {deleteMessageTarget ? (
            <div className="rounded-[1.35rem] border border-danger/15 bg-danger/5 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-danger/75">
                Aviso seleccionado
              </p>
              <h4 className="mt-2 font-display text-xl font-bold text-primary">
                {deleteMessageTarget.titulo}
              </h4>
              <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-neutral-text/75">
                {deleteMessageTarget.mensaje}
              </p>
            </div>
          ) : null}
        </div>
      </Modal>

    </main>
  );
}
