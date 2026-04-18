import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RestrictedBanner } from "@/components/RestrictedBanner";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser, fetchApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/events/new")({
  component: CreateEvent,
});

const STEPS = ["Basics", "Schedule", "Tickets", "Review"];

function CreateEvent() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const verified = user?.verification_status === "verified";
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "Networking",
    ticketName: "Standard",
    ticketPrice: "Free",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createEvent = useMutation({
    mutationFn: async (payload: any) => {
      const resp = await fetchApi("/events/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error("Failed to create event");
      return resp.json();
    },
    onSuccess: () => {
      toast.success("Event published");
      navigate({ to: "/events" });
    },
    onError: () => toast.error("Submission failed"),
  });

  const validate = () => {
    const err: Record<string, string> = {};
    if (step === 0) {
      if (!data.title.trim()) err.title = "Required";
      if (data.description.length < 20) err.description = "At least 20 characters";
    }
    if (step === 1) {
      if (!data.date) err.date = "Pick a date";
      if (!data.time) err.time = "Pick a time";
      if (!data.location.trim()) err.location = "Required";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step === STEPS.length - 1) {
      const datetime = new Date(`${data.date}T${data.time || "00:00"}:00`).toISOString();
      createEvent.mutate({
        title: data.title,
        description: data.description,
        date: datetime,
        location: data.location,
        category: data.category,
      });
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4 lg:p-6">
      <PageHeader
        title="Create event"
        description="Hosting on TrustNet means verified attendees and a built-in trust score."
      />
      {!verified && (
        <div className="mt-4">
          <RestrictedBanner
            title="Verification required to host events"
            description="Verify your identity to publish events."
          />
        </div>
      )}

      <ol className="mt-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                i < step && "bg-success text-success-foreground",
                i === step && "bg-primary text-primary-foreground",
                i > step && "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                i === step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-xl border bg-card p-5 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event title</Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="mt-1.5"
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="cat">Category</Label>
              <select
                id="cat"
                value={data.category}
                onChange={(e) => setData({ ...data, category: e.target.value })}
                className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {["Networking", "Conference", "Workshop", "Investor", "Hackathon"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                rows={5}
                className="mt-1.5"
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-destructive">{errors.description}</p>
              )}
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={data.date}
                  onChange={(e) => setData({ ...data, date: e.target.value })}
                  className="mt-1.5"
                  aria-invalid={!!errors.date}
                />
                {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={data.time}
                  onChange={(e) => setData({ ...data, time: e.target.value })}
                  className="mt-1.5"
                  aria-invalid={!!errors.time}
                />
                {errors.time && <p className="mt-1 text-xs text-destructive">{errors.time}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="loc">Location</Label>
              <Input
                id="loc"
                value={data.location}
                onChange={(e) => setData({ ...data, location: e.target.value })}
                placeholder="City or Online"
                className="mt-1.5"
                aria-invalid={!!errors.location}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-destructive">{errors.location}</p>
              )}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="tname">Ticket name</Label>
                <Input
                  id="tname"
                  value={data.ticketName}
                  onChange={(e) => setData({ ...data, ticketName: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="tprice">Price</Label>
                <Input
                  id="tprice"
                  value={data.ticketPrice}
                  onChange={(e) => setData({ ...data, ticketPrice: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              You can add more tiers after publishing.
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">Review</p>
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="font-semibold">{data.title || "Untitled event"}</p>
              <p className="mt-1 text-muted-foreground">
                {data.date} · {data.time} · {data.location}
              </p>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{data.description}</p>
              <p className="mt-3">
                <span className="font-semibold">{data.ticketName}</span> — {data.ticketPrice}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          <Button onClick={next} disabled={!verified || createEvent.isPending}>
            {step === STEPS.length - 1
              ? createEvent.isPending
                ? "Publishing..."
                : "Publish event"
              : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
