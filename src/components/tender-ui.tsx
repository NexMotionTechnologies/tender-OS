import { differenceInCalendarDays, format, formatDistanceToNow } from "date-fns";
import type { TenderStatus } from "@/lib/tenders/types";
import { STATUS_LABELS } from "@/lib/tenders/types";

export function StatusBadge({ status }: { status: TenderStatus }) {
  const styles: Record<TenderStatus, string> = {
    identified: "bg-muted text-muted-foreground border-border",
    shortlisted: "bg-accent/15 text-accent border-accent/30",
    preparing: "bg-warning/15 text-warning border-warning/30",
    submitted: "bg-brand/15 text-brand border-brand/30",
    won: "bg-success/15 text-success border-success/30",
    lost: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium uppercase tracking-wider ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function FitScore({ score }: { score: number }) {
  const tone =
    score >= 85 ? "text-success" : score >= 70 ? "text-brand" : score >= 55 ? "text-warning" : "text-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className={`font-display font-bold text-lg ${tone}`}>{score}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">fit</div>
    </div>
  );
}

export function DeadlineChip({ deadline }: { deadline: string }) {
  const d = new Date(deadline);
  const days = differenceInCalendarDays(d, new Date());
  const past = days < 0;
  const urgent = days >= 0 && days <= 3;
  const soon = days > 3 && days <= 7;
  const tone = past
    ? "text-muted-foreground"
    : urgent
      ? "text-destructive"
      : soon
        ? "text-warning"
        : "text-muted-foreground";
  return (
    <span className={`text-xs ${tone}`} title={format(d, "PPpp")}>
      {past ? "Closed " : "Due in "}
      {formatDistanceToNow(d)}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-card border border-border rounded-xl shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
