import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/tender-ui";
import { useTenderStore } from "@/lib/tenders/store";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · NexMotion Tender OS" }] }),
  component: Settings,
});

const TEAM = [
  { name: "Casious", role: "Technical Lead", email: "casious@nexmotion.co.za" },
  { name: "Bokang", role: "Compliance & Finance", email: "bokang@nexmotion.co.za" },
];

const SOURCES = [
  { name: "ETENDERS (gov.za)", status: "Active", last: "synced 2h ago" },
  { name: "BidLinkssa", status: "Active", last: "synced 4h ago" },
  { name: "Tzaneen Municipal Portal", status: "Active", last: "synced 6h ago" },
  { name: "Bloemfontein Metro Portal", status: "Paused", last: "needs reauth" },
];

function Settings() {
  const reset = useTenderStore((s) => s.reset);
  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Scrapers, team & notifications." />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-display font-semibold mb-4">Tender sources</h2>
          <ul className="divide-y divide-border">
            {SOURCES.map((s) => (
              <li key={s.name} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.last}</div>
                </div>
                <span
                  className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                    s.status === "Active"
                      ? "text-success border-success/30 bg-success/10"
                      : "text-warning border-warning/30 bg-warning/10"
                  }`}
                >
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold mb-4">Team</h2>
          <ul className="space-y-3">
            {TEAM.map((m) => (
              <li
                key={m.email}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/40 border border-border"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-brand grid place-items-center font-bold text-primary-foreground">
                  {m.name[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.role} · {m.email}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold mb-4">Notifications</h2>
          <ul className="text-sm space-y-3 text-muted-foreground">
            <li className="flex items-center justify-between">
              <span>Deadline alerts (7d / 3d / 24h)</span>
              <span className="text-success text-xs uppercase tracking-wider">Enabled</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Slack channel #tenders</span>
              <span className="text-muted-foreground text-xs uppercase tracking-wider">
                Connect
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Email digest (Mondays)</span>
              <span className="text-success text-xs uppercase tracking-wider">Enabled</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold mb-2">Data</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Reset the local pipeline to the seeded demo dataset.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-2"
          >
            Reset demo data
          </button>
        </Card>
      </div>
    </AppShell>
  );
}
