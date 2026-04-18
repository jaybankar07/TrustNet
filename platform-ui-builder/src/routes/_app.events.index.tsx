import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { SEO } from "@/components/SEO";

export const Route = createFileRoute("/_app/events/")({
  component: EventsList,
});

const CATS = ["All", "Networking", "Conference", "Workshop", "Investor", "Hackathon"] as const;

function EventsList() {
  const [cat, setCat] = useState<string>("All");
  const [view, setView] = useState<"grid" | "list">("grid");

  const { data: rawEvents = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetchApi("/events/");
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || data;
    },
  });

  const filtered = useMemo(
    () => rawEvents.filter((e: any) => cat === "All" || e.category === cat),
    [cat, rawEvents],
  );

  return (
    <div className="mx-auto w-full max-w-5xl p-4 lg:p-6 space-y-6">
      <SEO title="Events" description="Browse and register for professional events" />

      <PageHeader
        title="Events"
        description="Trusted gatherings — every organizer is verified."
        actions={
          <Button asChild>
            <Link to="/events/new">
              <Plus className="h-4 w-4" /> Create event
            </Link>
          </Button>
        }
      />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                cat === c
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-md border bg-card p-0.5">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setView("grid")}
          >
            <LayoutGrid />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setView("list")}
          >
            <List />
          </Button>
        </div>
      </div>

      {isLoading && (
        <p className="text-center text-sm text-muted-foreground p-4">Loading events...</p>
      )}
      {view === "grid" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e: any) => (
            <EventCard key={e.id} event={{ ...e, organizerVerified: true }} />
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {filtered.map((e: any) => (
            <Link
              key={e.id}
              to="/events/$eventId"
              params={{ eventId: e.id }}
              className="flex items-center gap-4 rounded-xl border bg-card p-3 shadow-sm transition-colors hover:border-primary/30"
            >
              <img
                src={
                  e.cover ||
                  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=70"
                }
                alt={e.title}
                className="h-16 w-24 rounded-md border object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{e.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.date || e.created_at).toLocaleDateString()} · {e.location}
                </p>
              </div>
              <Badge variant="secondary">{e.category || "General"}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
