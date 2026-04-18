import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { fetchApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_app/companies/")({
  component: () => {
    const { data: companies = [] } = useQuery({
      queryKey: ["companies"],
      queryFn: async () => {
        const res = await fetchApi("/companies/");
        const data = await res.json();
        return data.results || data;
      },
    });

    return (
      <div className="mx-auto w-full max-w-6xl p-4 lg:p-6">
        <PageHeader
          title="Companies"
          description="Verified companies hiring and hosting on TrustNet."
          actions={
            <Button asChild variant="outline">
              <Link to="/companies/claim">Claim a company</Link>
            </Button>
          }
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c: any) => (
            <Link
              key={c.id}
              to="/companies/$companyId"
              params={{ companyId: c.id }}
              className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white bg-primary/10">
                  {c.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    {c.is_verified && (
                      <VerifiedBadge status="verified" size="sm" showLabel={false} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{c.industry || "Technology"}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {c.description || c.tagline}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {c.size || "10-50"} · {c.location || "Remote"}
                </span>
              </div>
            </Link>
          ))}
          {companies.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground italic">
              No companies found. Be the first to claim one!
            </div>
          )}
        </div>
      </div>
    );
  },
});
