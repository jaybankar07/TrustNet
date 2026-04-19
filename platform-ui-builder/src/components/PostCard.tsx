import { useState } from "react";
import { Heart, MessageCircle, Repeat2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerifiedBadge } from "./VerifiedBadge";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";

export function PostCard({ post }: { post: any }) {
  const author = post.user;
  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [likes, setLikes] = useState(post.likes_count ?? 0);
  const [isLiking, setIsLiking] = useState(false);
  const [reposted, setReposted] = useState(post.is_reposted ?? false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [pollChoice, setPollChoice] = useState<number | null>(null);

  if (!author) return null;

  const pollOptions = post.poll_data?.options || [];
  const totalVotes =
    pollOptions.reduce((a: number, o: any) => a + (o.votes || 0), 0) +
    (pollChoice !== null ? 1 : 0);

  const fetchComments = async () => {
    const res = await fetchApi(`/feed/posts/${post.id}/comments/`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.results || data);
    }
  };

  const handleLike = async () => {
    setIsLiking(true);
    const res = await fetchApi(`/feed/posts/${post.id}/like/`, { method: "POST" });
    setIsLiking(false);
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikes(data.likes_count);
    } else {
      toast.error("Failed to like");
    }
  };

  const handleRepost = async () => {
    const res = await fetchApi(`/feed/posts/${post.id}/repost/`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setReposted(data.reposted);
      toast.success(data.reposted ? "Reposted" : "Removed repost");
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetchApi(`/feed/posts/${post.id}/comments/`, {
      method: "POST",
      body: JSON.stringify({ content: newComment }),
    });
    if (res.ok) {
      setNewComment("");
      fetchComments();
    }
  };

  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm">
      <header className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={author.avatar_url || author.avatar} alt={author.name} />
            <AvatarFallback>{author.name ? author.name[0] : "U"}</AvatarFallback>
          </Avatar>
          <div>
            <Link
              to="/profile/$userId"
              params={{ userId: author.id }}
              className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary"
            >
              {author.name}
              {author.is_verified === true && (
                <VerifiedBadge status="verified" size="sm" showLabel={false} />
              )}
            </Link>
            <p className="text-xs text-muted-foreground">
              {author.title || "User"} ·{" "}
              {new Date(post.created_at || post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal />
        </Button>
      </header>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
        {post.content}
      </p>

      {post.media_url && (
        <img
          src={post.media_url}
          alt=""
          className="mt-3 w-full rounded-lg border object-cover max-h-[400px]"
        />
      )}

      {pollOptions.length > 0 && (
        <div className="mt-3 space-y-2">
          {pollOptions.map((opt: any, i: number) => {
            const votes = (opt.votes || 0) + (pollChoice === i ? 1 : 0);
            const pct = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
            const selected = pollChoice === i;
            return (
              <button
                key={i}
                onClick={() => pollChoice === null && setPollChoice(i)}
                disabled={pollChoice !== null}
                className={cn(
                  "relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  pollChoice === null
                    ? "hover:border-primary/40 hover:bg-primary/5"
                    : "cursor-default",
                  selected && "border-primary/40",
                )}
              >
                {pollChoice !== null && (
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/10"
                    style={{ width: `${pct}%` }}
                  />
                )}
                <div className="relative flex items-center justify-between">
                  <span className={selected ? "font-medium text-primary" : ""}>{opt.text}</span>
                  {pollChoice !== null && (
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  )}
                </div>
              </button>
            );
          })}
          <p className="text-xs text-muted-foreground">{totalVotes} votes</p>
        </div>
      )}

      {post.is_repost && post.original_post && (
        <div className="mt-3 rounded-lg border bg-muted/30 p-3">
          <PostCard post={post.original_post} />
        </div>
      )}

      <footer className="mt-4 flex items-center gap-1 border-t pt-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-1.5", liked && "text-primary")}
          disabled={isLiking}
          onClick={handleLike}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          {likes}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-1.5", showComments && "text-primary")}
          onClick={() => {
            setShowComments(!showComments);
            if (!showComments) fetchComments();
          }}
        >
          <MessageCircle className="h-4 w-4" />
          {post.comments_count || comments.length}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-1.5", reposted && "text-primary")}
          onClick={handleRepost}
        >
          <Repeat2 className="h-4 w-4" />
          {reposted ? "Shared" : "Repost"}
        </Button>
      </footer>

      {showComments && (
        <div className="mt-4 space-y-3 border-t pt-3">
          <div className="flex gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="h-8 text-xs"
              />
              <Button size="sm" className="h-8 px-3" onClick={submitComment}>
                Reply
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {comments.map((c: any) => (
              <div key={c.id} className="flex gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={c.user?.avatar_url} />
                  <AvatarFallback>{c.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-lg bg-muted/40 p-2 text-xs">
                  <p className="font-semibold">{c.user?.name}</p>
                  <p className="mt-0.5">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
