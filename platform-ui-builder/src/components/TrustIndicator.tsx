import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustIndicator({ score, className }: { score: number; className?: string }) {
  const tone =
    score >= 90
      ? "text-success bg-success/10 border-success/20"
      : score >= 75
        ? "text-info bg-info/10 border-info/20"
        : "text-warning bg-warning/10 border-warning/30";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium",
        tone,
        className,
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      Trust {score}
    </span>
  );
}
