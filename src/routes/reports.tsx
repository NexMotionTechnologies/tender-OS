import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/tender-ui";
import { useTenderStore } from "@/lib/tenders/store";
import { STATUS_LABELS } from "@/lib/tenders/types";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · NexMotion Tender OS" }] }),
  component: Reports;
});

function Reports() {
  const tenders = useTenderStore((s) => s.tenders);

  const statusData = (["identified", "shortlisted", "preparing", "submitted", "won", "lost"] as const).map(
    (s) => ({ name: STATUS_LABELS[s], value: tenders.filter((t) => t.status === s).length }),
  );

  const byCategory = Object.entries(
    tenders.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const decided = tenders.filter((t) => ["won", "lost"].includes(t.status));
  const wins = decided.filter((t) => t.status === "won").length;
  const losses = decided.length - wins;
  const winRate = decided.length ? Math.round((wins / decided.length) * 100) : 0;

  const avgFit = Math.round(
    tenders.reduce((s, t) => s + t.fitScore, 0) / Math.max(tenders.length, 1),
  );

  const COLORS = ["#5dd6e8", "#9b87f5", "#7ee0ad", "#f3c969", "#f17e7e", "#94a3b8"];

  return (
    <AppShell>
      <PageHeader title="Reports" subtitle="Performance, win rate & opportunity mix." />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total tenders" value={tenders.length} />
          <Stat label="Win rate" value={`${winRate}%`} />
          <Stat label="Avg fit score" value={avgFit} />
          <Stat label="Decisions" value={`${wins}W / ${losses}L`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="font-display font-semibold mb-4">Pipeline by status</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1a2030",
                    border: "1px solid #2b3346",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="font-display font-semibold mb-4">Opportunity mix by category</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1a2030",
                    border: "1px solid #2b3346",
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </Card>
  );
}
