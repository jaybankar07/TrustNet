import { BadgeCheck, Clock, ShieldAlert, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/lib/mock/users";

interface Props {
  status: VerificationStatus;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const map = {
  verified: {
    Icon: BadgeCheck,
    label: "Verified",
    cls: "text-success bg-success/10 border-success/20",
  },
  pending: { Icon: Clock, label: "Pending", cls: "text-warning bg-warning/10 border-warning/30" },
  rejected: {
    Icon: ShieldAlert,
    label: "Rejected",
    cls: "text-destructive bg-destructive/10 border-destructive/20",
  },
  unverified: {
    Icon: ShieldOff,
    label: "Unverified",
    cls: "text-muted-foreground bg-muted border-border",
  },
} as const;

export function VerifiedBadge({ status, size = "md", showLabel = true, className }: Props) {
  const { Icon, label, cls } = map[status];
  const sz = size === "sm" ? "text-[11px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  const ic = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        sz,
        cls,
        className,
      )}
    >
      <Icon className={ic} />
      {showLabel && label}
    </span>
  );
}
