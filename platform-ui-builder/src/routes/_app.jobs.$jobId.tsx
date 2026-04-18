import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Bookmark, Building2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { RestrictedBanner } from "@/components/RestrictedBanner";
import { useCurrentUser, fetchApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/jobs/$jobId")({
  loader: ({ params }) => {
    return { jobId: params.jobId };
  },
  component: JobDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm">
      Job not found.{" "}
      <Link to="/jobs" className="text-primary hover:underline">
        Back to jobs
      </Link>
    </div>
  ),
});

function JobDetail() {
  const { jobId } = Route.useLoaderData();
  const { data: user } = useCurrentUser();
  const verified = user?.verification_status === "verified";
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: job } = useQuery({
    queryKey: ["jobs", jobId],
    queryFn: async () => {
      const res = await fetchApi(`/jobs/${jobId}/`);
      if (!res.ok) throw notFound();
      return res.json();
    },
  });

  useEffect(() => {
    if (user) setName(user.full_name || user.name || "");
  }, [user]);

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (name.trim().length < 2) err.name = "Name is required";
    if (why.trim().length < 20) err.why = "Tell us a bit more (min 20 chars)";
    setErrors(err);
    if (Object.keys(err).length) return;

    try {
      const res = await fetchApi(`/jobs/${jobId}/apply/`, {
        method: "POST",
        body: JSON.stringify({ cover_letter: why }),
      });
      if (!res.ok) throw new Error("Failed to apply");
      toast.success(`Application submitted to ${job?.company_name || "the company"}`);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!job) return null;

  return (
    <div className="mx-auto w-full max-w-4xl p-4 lg:p-6">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All jobs
      </Link>
      {!verified && (
        <div className="mt-4">
          <RestrictedBanner />
        </div>
      )}
      <div className="mt-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-lg border bg-muted flex items-center justify-center">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{job.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground/80">{job.company_name}</span>
                {job.is_company_verified && (
                  <VerifiedBadge status="verified" size="sm" showLabel={false} />
                )}
                <span>·</span>
                <MapPin className="h-3.5 w-3.5" /> {job.location}{" "}
                {job.is_remote && (
                  <Badge variant="secondary" className="ml-1">
                    Remote
                  </Badge>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {typeof job.tags === "string"
                  ? job.tags.split(",").map((t: string) => (
                      <Badge key={t} variant="outline" className="font-normal">
                        {t.trim()}
                      </Badge>
                    ))
                  : null}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success("Job saved")}>
              <Bookmark className="h-4 w-4" /> Save
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!verified}>
                  Apply now
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply to {job.title}</DialogTitle>
                  <DialogDescription>
                    Your application goes directly to the hiring team.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={apply} className="space-y-3">
                  <div>
                    <Label htmlFor="appname">Full name</Label>
                    <Input
                      id="appname"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5"
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="why">Why are you a great fit?</Label>
                    <Textarea
                      id="why"
                      value={why}
                      onChange={(e) => setWhy(e.target.value)}
                      rows={4}
                      className="mt-1.5"
                      aria-invalid={!!errors.why}
                    />
                    {errors.why && <p className="mt-1 text-xs text-destructive">{errors.why}</p>}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Submit application</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold">About the role</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{job.description}</p>
            {job.requirements && (
              <>
                <p className="mt-5 text-sm font-semibold">What we're looking for</p>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.requirements}
                </p>
              </>
            )}
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Compensation
            </p>
            <p className="mt-1 text-sm font-semibold">{job.salary_range || "Competitive"}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Posted
            </p>
            <p className="mt-1 text-sm">{new Date(job.created_at).toLocaleDateString()}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
