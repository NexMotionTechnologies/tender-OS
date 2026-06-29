import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/nexmotion-logo.png.asset.json";

const NAV = [
  { to: "/", label: "Dashboard", icon: "▦" },
  { to: "/tenders", label: "Tenders", icon: "≡" },
  { to: "/pipeline", label: "Pipeline", icon: "▥" },
  { to: "/reports", label: "Reports", icon: "◔" },
  { to: "/settings", label: "Settings", icon: "⚙" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 shrink-0 border-r border-border bg-surface/60 backdrop-blur flex flex-col">
        <div className="px-5 py-5 border-b border-border flex items-center gap-3">
          <img src={logo.url} alt="NexMotion" className="h-10 w-10 object-contain" />
          <div className="leading-tight">
            <div className="font-display font-bold text-sm tracking-wide">NEXMOTION</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Tender OS
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => {
            const active =
              n.to === "/" ? pathname === "/" : pathname === n.to || pathname.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                to={n.to}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-brand/15 text-brand shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2",
                ].join(" ")}
              >
                <span className="text-base w-5 text-center">{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Scrapers online
          </div>
          <div className="mt-1">Limpopo · Free State · Gauteng</div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-6 px-8 pt-8 pb-6 border-b border-border">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
