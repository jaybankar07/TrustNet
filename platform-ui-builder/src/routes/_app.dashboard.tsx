import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Users, Calendar, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { PostCard } from "@/components/PostCard";
import { JobCard } from "@/components/JobCard";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { fetchApi, useCurrentUser } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: user } = useCurrentUser();
  const firstName = (user?.full_name || user?.name || "there").split(" ")[0];

  const { data: posts = [] } = useQuery({
    queryKey: ["posts", "recent"],
    queryFn: async () => {
      const res = await fetchApi("/feed/posts/");
      const data = await res.json();
      return data.results || data;
    },
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs", "recent"],
    queryFn: async () => {
      const res = await fetchApi("/jobs/");
      const data = await res.json();
      return data.results || data;
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events", "recent"],
    queryFn: async () => {
      const res = await fetchApi("/events/");
      const data = await res.json();
      return data.results || data;
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl p-4 lg:p-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening across your network."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Profile views" value="0" delta="Just joined" icon={Users} />
        <StatCard label="Trust score" value={user?.trust_score || 0} icon={Users} tone="success" />
        <StatCard label="Job matches" value={jobs.length} icon={Briefcase} />
        <StatCard label="Upcoming events" value={events.length} icon={Calendar} tone="warning" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Recent activity</p>
            <Button asChild variant="ghost" size="sm">
              <Link to="/feed">
                View feed <TrendingUp className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {posts.slice(0, 2).map((p: any) => (
            <PostCard key={p.id} post={p} />
          ))}
        </section>
        <aside className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Top jobs for you</p>
              <Button asChild variant="ghost" size="sm">
                <Link to="/jobs">All</Link>
              </Button>
            </div>
            <div className="space-y-2">
              {jobs.slice(0, 2).map((j: any) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Upcoming events</p>
              <Button asChild variant="ghost" size="sm">
                <Link to="/events">All</Link>
              </Button>
            </div>
            <div className="space-y-2">
              {events.slice(0, 1).map((e: any) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
