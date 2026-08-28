import { X, Crown, Radar } from "lucide-react";
import { NAV_ITEMS } from "../../data/mockData.js";

export default function Sidebar({ page, setPage, mobileOpen, setMobileOpen }) {
  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-6">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--violet), var(--scan))" }}
        >
          <Radar size={16} color="#fff" strokeWidth={2.5} />
        </div>
        <span className="ra-display text-lg font-bold">ResumeAI</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setPage(item.key);
                setMobileOpen(false);
              }}
              className="ra-nav-link w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: active ? "var(--ink)" : "transparent",
                color: active ? "#fff" : "var(--ink)",
              }}
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-3">
        <div className="ra-card p-4" style={{ background: "var(--violet-soft)", borderColor: "#DAD5FB" }}>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={15} color="var(--violet)" />
            <span className="text-sm font-semibold">Go Pro</span>
          </div>
          <p className="text-xs text-[var(--ink-soft)] mb-3">Unlimited scans + deeper AI rewrite suggestions.</p>
          <button className="ra-btn-primary text-xs w-full py-2 rounded-lg">Upgrade</button>
        </div>
        <div className="flex items-center gap-3 px-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
            style={{ background: "var(--ink)" }}
          >
            TZ
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Talha Zahid</div>
            <div className="text-xs text-[var(--ink-soft)]">Free plan</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 border-r h-screen sticky top-0"
        style={{ borderColor: "var(--line)", background: "var(--panel)" }}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 shadow-2xl" style={{ background: "var(--panel)" }}>
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-black/5">
                <X size={18} />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
