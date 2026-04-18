import { Link } from "@tanstack/react-router";
import { Bookmark, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "./VerifiedBadge";
import type { MockJob } from "@/lib/mock/jobs";

export function JobCard({ job }: { job: any }) {
  return (
    <Link
      to="/jobs/$jobId"
      params={{ jobId: job.id }}
      className="group block rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <img
          src={
            job.company?.logo_url ||
            job.companyLogo ||
            "https://ui-avatars.com/api/?name=" +
              (job.company?.name || job.company) +
              "&background=random"
          }
          alt={job.company?.name || job.company}
          className="h-12 w-12 rounded-lg border"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                {job.title}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {typeof job.company === "object" ? job.company?.name : job.company}
                </span>
                {(job.company?.is_verified || job.verifiedCompany) && (
                  <VerifiedBadge status="verified" size="sm" showLabel={false} />
                )}
                <span>·</span>
                <MapPin className="h-3 w-3" />
                <span>{job.location}</span>
                {(job.remote || job.location?.toLowerCase().includes("remote")) && (
                  <Badge variant="secondary" className="ml-1">
                    Remote
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <Bookmark className={job.saved ? "fill-primary text-primary" : ""} />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(job.tags || ["Hiring"]).slice(0, 4).map((t: any) => (
              <Badge key={t} variant="outline" className="font-normal">
                {t}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{job.salary_range || job.salary}</span>
            <span>
              {job.created_at ? new Date(job.created_at).toLocaleDateString() : job.postedAt}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
