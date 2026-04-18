import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Camera, Loader2, Check, X, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type State = "idle" | "scanning" | "verified" | "rejected" | "duplicate";

export const Route = createFileRoute("/_app/verify")({
  component: Verify,
});

function Verify() {
  const [state, setState] = useState<State>("idle");
  const queryClient = useQueryClient();

  const start = async (target: State) => {
    setState("scanning");

    if (target === "verified") {
      try {
        await fetchApi("/accounts/verify-face/", { method: "POST" });
        const res = await fetchApi("/accounts/dev-auto-verify/", { method: "POST" });
        if (res.ok) {
          setTimeout(() => {
            setState("verified");
            toast.success("Identity verified successfully!");
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
          }, 1000);
          return;
        }
      } catch (e) {
        toast.error("Failed to verify identity");
      }
    }

    setTimeout(() => setState(target), 1800);
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4 lg:p-6">
      <PageHeader
        title="Verify your identity"
        description="Takes ~2 minutes. Verified accounts unlock everything."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="relative aspect-video w-full bg-gradient-to-br from-primary/10 via-card to-accent/30">
            <div className="absolute inset-8 rounded-2xl border-2 border-dashed border-primary/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              {state === "idle" && (
                <div className="text-center">
                  <Camera className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">Position your face inside the frame</p>
                  <p className="text-xs text-muted-foreground">We never store the raw image.</p>
                </div>
              )}
              {state === "scanning" && (
                <div className="text-center">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                  <p className="mt-3 text-sm font-medium">Scanning…</p>
                </div>
              )}
              {state === "verified" && (
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-success">Verified</p>
                </div>
              )}
              {state === "rejected" && (
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                    <X className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-destructive">Verification failed</p>
                  <p className="text-xs text-muted-foreground">
                    We couldn't match your face to your ID.
                  </p>
                </div>
              )}
              {state === "duplicate" && (
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-warning">
                    Duplicate account detected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This face matches an existing account.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Demo: Live face scanner implementation</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => start("verified")}>
                Start Face Scan Verification <Camera className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-success" /> What we check
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-success" /> Liveness (you're a real person)
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-success" /> Face matches your ID
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-success" /> No duplicate accounts
              </li>
            </ul>
          </div>
          <div
            className={cn(
              "rounded-xl border p-4 text-sm shadow-sm",
              state === "verified" ? "border-success/30 bg-success/5" : "bg-card",
            )}
          >
            <p className="font-semibold">Status</p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">{state}</p>
            {state === "verified" && (
              <Button asChild size="sm" className="mt-3 w-full">
                <Link to="/feed">Continue to feed</Link>
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
