import { useState, useRef } from "react";
import { Image as ImageIcon, Sparkles, BarChart3, Calendar, Video, X, Link2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, useCurrentUser } from "@/lib/api";

export function PostComposer() {
  const [text, setText] = useState("");
  const [postType, setPostType] = useState<"text" | "image" | "video" | "poll" | "event">("text");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [eventLink, setEventLink] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: liveUser } = useCurrentUser();

  const authorName = liveUser?.full_name || liveUser?.name || "You";
  const authorAvatar = liveUser?.avatar_url;

  const createPost = useMutation({
    mutationFn: async (payload: any) => {
      const isFormData = payload instanceof FormData;
      const res = await fetchApi("/feed/posts/", {
        method: "POST",
        body: isFormData ? payload : JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to post");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Post published!");
      setText("");
      setMediaPreview(null);
      setMediaFile(null);
      setEventLink("");
      setPollOptions(["", ""]);
      setPostType("text");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // For video, show a reminder — actual duration check happens server-side
    if (postType === "video") {
      toast.info("Reminder: Videos must be under 5 minutes.");
    }
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const submit = () => {
    if (!text.trim() && !mediaPreview && !eventLink && postType !== "poll") return;

    let finalPayload: any;

    if (mediaFile && (postType === "image" || postType === "video")) {
      const formData = new FormData();
      formData.append("content", text || " ");
      formData.append("post_type", postType);
      formData.append("media_file", mediaFile);
      finalPayload = formData;
    } else {
      const payload: any = { content: text || " ", post_type: postType };

      if (postType === "event" && eventLink) {
        payload.content = `${payload.content}\n\n🔗 ${eventLink}`;
      }

      if (postType === "poll") {
        const filtered = pollOptions.filter((o) => o.trim());
        if (filtered.length < 2) {
          toast.error("Add at least 2 poll options");
          return;
        }
        payload.poll_data = { options: filtered.map((t) => ({ text: t, votes: 0 })) };
      }
      finalPayload = payload;
    }

    createPost.mutate(finalPayload);
  };

  const toggleType = (type: typeof postType) => {
    setPostType((prev) => {
      const next = prev === type ? "text" : type;
      if (next !== "image" && next !== "video") {
        setMediaPreview(null);
        setMediaFile(null);
      }
      return next;
    });
  };

  const isVerified = liveUser?.is_verified || liveUser?.verification_status === "verified";

  if (liveUser && !isVerified) {
    return (
      <div className="rounded-xl border bg-card p-4 shadow-sm opacity-80">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={authorAvatar} alt={authorName} />
            <AvatarFallback>{authorName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40 p-3 text-sm text-muted-foreground">
            🔒 Complete your identity verification to start posting.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src={authorAvatar} alt={authorName} />
          <AvatarFallback>{authorName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              postType === "poll"
                ? "What's the question?"
                : postType === "event"
                  ? "Tell people about the event..."
                  : postType === "video"
                    ? "Say something about this video..."
                    : "Share an update, opportunity or question…"
            }
            rows={2}
            className="resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          />

          {/* Media Preview */}
          {mediaPreview && (postType === "image" || postType === "video") && (
            <div className="relative mt-2 rounded-lg overflow-hidden border">
              {postType === "image" ? (
                <img src={mediaPreview} alt="preview" className="max-h-64 w-full object-cover" />
              ) : (
                <video src={mediaPreview} controls className="max-h-64 w-full" />
              )}
              <button
                type="button"
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                onClick={() => {
                  setMediaPreview(null);
                  setMediaFile(null);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* File Upload Hidden Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={postType === "video" ? "video/*" : "image/*"}
            onChange={handleFileSelect}
          />

          {/* Event link input */}
          {postType === "event" && (
            <div className="mt-2 flex gap-2">
              <Input
                value={eventLink}
                onChange={(e) => setEventLink(e.target.value)}
                placeholder="Paste event link / URL..."
                className="h-8 text-xs"
              />
            </div>
          )}

          {/* Poll Options */}
          {postType === "poll" && (
            <div className="mt-2 space-y-2">
              {pollOptions.map((opt, i) => (
                <Input
                  key={i}
                  value={opt}
                  onChange={(e) => {
                    const next = [...pollOptions];
                    next[i] = e.target.value;
                    setPollOptions(next);
                  }}
                  placeholder={`Option ${i + 1}`}
                  className="h-8 text-xs"
                />
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] text-muted-foreground"
                onClick={() => setPollOptions([...pollOptions, ""])}
              >
                + Add option
              </Button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-1">
              <Button
                variant={postType === "image" ? "secondary" : "ghost"}
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  toggleType("image");
                  setTimeout(() => fileInputRef.current?.click(), 50);
                }}
              >
                <ImageIcon className="h-4 w-4" /> Photo
              </Button>
              <Button
                variant={postType === "video" ? "secondary" : "ghost"}
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  toggleType("video");
                  setTimeout(() => fileInputRef.current?.click(), 50);
                }}
              >
                <Video className="h-4 w-4" /> Video
              </Button>
              <Button
                variant={postType === "poll" ? "secondary" : "ghost"}
                size="sm"
                className="text-muted-foreground"
                onClick={() => toggleType("poll")}
              >
                <BarChart3 className="h-4 w-4" /> Poll
              </Button>
              <Button
                variant={postType === "event" ? "secondary" : "ghost"}
                size="sm"
                className="text-muted-foreground"
                onClick={() => toggleType("event")}
              >
                <Link2 className="h-4 w-4" /> Event
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={() => {
                  if (!text.trim()) {
                    toast.error("Write something first");
                    return;
                  }
                  setText((t) => `${t}\n\n— Sharing this with the TrustNet community 🚀`);
                }}
              >
                <Sparkles className="h-4 w-4" /> AI
              </Button>
            </div>
            <Button
              size="sm"
              onClick={submit}
              disabled={
                (!text.trim() && !mediaPreview && !eventLink && postType !== "poll") ||
                createPost.isPending
              }
            >
              {createPost.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
