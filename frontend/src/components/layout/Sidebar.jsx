import { X, LogOut } from "lucide-react";
import { NAV_ITEMS } from "../../data/mockData.js";
import { initialsFromName } from "../../services/api.js";

export default function Sidebar({ page, setPage, mobileOpen, setMobileOpen, user, onLogout }) {
  const initials    = initialsFromName(user?.name ?? "");
  const displayName = user?.name ?? user?.email ?? "Account";

  const content = (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "var(--line)" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, var(--violet), var(--scan))" }}
        >
          {/* simple radar-style svg — no extra lucide import needed */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M6 12h12M12 6v12"/>
          </svg>
        </div>
        <span className="text-base font-bold tracking-tight">ResumeAI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon   = item.icon;
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { setPage(item.key); setMobileOpen(false); }}
              className="ra-nav-link w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: active ? "var(--ink)" : "transparent",
                color:      active ? "#fff"        : "var(--ink)",
              }}
            >
              <Icon size={16} strokeWidth={1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User row + logout */}
      <div
        className="px-4 py-4 border-t flex items-center gap-3"
        style={{ borderColor: "var(--line)" }}
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: "var(--violet)" }}
        >
          {initials}
        </div>

        {/* Name — truncates if long */}
        <span className="text-sm font-medium truncate flex-1 min-w-0">
          {displayName}
        </span>

        {/* Logout button */}
        <button
          onClick={onLogout}
          title="Log out"
          aria-label="Log out"
          className="shrink-0 p-1.5 rounded-lg transition-colors duration-150"
          style={{ color: "var(--ink-soft)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--red-soft)"; e.currentTarget.style.color = "var(--red)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-soft)"; }}
        >
          <LogOut size={15} strokeWidth={2} />
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 border-r h-screen sticky top-0"
        style={{ borderColor: "var(--line)", background: "var(--panel)" }}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute left-0 top-0 h-full w-64 shadow-2xl"
            style={{ background: "var(--panel)" }}
          >
            <div className="flex justify-end p-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-black/5"
              >
                <X size={17} />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
