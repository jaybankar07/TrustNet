import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, MapPin, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrustIndicator } from "@/components/TrustIndicator";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useCurrentUser, fetchApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/events/$eventId")({
  loader: ({ params }) => {
    return { eventId: params.eventId };
  },
  component: EventDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm">
      Event not found.{" "}
      <Link to="/events" className="text-primary hover:underline">
        Back to events
      </Link>
    </div>
  ),
});

function EventDetail() {
  const { eventId } = Route.useLoaderData();
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState("");

  const { data: event } = useQuery({
    queryKey: ["events", eventId],
    queryFn: async () => {
      const res = await fetchApi(`/events/${eventId}/`);
      if (!res.ok) throw notFound();
      return res.json();
    },
  });

  useEffect(() => {
    if (event?.tickets?.length) setTier(event.tickets[0].name);
  }, [event]);

  if (!event) return null;

  const eventDate = new Date(event.start_time);
  const dateStr = eventDate.toLocaleDateString();
  const timeStr = eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="mx-auto w-full max-w-5xl p-4 lg:p-6">
      <Link
        to="/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All events
      </Link>
      <div className="mt-4 overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="relative h-56 w-full sm:h-72">
          <img
            src={
              event.cover_image ||
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80"
            }
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute right-3 top-3 flex gap-2">
            <TrustIndicator score={event.trustScore} />
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Badge variant="secondary">{event.category}</Badge>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">{event.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Hosted by <span className="font-medium text-foreground/80">{event.organizer}</span>
              </p>
              <div className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-3">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {dateStr} · {timeStr}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {event.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {event.attendees_count}/{event.max_attendees || "∞"}
                </span>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shrink-0">
                  Register
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register for {event.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  {event.tickets.map((t: (typeof event.tickets)[number]) => (
                    <button
                      key={t.name}
                      onClick={() => setTier(t.name)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${tier === t.name ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40"}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-sm font-semibold">{t.price}</p>
                      </div>
                      <ul className="mt-1 text-xs text-muted-foreground">
                        {t.perks.map((p: string) => (
                          <li key={p}>· {p}</li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
                <DialogFooter className="flex-col gap-2 sm:flex-col items-center w-full">
                  <div className="w-full flex items-center justify-between rounded-md bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>
                        Payment is securely held in <b>TrustNet Escrow</b>
                      </span>
                    </div>
                    <span>Funds release only after event</span>
                  </div>
                  <div className="flex w-full justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          const res = await fetchApi(`/events/${eventId}/register/`, {
                            method: "POST",
                          });
                          if (!res.ok) throw new Error("Registration failed");
                          toast.success(`Registered — Paid via Escrow`);
                          setOpen(false);
                        } catch (err: any) {
                          toast.error(err.message);
                        }
                      }}
                    >
                      Deposit to Escrow & Register
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold">About</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold">Agenda</p>
            <ol className="mt-3 space-y-3">
              {(event.agenda || []).map((a: (typeof event.agenda)[number]) => (
                <li key={a.time} className="flex gap-4">
                  <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                    {a.time}
                  </p>
                  <p className="text-sm">{a.title}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-success" /> Organizer trust
            </p>
            <div className="mt-3 flex items-center gap-2">
              {event.organizer_verified && <VerifiedBadge status="verified" size="sm" />}
              <p className="text-sm">{event.organizer_name}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Trust score {event.trust_score} based on past events, attendee reviews and
              verification status.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
