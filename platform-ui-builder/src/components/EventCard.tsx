import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Users } from "lucide-react";
import { TrustIndicator } from "./TrustIndicator";
import { Badge } from "@/components/ui/badge";

export function EventCard({ event }: { event: any }) {
  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative h-36 w-full overflow-hidden">
        <img
          src={
            event.cover || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
          }
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="secondary" className="backdrop-blur-sm">
            {event.category || "Networking"}
          </Badge>
        </div>
        <div className="absolute right-3 top-3">
          <TrustIndicator score={event.trust_score ?? event.trustScore ?? 0} />
        </div>
      </div>
      <div className="p-4">
        <p className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
          {event.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          by {typeof event.organizer === "object" ? event.organizer?.name : event.organizer}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {event.date} {event.time ? `· ${event.time}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {event.location || (event.is_online ? "Online" : "TBD")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            {event.registration_count ?? event.attendees ?? 0} /{" "}
            {event.max_attendees ?? event.capacity ?? "∞"} attending
          </span>
        </div>
      </div>
    </Link>
  );
}
