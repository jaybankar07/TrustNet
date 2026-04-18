import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">TrustNet</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#trust" className="hover:text-foreground">
            Trust
          </a>
          <a href="#testimonials" className="hover:text-foreground">
            Customers
          </a>
          <Link to="/jobs" className="hover:text-foreground">
            Jobs
          </Link>
          <Link to="/events" className="hover:text-foreground">
            Events
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t bg-surface-muted/40">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">TrustNet</span>
            </div>
            <p className="mt-3 max-w-xs text-xs text-muted-foreground">
              The verified professional ecosystem. Network, hire, fundraise and host with built-in
              trust.
            </p>
          </div>
          {[
            { h: "Product", l: ["Feed", "Jobs", "Events", "Companies"] },
            { h: "Company", l: ["About", "Customers", "Careers", "Press"] },
            { h: "Legal", l: ["Privacy", "Terms", "Security", "Trust"] },
          ].map((col) => (
            <div key={col.h}>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
                {col.h}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {col.l.map((i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-foreground">
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          © 2025 TrustNet, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
