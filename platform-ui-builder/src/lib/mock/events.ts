export interface MockEvent {
  id: string;
  title: string;
  organizer: string;
  category: "Networking" | "Conference" | "Workshop" | "Investor" | "Hackathon";
  date: string;
  time: string;
  location: string;
  online: boolean;
  cover: string;
  trustScore: number;
  attendees: number;
  capacity: number;
  description: string;
  agenda: { time: string; title: string }[];
  tickets: { name: string; price: string; perks: string[] }[];
  organizerVerified: boolean;
}

export const events: MockEvent[] = [];

export function getEventById(id: string): MockEvent | undefined {
  return events.find((e) => e.id === id);
}
