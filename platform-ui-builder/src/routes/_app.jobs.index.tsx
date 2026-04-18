import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { JobCard } from "@/components/JobCard";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Briefcase, Plus, MapPin, DollarSign, Building } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/jobs/")({
  component: JobsList,
});

const TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"] as const;
const WORK_MODES = ["On-site", "Remote", "Hybrid"] as const;

function CreateJobDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    salary_range: "",
    job_type: "Full-time",
    work_mode: "On-site",
    company_name: "",
    requirements: "",
    benefits: "",
  });

  // Fetch user's companies to pick a company_id for posting
  const { data: companies = [] } = useQuery({
    queryKey: ["my-companies"],
    queryFn: async () => {
      const res = await fetchApi("/companies/?mine=true");
      const d = await res.json();
      return d.results || d;
    },
    enabled: open,
  });

  const [companyId, setCompanyId] = useState<string>("");

  const createJob = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetchApi("/jobs/", { method: "POST", body: JSON.stringify(payload) });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detail || JSON.stringify(e));
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Job posted successfully!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) {
      toast.error("Fill in all required fields");
      return;
    }
    createJob.mutate({
      title: form.title,
      description: `${form.description}${form.requirements ? `\n\n**Requirements:**\n${form.requirements}` : ""}${form.benefits ? `\n\n**Benefits:**\n${form.benefits}` : ""}`,
      location: form.location,
      salary_range: form.salary_range,
      job_type: form.job_type,
      work_mode: form.work_mode,
      // backend resolves company by name+city from registered companies
      company_name_input: form.company_name,
      city_input: form.location,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a Job</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new job listing visible to verified professionals.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Job Title *</Label>
              <Input
                value={form.title}
                onChange={f("title")}
                placeholder="e.g. Senior Software Engineer"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label>Company Name</Label>
              <div className="relative mt-1.5">
                <Building className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.company_name}
                  onChange={f("company_name")}
                  placeholder="Your company name"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Location *</Label>
              <div className="relative mt-1.5">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.location}
                  onChange={f("location")}
                  placeholder="e.g. Bangalore / Remote"
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <Label>Job Type</Label>
              <Select
                value={form.job_type}
                onValueChange={(v) => setForm((p) => ({ ...p, job_type: v }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Work Mode</Label>
              <Select
                value={form.work_mode}
                onValueChange={(v) => setForm((p) => ({ ...p, work_mode: v }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Salary Range</Label>
              <div className="relative mt-1.5">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.salary_range}
                  onChange={f("salary_range")}
                  placeholder="e.g. ₹15L – ₹25L per annum"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="col-span-2">
              <Label>Job Description *</Label>
              <Textarea
                value={form.description}
                onChange={f("description")}
                rows={4}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                className="mt-1.5"
                required
              />
            </div>
            <div className="col-span-2">
              <Label>Requirements</Label>
              <Textarea
                value={form.requirements}
                onChange={f("requirements")}
                rows={3}
                placeholder="• 3+ years of experience&#10;• Strong knowledge of React&#10;• etc."
                className="mt-1.5"
              />
            </div>
            <div className="col-span-2">
              <Label>Benefits</Label>
              <Textarea
                value={form.benefits}
                onChange={f("benefits")}
                rows={2}
                placeholder="• Health insurance&#10;• Stock options&#10;• Remote work"
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createJob.isPending}>
              {createJob.isPending ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function JobsList() {
  const [q, setQ] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [types, setTypes] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: rawJobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await fetchApi("/jobs/");
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || data;
    },
  });

  const filtered = useMemo(() => {
    return rawJobs.filter((j: any) => {
      const companyName = typeof j.company === "object" ? j.company?.name : j.company_name || "";
      const text = `${j.title} ${companyName} ${j.location || ""}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (remoteOnly && !j.location?.toLowerCase().includes("remote") && !j.is_remote) return false;
      if (
        types.length > 0 &&
        !types.some((t) => j.job_type?.includes(t) || j.employment_type?.includes(t))
      )
        return false;
      return true;
    });
  }, [q, remoteOnly, types, rawJobs]);

  return (
    <div className="mx-auto w-full max-w-7xl p-4 lg:p-6">
      <PageHeader
        title="Jobs"
        description="Verified roles from trusted companies."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Post a Job
          </Button>
        }
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Search
            </Label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Role, company, location"
                className="pl-9"
              />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Type
            </p>
            <div className="mt-3 space-y-2">
              {TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={types.includes(t)}
                    onCheckedChange={(v) =>
                      setTypes((arr) => (v ? [...arr, t] : arr.filter((x) => x !== t)))
                    }
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Workplace
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <Checkbox checked={remoteOnly} onCheckedChange={(v) => setRemoteOnly(!!v)} />
              Remote only
            </label>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setQ("");
              setRemoteOnly(false);
              setTypes([]);
            }}
          >
            Reset filters
          </Button>
        </aside>

        <section>
          <p className="mb-3 text-sm text-muted-foreground">{filtered.length} results</p>
          {isLoading ? (
            <p className="text-center text-sm text-muted-foreground p-4">Loading jobs...</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No matching jobs"
              description="Try removing filters or post a new job!"
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((j: any) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          )}
        </section>
      </div>

      <CreateJobDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
