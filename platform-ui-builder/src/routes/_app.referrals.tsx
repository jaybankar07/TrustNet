import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { fetchApi } from "@/lib/api";
import { Trophy, Gift, Users, Copy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/referrals")({
  component: ReferralsPage,
});

function ReferralsPage() {
  const { data: myCode } = useQuery({
    queryKey: ["referrals", "my-code"],
    queryFn: async () => {
      const res = await fetchApi("/referrals/my-code/");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["referrals", "leaderboard"],
    queryFn: async () => {
      const res = await fetchApi("/referrals/leaderboard/");
      if (!res.ok) return [];
      return res.json().then((data) => data.results || data);
    },
  });

  const copyCode = () => {
    if (!myCode) return;
    navigator.clipboard.writeText(myCode.code);
    toast.success("Referral code copied to clipboard");
  };

  return (
    <div className="mx-auto w-full max-w-5xl p-4 lg:p-6 space-y-6">
      <PageHeader
        title="Referrals & Rewards"
        description="Grow the network of trusted professionals and earn wallet credits."
      />

      {/* Hero Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background p-6 shadow-sm">
          <div className="relative z-10">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Gift className="h-5 w-5 text-indigo-500" /> Your Referral Code
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Share this code with your network.</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="rounded-lg border bg-background px-4 py-2 text-xl font-mono tracking-widest font-bold">
                {myCode ? myCode.code : "LOADING..."}
              </div>
              <Button onClick={copyCode} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Sparkles className="absolute -bottom-4 -right-4 h-32 w-32 text-indigo-500/10" />
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" /> Usage Stats
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{myCode?.usages_count || 0}</span>
            <span className="text-sm font-medium text-muted-foreground">referrals</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{myCode?.reward_points || 0}</span>
            <span className="text-sm font-medium text-amber-500">VP Earned</span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <h3 className="text-xl font-bold mt-8 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-amber-500" /> Top Referrers
      </h3>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 border-b bg-muted/40 p-4 font-medium text-sm text-muted-foreground">
          <div className="w-8 text-center">Rank</div>
          <div>Code</div>
          <div className="text-right">VP Earned</div>
        </div>
        <div className="divide-y">
          {leaderboard.map((item: any, idx: number) => (
            <div
              key={item.id}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 transition-colors hover:bg-muted/30",
                idx === 0 && "bg-amber-500/5",
              )}
            >
              <div
                className={cn(
                  "w-8 text-center font-bold text-sm",
                  idx === 0
                    ? "text-amber-500"
                    : idx === 1
                      ? "text-slate-400"
                      : idx === 2
                        ? "text-amber-700"
                        : "text-muted-foreground",
                )}
              >
                #{idx + 1}
              </div>
              <div className="font-mono text-sm tracking-wide">{item.code}</div>
              <div className="text-right font-semibold text-amber-500">{item.reward_points}</div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No referrals recorded yet. Be the first!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
