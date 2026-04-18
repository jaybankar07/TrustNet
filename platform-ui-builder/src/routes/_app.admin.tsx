import { createFileRoute } from "@tanstack/react-router";
import { Users, ShieldCheck, AlertTriangle, Building2, Check, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";

export const Route = createFileRoute("/_app/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("verifications");

  const { data: metrics = { totalUsers: 0, verifiedUsers: 0, pendingReviews: 0, fraudAlerts: 0 } } =
    useQuery({
      queryKey: ["admin", "metrics"],
      queryFn: async () => {
        const res = await fetchApi("/admin-api/overview/");
        if (!res.ok) return { totalUsers: 0, verifiedUsers: 0, pendingReviews: 0, fraudAlerts: 0 };
        return res.json();
      },
    });

  const { data: verifications = [] } = useQuery({
    queryKey: ["admin", "verifications"],
    queryFn: async () => {
      const res = await fetchApi("/admin-api/verification/");
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || data;
    },
  });

  const { data: claims = [] } = useQuery({
    queryKey: ["admin", "claims"],
    queryFn: async () => {
      return [];
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl p-4 lg:p-6">
      <PageHeader
        title="Admin panel"
        description="Moderation, verification queues and fraud alerts."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={metrics.totalUsers?.toLocaleString() || "0"}
          icon={Users}
          delta="+0 this week"
        />
        <StatCard
          label="Verified"
          value={metrics.verifiedUsers?.toLocaleString() || "0"}
          icon={ShieldCheck}
          tone="success"
        />
        <StatCard
          label="Pending reviews"
          value={metrics.pendingReviews || "0"}
          icon={Building2}
          tone="warning"
        />
        <StatCard
          label="Fraud alerts"
          value={metrics.fraudAlerts || "0"}
          icon={AlertTriangle}
          tone="destructive"
        />
      </div>

      <Tabs defaultValue="verifications" onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
          <TabsTrigger value="companies">Company claims</TabsTrigger>
          <TabsTrigger value="events">Event moderation</TabsTrigger>
          <TabsTrigger value="fraud">Fraud alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="verifications">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifications.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{r.user_email || "Unknown"}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.type || "identity"}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium bg-success/10 text-success",
                          )}
                        >
                          5
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.status === "verified" ? "default" : "secondary"}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-success"
                          onClick={() => toast.success(`Approved`)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => toast.error(`Rejected`)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {verifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No pending verifications.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="companies">
          <div className="space-y-4">
            {(claims || []).length === 0 && (
              <div className="text-center p-8 text-sm text-muted-foreground border rounded-lg bg-card/50">
                No pending company claims.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <div className="space-y-4">
            <div className="text-center p-8 text-sm text-muted-foreground border rounded-lg bg-card/50">
              No recent reports recorded.
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fraud">
          <div className="space-y-4">
            <div className="text-center p-8 text-sm text-muted-foreground border rounded-lg bg-card/50">
              System is stable. No unhandled alerts.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
