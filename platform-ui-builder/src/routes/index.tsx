import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Sparkles,
  Users,
  Briefcase,
  Calendar,
  Megaphone,
  ArrowRight,
  Check,
  Star,
} from "lucide-react";
import { MarketingNav, MarketingFooter } from "@/components/MarketingNav";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrustNet — The Verified Professional Network" },
      {
        name: "description",
        content:
          "Connect with verified professionals, hire faster, raise capital and host trusted events — all on one platform.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Users,
    title: "Verified network",
    desc: "Every profile is identity-checked. No bots, no recruiters spamming.",
  },
  {
    icon: Briefcase,
    title: "Real opportunities",
    desc: "Jobs, funding and partnerships from verified companies only.",
  },
  {
    icon: Calendar,
    title: "Trusted events",
    desc: "Trust scores, organizer verification and fraud protection built in.",
  },
  {
    icon: Megaphone,
    title: "Smart promotions",
    desc: "Boost posts and events with built-in analytics and reach reporting.",
  },
  {
    icon: Sparkles,
    title: "AI assistant",
    desc: "Improve your profile, draft posts and discover the right people in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Fraud protection",
    desc: "Duplicate face detection, ID checks and admin moderation keep the network clean.",
  },
];

function Landing() {
  const { data: user } = useCurrentUser();
  const userName = user?.full_name || "Avery Chen";
  const userTitle = user?.role === "company_admin" ? "Business Owner" : "Professional member";
  const userInitials = userName[0];

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-soft-radial opacity-60" />
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Identity-verified by default
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              The professional network <br className="hidden sm:block" />
              <span className="text-gradient">built on trust.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              TrustNet connects verified professionals, founders, recruiters, investors and event
              organizers — so every connection, hire and deal starts with confidence.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-1.5">
                <Link to="/signup">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/feed">Explore the network</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required · Verification takes 2 minutes
            </p>
          </div>

          {/* Trust badges */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { k: "28k+", v: "Verified members" },
              { k: "1.2k+", v: "Trusted companies" },
              { k: "340+", v: "Events monthly" },
              { k: "99.4%", v: "Fraud blocked" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl border bg-card/60 p-4 text-center backdrop-blur">
                <p className="text-2xl font-semibold tracking-tight text-foreground">{s.k}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-surface-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Everything you need</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              One platform, every meaningful connection.
            </h2>
            <p className="mt-3 text-muted-foreground">
              From a verified profile to your next job, round, hire or event — TrustNet is the home
              for the people building things.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="inline-flex rounded-md bg-primary/10 p-2 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold">{f.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="border-t">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-primary">Trust, by design</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Every profile is a real person.
            </h2>
            <p className="mt-3 text-muted-foreground">
              We combine face verification, document checks and behavioural signals to keep the
              network free of bots, scammers and duplicate accounts.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Face + ID verification at signup",
                "Duplicate face detection across the network",
                "Verified company badges with proof of employment",
                "Trust scores on every event and organizer",
              ].map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-accent/40 p-6 shadow-sm">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-4 text-white font-bold">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} className="h-full w-full rounded-full" />
                  ) : (
                    userInitials
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userTitle}</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2 py-1 text-xs font-medium text-success">
                  <ShieldCheck className="h-3.5 w-3.5" />{" "}
                  {user?.is_verified ? "Verified" : "Pending"}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-lg bg-muted/60 p-2">
                  <p className="font-semibold text-foreground">612</p>Connections
                </div>
                <div className="rounded-lg bg-muted/60 p-2">
                  <p className="font-semibold text-foreground">2.8k</p>Followers
                </div>
                <div className="rounded-lg bg-muted/60 p-2">
                  <p className="font-semibold text-foreground">96</p>Trust score
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t bg-surface-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Loved by professionals</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              The network everyone wishes LinkedIn was.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                q: "I closed two pre-seed rounds through TrustNet in three months. Every conversation actually mattered.",
                a: "Maya Okafor",
                t: "Founding Engineer, Helix AI",
              },
              {
                q: "The verification gates change everything. No more sifting through 400 fake applicants per role.",
                a: "Priya Raman",
                t: "Recruiter, Lattice",
              },
              {
                q: "Hosting a dinner here means founders actually show up. Trust scores are doing real work.",
                a: "Tomás Rivera",
                t: "Founders Friday",
              },
            ].map((t) => (
              <figure key={t.a} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex gap-0.5 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-foreground">
                  "{t.q}"
                </blockquote>
                <figcaption className="mt-4 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{t.a}</span> · {t.t}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to join the verified network?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Free to join. Two minutes to verify. A lifetime of better conversations.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/signup">Create your account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">I already have one</Link>
            </Button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
