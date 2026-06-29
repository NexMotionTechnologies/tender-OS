import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, DeadlineChip, FitScore, StatusBadge } from "@/components/tender-ui";
import { formatZAR, useTenderStore } from "@/lib/tenders/store";
import type { Province, TenderStatus } from "@/lib/tenders/types";
import { STATUS_LABELS } from "@/lib/tenders/types";

export const Route = createFileRoute("/tenders/")({
  head: () => ({ meta: [{ title: "Tenders · NexMotion Tender OS" }] }),
  component: TenderList,
});

const PROVINCES: ("All" | Province)[] = ["All", "Limpopo", "Free State", "Gauteng"];
const STATUSES: ("All" | TenderStatus)[] = [
  "All",
  "identified",
  "shortlisted",
  "preparing",
  "submitted",
  "won",
  "lost",
];

function TenderList() {
  const tenders = useTenderStore((s) => s.tenders);
  const [q, setQ] = useState("");
  const [province, setProvince] = useState<(typeof PROVINCES)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");

  const filtered = tenders.filter((t) => {
    if (province !== "All" && t.province !== province) return false;
    if (status !== "All" && t.status !== status) return false;
    if (q && !`${t.title} ${t.municipality} ${t.category}`.toLowerCase().includes(q.toLowerCase()))
      return false;
    return true;
  });

  return (
    <AppShell>
      <PageHeader
        title="Tenders"
        subtitle={`${filtered.length} of ${tenders.length} opportunities`}
      />
      <div className="p-8 space-y-4">
        <Card className="p-4 flex flex-wrap gap-3 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, municipality, category…"
            className="flex-1 min-w-[220px] bg-input/40 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
          <Select value={province} onChange={setProvince} options={PROVINCES} label="Province" />
          <Select
            value={status}
            onChange={setStatus}
            options={STATUSES}
            label="Status"
            labelMap={STATUS_LABELS as Record<string, string>}
          />
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Tender</th>
                  <th className="text-left px-4 py-3 font-medium">Location</th>
                  <th className="text-left px-4 py-3 font-medium">Budget</th>
                  <th className="text-left px-4 py-3 font-medium">Deadline</th>
                  <th className="text-left px-4 py-3 font-medium">Fit</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-2/40 transition">
                    <td className="px-4 py-3">
                      <Link
                        to="/tenders/$id"
                        params={{ id: t.id }}
                        className="font-medium hover:text-brand"
                      >
                        {t.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">{t.category}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.municipality}
                      <div className="text-xs">{t.province}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {formatZAR(t.budgetMin)} – {formatZAR(t.budgetMax)}
                    </td>
                    <td className="px-4 py-3">
                      <DeadlineChip deadline={t.deadline} />
                    </td>
                    <td className="px-4 py-3">
                      <FitScore score={t.fitScore} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No tenders match the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  labelMap,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  label: string;
  labelMap?: Record<string, string>;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="uppercase tracking-wider">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-input/40 border border-border rounded-md px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labelMap?.[o] ?? o}
          </option>
        ))}
      </select>
    </label>
  );
}
