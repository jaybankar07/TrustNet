import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

interface SEOProps {
  title?: string;
  description?: string;
}

export function SEO({ title, description }: SEOProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    // 1. Title
    const baseTitle = "TrustNet | Verified Professional Network";
    const fullTitle = title ? `${title} · TrustNet` : baseTitle;
    document.title = fullTitle;

    // 2. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      description ||
        "Connect professionally, verify trust, and discover opportunities on TrustNet.",
    );

    // 3. Canonical Tag
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    const origin = window.location.origin;
    linkCanonical.setAttribute("href", `${origin}${pathname}`);
  }, [title, description, pathname]);

  return null;
}
