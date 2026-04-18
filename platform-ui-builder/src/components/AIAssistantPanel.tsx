import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  title?: string;
  suggestions: string[];
  onApply?: (s: string) => void;
  className?: string;
}

export function AIAssistantPanel({
  title = "AI Assistant",
  suggestions,
  onApply,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br from-primary/5 via-card to-accent/30 p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-primary/15 p-1.5 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span className="ml-auto rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
          Beta
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {suggestions.map((s, i) => (
          <li
            key={i}
            className="flex items-start justify-between gap-3 rounded-lg border bg-card/60 p-3 text-sm"
          >
            <span className="text-foreground">{s}</span>
            <Button size="sm" variant="ghost" className="h-7 shrink-0" onClick={() => onApply?.(s)}>
              Apply
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
