import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: () => {
    const { data: user } = useCurrentUser();
    const email = user?.email || "loading...";
    const handle = user?.id?.slice(0, 8) || "user";

    return (
      <div className="mx-auto w-full max-w-3xl p-4 lg:p-6">
        <PageHeader
          title="Settings"
          description="Manage your account, notifications and privacy."
        />
        <Tabs defaultValue="account" className="mt-6">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="space-y-3">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <Label htmlFor="semail">Email</Label>
              <Input id="semail" defaultValue={email} className="mt-1.5" />
              <Label htmlFor="shandle" className="mt-4 block">
                Handle
              </Label>
              <Input id="shandle" defaultValue={handle} className="mt-1.5" />
              <div className="mt-4 flex justify-end">
                <Button onClick={() => toast.success("Saved")}>Save</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="notifications">
            <div className="rounded-xl border bg-card p-5 shadow-sm divide-y">
              {["Connection requests", "Job matches", "Event reminders", "Mentions"].map((l) => (
                <div
                  key={l}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{l}</p>
                    <p className="text-xs text-muted-foreground">Email + in-app</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="privacy">
            <div className="rounded-xl border bg-card p-5 shadow-sm divide-y">
              {[
                { l: "Public profile", d: "Show your profile to non-members" },
                { l: "Allow messages from anyone", d: "Off = only verified connections" },
                { l: "Show in 'People you may know'", d: "Help others discover you" },
              ].map((x) => (
                <div
                  key={x.l}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{x.l}</p>
                    <p className="text-xs text-muted-foreground">{x.d}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
});
