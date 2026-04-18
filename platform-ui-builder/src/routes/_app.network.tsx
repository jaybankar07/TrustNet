import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { UserCard } from "@/components/UserCard";
import { useCurrentUser, fetchApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_app/network")({
  component: () => {
    const { data: user } = useCurrentUser();
    const { data: networkUsers = [] } = useQuery({
      queryKey: ["network", "users"],
      queryFn: async () => {
        const res = await fetchApi("/auth/users/");
        const data = await res.json();
        return data.results || data;
      },
    });

    return (
      <div className="mx-auto w-full max-w-5xl p-4 lg:p-6">
        <PageHeader
          title="Your network"
          description="People you may know — all identity-verified."
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {networkUsers
            .filter((u: any) => u.id !== user?.id)
            .map((u: any) => (
              <UserCard
                key={u.id}
                user={{ ...u, name: u.full_name || u.name, avatar: u.avatar_url }}
              />
            ))}
          {networkUsers.length <= 1 && (
            <div className="col-span-full py-12 text-center text-muted-foreground italic">
              Connections will appear here as more people join.
            </div>
          )}
        </div>
      </div>
    );
  },
});
