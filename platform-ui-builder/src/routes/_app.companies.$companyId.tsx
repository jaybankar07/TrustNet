import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/companies/$companyId")({
  loader: ({ params }) => {
    return { companyId: params.companyId };
  },
  component: function CompanyDetail() {
    const { companyId } = Route.useLoaderData();
    const { data: company } = useQuery({
      queryKey: ["companies", companyId],
      queryFn: async () => {
        const res = await fetchApi(`/companies/${companyId}/`);
        if (!res.ok) throw notFound();
        return res.json();
      },
    });

    if (!company) return null;

    return (
      <div className="mx-auto w-full max-w-4xl p-4 lg:p-6">
        <Link
          to="/companies"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All companies
        </Link>
        <div className="mt-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white bg-primary/10 text-primary">
              {company.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">{company.name}</h1>
                {company.is_verified && <VerifiedBadge status="verified" size="sm" />}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {company.industry || "Technology Company"}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {company.location || "Remote"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {company.size || "10-50"}
                </span>
              </div>
            </div>
            <Button onClick={() => toast.success("Following")}>Follow</Button>
          </div>
          <PageHeader className="mt-8" title="About" />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {company.description || "No description provided."}
          </p>
        </div>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-10 text-center text-sm">Company not found.</div>,
});
