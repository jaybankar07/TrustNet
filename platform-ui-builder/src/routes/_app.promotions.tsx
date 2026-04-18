import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  Megaphone,
  CheckCircle2,
  TrendingUp,
  Presentation,
  Tag,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/promotions")({
  component: Promotions,
});

function Promotions() {
  const [targetId, setTargetId] = useState("");
  const [budget, setBudget] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const { data: campaigns = [], refetch } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await fetchApi("/promotions/campaigns/");
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || data;
    },
  });

  const launchCampaign = async () => {
    const res = await fetchApi("/promotions/campaigns/", {
      method: "POST",
      body: JSON.stringify({
        target_type: "post",
        target_id: targetId,
        budget: parseFloat(budget),
        status: "active",
      }),
    });
    if (res.ok) {
      toast.success("Campaign launched successfully!");
      refetch();
    } else {
      toast.error("Failed to launch campaign. Check your wallet balance.");
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    const res = await fetchApi("/wallet/redeem-coupon/", {
      method: "POST",
      body: JSON.stringify({ code: couponCode }),
    });
    if (res.ok) {
      toast.success("Coupon redeemed! Check your wallet.");
      setCouponCode("");
    } else {
      toast.error("Invalid or expired coupon code.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Advertising & Promotions</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your sponsored campaigns, boost reach, and redeem exclusive advertising coupons.
        </p>
      </div>

      <div className="mb-10 grid gap-6 md:grid-cols-2">
        {/* Ad Campaign Launcher */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Start Campaign</h2>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Boost your profile, job listing, or event directly to verified professionals.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Promotion Target ID (Post UUID)
              </label>
              <Input
                placeholder="Enter Target ID..."
                className="mt-1"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Budget (TNT)</label>
              <Input
                type="number"
                placeholder="60000"
                className="mt-1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={launchCampaign}>
              Launch Sponsored Campaign
            </Button>
          </div>
        </div>

        {/* Coupons Engine */}
        <div className="rounded-xl border bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-indigo-500/10 p-3">
              <Tag className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold">Redeem Offers</h2>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Apply active platform referral coupons here to double your promotional budget!
          </p>

          <div className="rounded-lg border bg-background/50 p-4 relative backdrop-blur-sm">
            <div className="absolute -top-3 right-4 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest shadow-sm">
              Hackathon Offer
            </div>
            <p className="text-sm font-semibold">SPEND 60K, GET 120K TNT</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Code:{" "}
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                HACK2026
              </span>
            </p>
          </div>

          <div className="mt-6 flex gap-2">
            <Input
              placeholder="Enter code..."
              className="font-mono uppercase"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <Button variant="secondary" className="px-6 border" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
        </div>
      </div>

      <h3 className="mb-4 text-xl font-semibold">Active Campaigns</h3>
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center shadow-sm">
          <Presentation className="h-10 w-10 text-muted" />
          <h4 className="mt-4 font-semibold">No active sponsorships</h4>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            You haven't launched any ad campaigns yet. Boost a post to see its reach grow here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c: any) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="rounded bg-indigo-500/10 p-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Campaign: {c.target_type}</p>
                  <p className="text-xs text-muted-foreground font-mono">Target: {c.target_id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  {c.spend} / {c.budget} TNT
                </p>
                <p className="text-xs text-green-500 font-semibold">{c.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
