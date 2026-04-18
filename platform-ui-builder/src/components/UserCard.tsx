import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "./VerifiedBadge";
import type { MockUser } from "@/lib/mock/users";

export function UserCard({ user, compact = false }: { user: MockUser; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <Link
          to="/profile/$userId"
          params={{ userId: user.id }}
          className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary"
        >
          <span className="truncate">{user.name}</span>
          {user.verification === "verified" && (
            <VerifiedBadge status="verified" size="sm" showLabel={false} />
          )}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{user.title}</p>
        {!compact && user.mutuals > 0 && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {user.mutuals} mutual connections
          </p>
        )}
      </div>
      <Button size="sm" variant="outline" className="shrink-0">
        Connect
      </Button>
    </div>
  );
}
