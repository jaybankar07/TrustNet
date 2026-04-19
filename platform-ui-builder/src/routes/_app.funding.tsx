import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { HandHelping, ShieldCheck, LineChart, Building2, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/funding")({
  component: FundingDiscovery,
});

function FundingDiscovery() {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [valuation, setValuation] = useState("");

  const { data: pitches = [], refetch } = useQuery({
    queryKey: ["funding-pitches"],
    queryFn: async () => {
      const res = await fetchApi("/companies/funding/");
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || data;
    },
  });

  const handlePost = async () => {
    const res = await fetchApi("/companies/funding/", {
      method: "POST",
      body: JSON.stringify({
        title,
        description: desc,
        valuation,
        equity_offered: 10,
        pitch_document_url: "",
      }),
    });
    if (res.ok) {
      toast.success("Investment Pitch Published successfully");
      setModalOpen(false);
      refetch();
    } else {
      toast.error("You must belong to a verified Company to post a Pitch.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment & Funding</h1>
          <p className="mt-2 text-muted-foreground">
            Direct founder-to-investor ecosystem. Zero middlemen, zero brokers, 100% verified trust.
          </p>
        </div>
        <Button
          size="lg"
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => setModalOpen(true)}
        >
          <LineChart className="h-4 w-4" /> Submit Pitch
        </Button>
      </div>

      <div className="mb-6 rounded-lg bg-emerald-600/10 p-4 text-sm text-emerald-700 dark:text-emerald-400 flex gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <p>
          <strong>Anti-Broker Protocol Active:</strong> Every investment opportunity listed here
          guarantees direct communication with the verified Founder/Owner. No intermediary
          representatives are permitted.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {pitches.length === 0 && (
          <div className="col-span-2 text-center p-8 border border-dashed rounded-lg text-muted-foreground">
            No funding pitches found. Be the first founder to post a pitch!
          </div>
        )}
        {pitches.map((item: any) => (
          <div
            key={item.id}
            className="flex flex-col rounded-xl border bg-card shadow-sm hover:shadow-md transition-all h-full"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-inner flex items-center justify-center text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold leading-none">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.company?.name || "Startup"} • Local
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold tracking-tight">{item.valuation || "TBD"}</p>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Seeking ({item.equity_offered || "?"}% Equity)
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3 mb-6">{item.description}</p>

              <div className="mt-auto rounded-lg border bg-muted/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                    <UserCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      Primary Founder <ShieldCheck className="h-3 w-3 text-blue-500" />
                    </p>
                    <p className="text-xs text-muted-foreground">Verified Founder & CEO</p>
                  </div>
                </div>
                <Button
                  className="mt-3 w-full"
                  variant="secondary"
                  onClick={() => toast("Pitch Deck requested.")}
                >
                  Request Pitch Deck
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg border relative">
            <h2 className="text-xl font-bold mb-4">Submit Pitch</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Pitch Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next-Gen AI Supply Chain"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Elevator Pitch</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Explain the problem and solution..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Valuation</label>
                <Input
                  value={valuation}
                  onChange={(e) => setValuation(e.target.value)}
                  placeholder="$2.5M"
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
