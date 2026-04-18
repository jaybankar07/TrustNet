import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostComposer } from "@/components/PostComposer";
import { PostCard } from "@/components/PostCard";
import { UserCard } from "@/components/UserCard";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { fetchApi, useCurrentUser } from "@/lib/api";

export const Route = createFileRoute("/_app/feed")({
  component: Feed,
});

function Feed() {
  const { data: activeUser } = useCurrentUser();

  const { data: trending = [] } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const res = await fetchApi("/feed/trending/");
      return res.json();
    },
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", "active"],
    queryFn: async () => {
      const res = await fetchApi("/promotions/campaigns/");
      const data = await res.json();
      return data.results || data;
    },
  });

  const sponsored = campaigns[0];

  const { data: suggestions = [] } = useQuery({
    queryKey: ["users", "suggestions"],
    queryFn: async () => {
      const res = await fetchApi("/auth/users/?is_verified=true&limit=3");
      const data = await res.json();
      return (data.results || data).filter((u: any) => u.id !== activeUser?.id);
    },
    enabled: !!activeUser,
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetchApi("/feed/posts/");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      return data.results || data; // handle pagination natively
    },
  });

  // Don't block the feed on the current user loading — show posts immediately

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-5 p-4 lg:grid-cols-[260px_minmax(0,1fr)_300px] lg:p-6">
      <SEO title="User Feed" description="TrustNet Feed: The trusted professional network" />
      {/* Left: profile card */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        {activeUser ? (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="h-16 w-full bg-gradient-to-r from-primary/20 to-accent/20" />
            <div className="px-4 pb-4">
              <Link to="/profile/$userId" params={{ userId: activeUser.id }}>
                <Avatar className="-mt-8 h-14 w-14 border-4 border-card">
                  <AvatarImage src={activeUser.avatar_url} />
                  <AvatarFallback>
                    {(activeUser.full_name || activeUser.name || "U")[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="mt-2 flex items-center gap-1.5">
                <Link
                  to="/profile/$userId"
                  params={{ userId: activeUser.id }}
                  className="text-sm font-semibold hover:text-primary"
                >
                  {activeUser.full_name || activeUser.name}
                </Link>
                <VerifiedBadge
                  status={activeUser.verification_status as any}
                  size="sm"
                  showLabel={false}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {activeUser.title || "TrustNet Professional"}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg bg-muted/60 p-2">
                  <p className="font-semibold text-foreground">
                    {activeUser.connections_count || 0}
                  </p>
                  <p className="text-muted-foreground">Connections</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-2">
                  <p className="font-semibold text-foreground">{activeUser.followers_count || 0}</p>
                  <p className="text-muted-foreground">Followers</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-6 animate-pulse">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="mt-3 h-3 w-2/3 rounded bg-muted" />
            <div className="mt-2 h-2 w-1/2 rounded bg-muted" />
          </div>
        )}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quick links
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link to="/jobs" className="block rounded-md px-2 py-1 hover:bg-muted">
                Saved jobs
              </Link>
            </li>
            <li>
              <Link to="/events" className="block rounded-md px-2 py-1 hover:bg-muted">
                Your events
              </Link>
            </li>
            <li>
              <Link to="/wallet" className="block rounded-md px-2 py-1 hover:bg-muted">
                Wallet
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      <section className="space-y-4">
        <PostComposer />
        {isLoading && (
          <p className="text-center text-sm text-muted-foreground p-4">Loading feed...</p>
        )}
        {posts?.map((p: any) => (
          <PostCard key={p.id} post={p} />
        ))}
      </section>

      {/* Right rail */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Suggested for you
          </p>
          <div className="mt-3 space-y-2">
            {suggestions.map((u: any) => (
              <UserCard
                key={u.id}
                user={{
                  ...u,
                  name: u.full_name || u.name,
                  avatar: u.avatar_url,
                  verification: u.verification_status,
                }}
                compact
              />
            ))}
            {suggestions.length === 0 && (
              <p className="text-xs text-center text-muted-foreground italic">No suggestions yet</p>
            )}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" /> Trending
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {trending.map((t: any) => (
              <li key={t.hashtag}>
                <a href="#" className="text-primary hover:underline">
                  {t.hashtag}
                </a>
                <p className="text-xs text-muted-foreground">{t.count} posts this week</p>
              </li>
            ))}
            {trending.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No trending topics yet</p>
            )}
          </ul>
        </div>
        {sponsored ? (
          <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-accent/30 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Sponsored</p>
            <p className="mt-2 text-sm font-semibold">{sponsored.name || "Special Promotion"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {sponsored.target_type === "event" ? "Featured Event" : "Featured Post"}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-accent/30 p-4 shadow-sm opacity-60">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Sponsored</p>
            <p className="mt-2 text-sm font-semibold italic">Boost your visibility tonight.</p>
            <p className="mt-1 text-xs text-muted-foreground">TrustNet Ads — Get started</p>
          </div>
        )}
      </aside>
    </div>
  );
}
