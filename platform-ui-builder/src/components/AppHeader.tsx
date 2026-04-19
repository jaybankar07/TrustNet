import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  Sparkles,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  Send,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VerifiedBadge } from "./VerifiedBadge";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/api";

export function AppHeader() {
  const navigate = useNavigate();
  const { data: liveUser } = useCurrentUser();
  const defaultUser = { name: "Guest", handle: "", avatar: "", verification: "unverified", id: 0 };
  const currentUser = liveUser
    ? {
        name: liveUser.name,
        handle: liveUser.name.split(" ")[0].toLowerCase(),
        avatar: liveUser.avatar_url,
        verification: liveUser.verification_status,
        id: liveUser.id,
      }
    : defaultUser;

  const unread = 0;

  const [searchQ, setSearchQ] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { data: searchResults } = useQuery({
    queryKey: ["global-search", searchQ],
    queryFn: async () => {
      if (searchQ.length < 2) return { users: [], companies: [] };
      const [userRes, companyRes] = await Promise.all([
        fetchApi(`/auth/users/?search=${searchQ}`),
        fetchApi(`/companies/?search=${searchQ}`),
      ]);
      const users = await userRes
        .json()
        .then((d: any) => d.results || d)
        .catch(() => []);
      const companies = await companyRes
        .json()
        .then((d: any) => d.results || d)
        .catch(() => []);
      return { users: users.slice(0, 4), companies: companies.slice(0, 3) };
    },
    enabled: searchQ.length >= 2,
  });

  const hasResults =
    (searchResults?.users?.length || 0) + (searchResults?.companies?.length || 0) > 0;

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    {
      role: "ai",
      content:
        "Hi! I'm TrustNet AI. How can I assist you with verifying professionals or finding jobs today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen && endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");

    try {
      const res = await fetchApi("/trust/chat/", {
        method: "POST",
        body: JSON.stringify({ message: userMsg }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "Sorry, I'm having trouble connecting to my brain right now." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error connecting to the AI assistant." },
      ]);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search people, companies…"
          className="h-9 pl-9"
          value={searchQ}
          onChange={(e) => {
            setSearchQ(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
          onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
        />
        {showSearchResults && searchQ.length >= 2 && hasResults && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border bg-popover shadow-lg overflow-hidden">
            {searchResults?.users?.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground bg-muted/50">
                  People
                </p>
                {searchResults?.users?.map((u: any) => (
                  <Link
                    key={u.id}
                    to="/profile/$userId"
                    params={{ userId: u.id }}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-muted/60 transition-colors"
                    onClick={() => {
                      setSearchQ("");
                      setShowSearchResults(false);
                    }}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={u.avatar_url} />
                      <AvatarFallback>{(u.name || "U")[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {u.role === "company_admin" ? "Business" : "Professional"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {searchResults?.companies?.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground bg-muted/50">
                  Companies
                </p>
                {searchResults?.companies?.map((c: any) => (
                  <Link
                    key={c.id}
                    to="/companies/$companyId"
                    params={{ companyId: c.id }}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-muted/60 transition-colors"
                    onClick={() => {
                      setSearchQ("");
                      setShowSearchResults(false);
                    }}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-bold">
                      {(c.name || "?")[0]}
                    </div>
                    <p className="text-xs font-medium">{c.name}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <VerifiedBadge status={currentUser.verification} size="sm" />
        <Popover open={chatOpen} onOpenChange={setChatOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={chatOpen ? "secondary" : "ghost"}
              size="sm"
              className="hidden gap-1.5 text-primary md:inline-flex"
            >
              <Sparkles className="h-4 w-4" /> Ask AI
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-[350px] p-0 flex flex-col h-[450px] shadow-xl border"
          >
            <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/30">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">TrustNet Assistant</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none"}`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={endOfMessagesRef} />
            </div>

            <form onSubmit={handleSendChat} className="border-t p-3 bg-muted/20 flex gap-2">
              <Input
                placeholder="Ask me anything..."
                className="h-9 flex-1 bg-background"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 shrink-0"
                disabled={!chatInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <p className="text-sm font-semibold">Notifications</p>
              <button className="text-xs text-muted-foreground hover:text-foreground">
                Mark all read
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto">
                <li className="flex items-center justify-center p-4 text-sm text-muted-foreground italic">
                  No new notifications
                </li>
            </ul>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-full border bg-card p-0.5 pr-2 transition-colors hover:bg-muted">
              <Avatar className="h-7 w-7">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-medium sm:inline">
                {currentUser.name.split(" ")[0]}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">@{currentUser.handle}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile/$userId" params={{ userId: currentUser.id }}>
                <UserIcon className="mr-2 h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <SettingsIcon className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
