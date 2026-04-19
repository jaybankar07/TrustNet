import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useCurrentUser, fetchApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile/edit")({
  component: EditProfile,
});

function EditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setName(user.full_name || user.name || "");
      setTitle(user.title || "");
      setAbout(user.about || "");
      setSkills(user.skills || []);
    }
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (name.trim().length < 2) err.name = "Name is required";
    if (about.length > 600) err.about = "Keep it under 600 characters";
    setErrors(err);
    if (Object.keys(err).length) return;

    try {
      const res = await fetchApi("/auth/profile/edit/", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: name,
          title,
          about,
          skills,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");

      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Profile updated");
      navigate({ to: "/profile/$userId", params: { userId: user?.id || "me" } });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4 lg:p-6">
      <PageHeader
        title="Edit profile"
        description="Keep your profile sharp. Verified accounts get 5× more profile views."
      />
      <form onSubmit={save} className="mt-6 space-y-6">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold">Basics</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="title">Headline</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="about">About</Label>
            <Textarea
              id="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={5}
              className="mt-1.5"
              aria-invalid={!!errors.about}
            />
            <div className="mt-1 flex justify-between text-xs">
              {errors.about ? <p className="text-destructive">{errors.about}</p> : <span />}
              <span className="text-muted-foreground">{about.length}/600</span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold">Skills</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <Badge key={s} variant="secondary" className="gap-1 pr-1">
                {s}
                <button
                  type="button"
                  onClick={() => setSkills((arr) => arr.filter((x) => x !== s))}
                  className="rounded p-0.5 hover:bg-background"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                  setSkills((arr) => [...arr, newSkill.trim()]);
                  setNewSkill("");
                }
              }}
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm text-center py-8">
          <p className="text-sm font-semibold text-muted-foreground">
            Experience management coming soon
          </p>
          <p className="mt-1 text-xs text-muted-foreground italic">
            Add your roles via the TrustNet mobile app for full verification.
          </p>
        </section>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate({ to: "/profile/$userId", params: { userId: user?.id || "me" } })
            }
          >
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  );
}
