export type VerificationStatus = "verified" | "pending" | "rejected" | "unverified";

export interface MockUser {
  id: string;
  name: string;
  handle: string;
  title: string;
  company: string;
  location: string;
  avatar: string;
  cover: string;
  verification: VerificationStatus;
  about: string;
  skills: string[];
  experience: { role: string; company: string; period: string; description: string }[];
  links: { label: string; url: string }[];
  followers: number;
  connections: number;
  mutuals: number;
}

const grad = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

export const currentUser: MockUser = {
  id: "u_me",
  name: "Avery Chen",
  handle: "averychen",
  title: "Product Designer & Founder",
  company: "Northwind Studio",
  location: "San Francisco, CA",
  avatar: "https://i.pravatar.cc/160?img=47",
  cover: grad("#a78bfa", "#22d3ee"),
  verification: "verified",
  about:
    "Designer-founder building tools for distributed teams. Previously design lead at two YC startups. I love calm interfaces, sharp typography and shipping weekly.",
  skills: ["Product Design", "Design Systems", "Figma", "Brand", "0-to-1", "Fundraising"],
  experience: [
    {
      role: "Founder & CEO",
      company: "Northwind Studio",
      period: "2023 — Present",
      description: "Building a calm collaboration suite for product teams. Pre-seed.",
    },
    {
      role: "Design Lead",
      company: "Loop (YC W21)",
      period: "2021 — 2023",
      description: "Led design across web, mobile and brand. Grew team from 1 to 6.",
    },
    {
      role: "Senior Product Designer",
      company: "Stripe",
      period: "2018 — 2021",
      description: "Worked on Connect onboarding and dashboard reliability.",
    },
  ],
  links: [
    { label: "Website", url: "https://example.com" },
    { label: "GitHub", url: "https://github.com" },
  ],
  followers: 2840,
  connections: 612,
  mutuals: 0,
};

export const users: MockUser[] = [];

export function getUserById(id: string): MockUser | undefined {
  return users.find((u) => u.id === id);
}
