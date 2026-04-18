import { ShieldAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function RestrictedBanner({
  title = "Verify your account to continue",
  description = "Complete identity verification to unlock applications, event creation and promotions.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-warning/15 p-2 text-warning">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button asChild size="sm">
        <Link to="/verify">Verify now</Link>
      </Button>
    </div>
  );
}
