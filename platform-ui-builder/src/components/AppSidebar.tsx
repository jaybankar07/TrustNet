import { Link, useRouterState, createFileRoute } from "@tanstack/react-router";
import {
  Handshake,
  LineChart,
  MessageSquarePlus,
  Home,
  Users,
  Briefcase,
  Calendar,
  Building2,
  Wallet,
  Gift,
  Megaphone,
  ShieldCheck,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";

const main = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Feed", url: "/feed", icon: Home },
  { title: "Network", url: "/network", icon: Users },
  { title: "Jobs", url: "/jobs", icon: Briefcase },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Companies", url: "/companies", icon: Building2 },
  { title: "B2B Connect", url: "/b2b", icon: Handshake },
  { title: "Funding", url: "/funding", icon: LineChart },
] as const;

const earn = [
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Referrals", url: "/referrals", icon: Gift },
  { title: "Promotions", url: "/promotions", icon: Megaphone },
] as const;

const system = [
  { title: "Admin", url: "/admin", icon: ShieldCheck },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

function Section({
  label,
  items,
}: {
  label: string;
  items: readonly {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <SidebarGroup>
      {/* Dynamic base SEO for layouts */}
      <SEO title="Platform" />
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = path === item.url || path.startsWith(item.url + "/");
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
                  <Link
                    to={item.url}
                    className={cn("flex items-center gap-2", active && "font-medium text-primary")}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/feed" className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          {!collapsed && <span className="text-sm font-semibold tracking-tight">TrustNet</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <Section label="Main" items={main} />
        <Section label="Earn" items={earn} />
        <Section label="System" items={system} />
      </SidebarContent>
    </Sidebar>
  );
}
