import { users } from "./users";

export interface MockPost {
  id: string;
  authorId: string;
  createdAt: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
  poll?: { options: { label: string; votes: number }[] };
}

export const posts: MockPost[] = [];
