import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Building2, Sparkles, MessageSquare, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";
import { PostCard } from "@/components/PostCard";
import { useCurrentUser, fetchApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

export const Route = createFileRoute("/_app/profile/$userId")({
  loader: ({ params }) => {
    return { userId: params.userId };
  },
  component: Profile,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <p className="text-sm font-semibold">Profile not found</p>
      <Link to="/feed" className="mt-2 inline-block text-primary hover:underline">
        Back to feed
      </Link>
    </div>
  ),
});

function Profile() {
  const { userId } = Route.useLoaderData();
  const { data: myUser } = useCurrentUser();
  const isMe = userId === myUser?.id || userId === "me";

  const { data: targetUser, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (isMe) return myUser;
      const res = await fetchApi(`/auth/profile/${userId}/`);
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: userPosts = [] } = useQuery({
    queryKey: ["posts", "user", userId],
    queryFn: async () => {
      const res = await fetchApi(`/feed/posts/?author=${userId}`);
      const data = await res.json();
      return data.results || data;
    },
  });

  const { data: profileTips } = useQuery({
    queryKey: ["profile-tips", userId],
    queryFn: async () => {
      if (!isMe) return null;
      const res = await fetchApi("/trust/profile-tips/");
      if (res.ok) {
        const d = await res.json();
        return d.tips;
      }
      return null;
    },
    enabled: isMe,
  });

  const user = targetUser || null;

  if (isLoading) return <div className="p-10 text-center">Loading Profile...</div>;
  if (!user) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm font-semibold">Profile not found</p>
        <Link to="/feed" className="mt-2 inline-block text-primary hover:underline">
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-4 lg:p-6">
      <SEO
        title={`${user.name}'s Profile`}
        description={`Professional profile of ${user.name} on TrustNet`}
      />
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div
          className="h-40 w-full sm:h-56"
          style={{
            background: user.cover || "linear-gradient(to right, #4158D0, #C850C0, #FFCC70)",
          }}
        />
        <div className="px-5 pb-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="-mt-12 h-24 w-24 border-4 border-card sm:-mt-16 sm:h-28 sm:w-28">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight">{user.name}</h1>
                  <VerifiedBadge status={user.verification_status} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.title} · {user.company}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {user.location}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {isMe ? (
                <Button asChild variant="outline" size="sm">
                  <Link to="/profile/edit">Edit profile</Link>
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={() => toast.success(`Connection request sent to ${user.name}`)}
                  >
                    <UserPlus className="h-4 w-4" /> Connect
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast("Message thread mock")}>
                    <MessageSquare className="h-4 w-4" /> Message
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-5 text-sm">
            <div>
              <span className="font-semibold text-foreground">{user.connections}</span>{" "}
              <span className="text-muted-foreground">connections</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">
                {user.followers.toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground">followers</span>
            </div>
            {!isMe && user.mutuals > 0 && (
              <div>
                <span className="font-semibold text-foreground">{user.mutuals}</span>{" "}
                <span className="text-muted-foreground">mutual connections</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <Tabs defaultValue="about">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="space-y-5">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold">About</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{user.about}</p>
              </div>
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold">Skills</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {user.skills.map((s: string) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="experience">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold">Experience</p>
                <ol className="mt-4 space-y-5">
                  {user.experience.map((e: (typeof user.experience)[number]) => (
                    <li key={e.role + e.company} className="flex gap-4">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{e.role}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.company} · {e.period}
                        </p>
                        {e.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </TabsContent>
            <TabsContent value="posts" className="space-y-4">
              {userPosts.map((p: any) => (
                <PostCard key={p.id} post={p} />
              ))}
              {userPosts.length === 0 && (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No posts yet.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4">
          {isMe && (
            <AIAssistantPanel
              title="AI Profile Coach"
              suggestions={
                profileTips
                  ? profileTips
                      .split("\n")
                      .map((s: string) => s.replace(/^\*\s*/, "").trim())
                      .filter((s: string) => s.length > 0)
                  : ["Scanning your profile for improvements..."]
              }
              onApply={() => toast.success("Suggestion applied to profile.")}
            />
          )}
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> People also viewed
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Visit the network to discover more.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link to="/network">Browse network</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
