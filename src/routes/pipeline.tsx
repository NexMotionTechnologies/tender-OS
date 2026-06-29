import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { DeadlineChip, FitScore } from "@/components/tender-ui";
import { formatZAR, useTenderStore } from "@/lib/tenders/store";
import type { TenderStatus } from "@/lib/tenders/types";
import { PIPELINE_COLUMNS, STATUS_LABELS } from "@/lib/tenders/types";

export const Route = createFileRoute("/pipeline")({
  head: () => ({ meta: [{ title: "Pipeline · NexMotion Tender OS" }] }),
  component: Pipeline,
});

function Pipeline() {
  const tenders = useTenderStore((s) => s.tenders);
  const setStatus = useTenderStore((s) => s.setStatus);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };
  const onDrop = (e: React.DragEvent, status: TenderStatus) => {
    const id = e.dataTransfer.getData("text/plain");
    if (id) setStatus(id, status);
  };

  return (
    <AppShell>
      <PageHeader
        title="Pipeline"
        subtitle="Drag a card to move it through the bid lifecycle."
      />
      <div className="p-8 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {PIPELINE_COLUMNS.map((col) => {
            const items = tenders.filter((t) => t.status === col);
            return (
              <div
                key={col}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, col)}
                className="w-80 shrink-0 bg-surface/60 border border-border rounded-xl flex flex-col"
              >
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="font-display font-semibold text-sm">{STATUS_LABELS[col]}</div>
                  <span className="text-xs text-muted-foreground bg-surface-2 rounded-full px-2 py-0.5">
                    {items.length}
                  </span>
                </div>
                <div className="p-3 space-y-3 min-h-[200px]">
                  {items.map((t) => (
                    <Link
                      to="/tenders/$id"
                      params={{ id: t.id }}
                      key={t.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, t.id)}
                      className="block bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-brand/50 transition"
                    >
                      <div className="text-sm font-medium leading-snug">{t.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t.municipality} · {t.province}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <DeadlineChip deadline={t.deadline} />
                        <FitScore score={t.fitScore} />
                      </div>
                      <div className="mt-2 font-mono text-[11px] text-muted-foreground">
                        {formatZAR(t.budgetMin)}–{formatZAR(t.budgetMax)}
                      </div>
                    </Link>
                  ))}
                  {items.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-6">
                      Drop tenders here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
