import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, DeadlineChip, FitScore, StatusBadge } from "@/components/tender-ui";
import { formatZAR, useTenderStore } from "@/lib/tenders/store";
import type { TenderStatus } from "@/lib/tenders/types";
import { PIPELINE_COLUMNS, STATUS_LABELS } from "@/lib/tenders/types";

export const Route = createFileRoute("/tenders/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} · NexMotion Tender OS` }] }),
  component: TenderDetail,
  notFoundComponent: () => (
    <AppShell>
      <div className="p-12 text-center">
        <h2 className="text-xl font-semibold">Tender not found</h2>
        <Link to="/tenders" className="text-brand mt-3 inline-block">
          ← Back to tenders
        </Link>
      </div>
    </AppShell>
  ),
});

function TenderDetail() {
  const { id } = Route.useParams();
  const tender = useTenderStore((s) => s.tenders.find((t) => t.id === id));
  const setStatus = useTenderStore((s) => s.setStatus);
  const toggleChecklist = useTenderStore((s) => s.toggleChecklist);
  const addComment = useTenderStore((s) => s.addComment);
  const [draft, setDraft] = useState("");

  if (!tender) throw notFound();

  const completed = tender.checklist.filter((c) => c.completed).length;
  const progress = tender.checklist.length
    ? Math.round((completed / tender.checklist.length) * 100)
    : 0;

  return (
    <AppShell>
      <PageHeader
        title={tender.title}
        subtitle={`${tender.municipality}, ${tender.province} · ${tender.category}`}
        actions={
          <select
            value={tender.status}
            onChange={(e) => setStatus(tender.id, e.target.value as TenderStatus)}
            className="bg-input/40 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            {[...PIPELINE_COLUMNS, "won" as TenderStatus, "lost" as TenderStatus].map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        }
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <StatusBadge status={tender.status} />
              <DeadlineChip deadline={tender.deadline} />
              <div className="font-mono text-xs text-muted-foreground">
                {formatZAR(tender.budgetMin)} – {formatZAR(tender.budgetMax)}
              </div>
              <FitScore score={tender.fitScore} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Posted {formatDistanceToNow(new Date(tender.datePosted))} ago · Source: {tender.source}
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-display font-semibold mb-4">AI requirement analysis</h2>
            <ul className="space-y-3">
              {tender.requirements.map((r, i) => {
                const icon =
                  r.fit === "expert" ? "✅" : r.fit === "competent" ? "🟡" : "⚠️";
                const tone =
                  r.fit === "expert"
                    ? "text-success"
                    : r.fit === "competent"
                      ? "text-warning"
                      : "text-destructive";
                return (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5">{icon}</span>
                    <div className="flex-1">
                      <div className="text-sm">{r.text}</div>
                      <div className={`text-xs mt-0.5 ${tone}`}>
                        NexMotion: {r.fit} ({r.score}/100)
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {tender.risks.length > 0 && (
              <div className="mt-6 pt-5 border-t border-border">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Risk factors
                </h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {tender.risks.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 p-3 rounded-lg bg-brand/10 border border-brand/30 text-sm">
              <span className="font-semibold text-brand">Recommendation: </span>
              {tender.recommendation}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">Bid preparation</h2>
              <span className="text-xs text-muted-foreground">{progress}% complete</span>
            </div>
            <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-brand transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            {tender.checklist.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No checklist items yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {tender.checklist.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/40 border border-border"
                  >
                    <input
                      type="checkbox"
                      checked={c.completed}
                      onChange={() => toggleChecklist(tender.id, c.id)}
                      className="h-4 w-4 accent-brand"
                    />
                    <div className="flex-1">
                      <div
                        className={`text-sm ${c.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {c.item}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {c.assignee} · due {format(new Date(c.dueDate), "d MMM")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display font-semibold mb-4">Team comments</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {tender.comments.length === 0 && (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}
              {tender.comments.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-surface-2/40 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-brand">{c.author}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(c.timestamp))} ago
                    </span>
                  </div>
                  <p className="text-sm">{c.text}</p>
                </div>
              ))}
            </div>
            <form
              className="mt-4 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                addComment(tender.id, "You", draft.trim());
                setDraft("");
              }}
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a comment…"
                rows={2}
                className="w-full bg-input/40 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
              <button
                type="submit"
                className="w-full rounded-md bg-gradient-brand px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Post comment
              </button>
            </form>
          </Card>

          <Card className="p-6 text-sm space-y-2">
            <h3 className="font-display font-semibold mb-2">Tender source</h3>
            <a
              href={tender.link}
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline break-all"
            >
              {tender.link}
            </a>
            <div className="text-xs text-muted-foreground pt-2">
              Closes {format(new Date(tender.deadline), "PPP")}
            </div>
            {tender.outcome && (
              <div className="mt-3 p-3 rounded-lg bg-surface-2/40 border border-border">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Outcome
                </div>
                <div className="text-sm mt-1">{tender.outcome.note}</div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
