export interface MockNotification {
  id: string;
  type: "connection" | "job" | "event" | "verification" | "mention";
  text: string;
  time: string;
  unread: boolean;
}

export const notifications: MockNotification[] = [];
