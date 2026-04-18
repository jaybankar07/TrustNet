import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Briefcase, Handshake, ShieldCheck, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/b2b")({
  component: B2BExchange,
});

function B2BExchange() {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [budget, setBudget] = useState("");

  const { data: projects = [], refetch } = useQuery({
    queryKey: ["b2b-projects"],
    queryFn: async () => {
      const res = await fetchApi("/companies/b2b/projects/");
      const data = await res.json();
      return data.results || data;
    },
  });

  const handlePost = async () => {
    // Attempt post
    const res = await fetchApi("/companies/b2b/projects/", {
      method: "POST",
      body: JSON.stringify({ title, description: desc, budget, requires_verified_bidders: true }),
    });
    if (res.ok) {
      toast.success("RFP Published successfully");
      setModalOpen(false);
      refetch();
    } else {
      toast.error("You must belong to a verified Company to post a B2B project.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">B2B Service Exchange</h1>
          <p className="mt-2 text-muted-foreground">
            Discover verified business-to-business project contracts and specialized service needs.
          </p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => setModalOpen(true)}>
          <Briefcase className="h-4 w-4" /> Publish RFP
        </Button>
      </div>

      <div className="mb-6 rounded-lg bg-primary/10 p-4 text-sm text-primary flex gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <p>
          You are viewing premium corporate requirements. Only officially verified businesses via
          GST registry check can bid or post projects.
        </p>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 && (
          <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
            No B2B RFPs posted yet. Be the first to publish a requirement!
          </div>
        )}
        {projects.map((item: any) => (
          <div
            key={item.id}
            className="group relative rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-primary/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg hover:underline cursor-pointer">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.company?.name || "Company"} • Posted recently
                </p>
              </div>
              <div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                Budget: {item.budget || "Negotiable"}
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground/80">{item.description}</p>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="flex -space-x-2">
                <span className="text-xs font-medium text-muted-foreground">
                  0 proposals submitted
                </span>
              </div>
              <Button
                variant="outline"
                className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground"
                onClick={() => toast("Proposal system available.")}
              >
                <Handshake className="h-4 w-4" /> Submit Proposal
              </Button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg border relative">
            <h2 className="text-xl font-bold mb-4">Post B2B Project</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Server Migration"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Details..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Budget</label>
                <Input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="$5,000"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePost}>Publish</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
