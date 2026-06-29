import { createFileRoute, Link } from "@tanstack/react-router";
import { differenceInCalendarDays } from "date-fns";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, DeadlineChip, FitScore, StatusBadge } from "@/components/tender-ui";
import { formatZAR, useTenderStore } from "@/lib/tenders/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Dashboard · NexMotion Tender OS" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const tenders = useTenderStore((s) => s.tenders);

  const active = tenders.filter((t) => !["won", "lost"].includes(t.status));
  const byStatus = (s: string) => tenders.filter((t) => t.status === s).length;
  const submitted = tenders.filter((t) => t.status === "submitted");
  const wins = tenders.filter((t) => t.status === "won");
  const decided = tenders.filter((t) => ["won", "lost"].includes(t.status));
  const winRate = decided.length ? Math.round((wins.length / decided.length) * 100) : 0;

  const submittedValue = submitted.reduce((s, t) => s + (t.budgetMin + t.budgetMax) / 2, 0);
  const expectedRevenue = submitted.reduce(
    (s, t) => s + ((t.budgetMin + t.budgetMax) / 2) * (t.fitScore / 100),
    0,
  );

  const urgent = active
    .filter((t) => {
      const days = differenceInCalendarDays(new Date(t.deadline), new Date());
      return days >= 0 && days <= 7;
    })
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));

  const stats = [
    { label: "Opportunities", value: tenders.length, hint: `${active.length} active` },
    { label: "Shortlisted", value: byStatus("shortlisted"), hint: "ready for review" },
    { label: "Preparing", value: byStatus("preparing"), hint: "in bid prep" },
    { label: "Submitted", value: byStatus("submitted"), hint: "awaiting decision" },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Tender Pipeline"
        subtitle="Limpopo · Free State · Gauteng — live opportunity intelligence."
        actions={
          <Link
            to="/pipeline"
            className="rounded-md bg-gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
          >
            Open pipeline
          </Link>
        }
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-2 font-display text-4xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.hint}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">Urgent deadlines</h2>
              <span className="text-xs text-muted-foreground">Next 7 days</span>
            </div>
            {urgent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No tenders closing this week.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {urgent.map((t) => (
                  <li key={t.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to="/tenders/$id"
                        params={{ id: t.id }}
                        className="font-medium hover:text-brand transition truncate block"
                      >
                        {t.title}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t.municipality} · {t.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <FitScore score={t.fitScore} />
                      <DeadlineChip deadline={t.deadline} />
                      <StatusBadge status={t.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-display font-semibold mb-4">Revenue pipeline</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Submitted bid value
                </div>
                <div className="font-display text-3xl font-bold mt-1">
                  {formatZAR(submittedValue)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Weighted expected revenue
                </div>
                <div className="font-display text-2xl font-bold text-gradient-brand mt-1">
                  {formatZAR(expectedRevenue)}
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Win rate
                </div>
                <div className="font-display text-2xl font-bold mt-1">
                  {winRate}%
                  <span className="text-sm text-muted-foreground font-sans font-normal ml-2">
                    ({wins.length}/{decided.length})
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
