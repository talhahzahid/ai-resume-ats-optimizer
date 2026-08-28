import { Menu, Radar } from "lucide-react";

export default function MobileTopBar({ setMobileOpen }) {
  return (
    <div
      className="lg:hidden flex items-center justify-between px-4 py-4 border-b sticky top-0 z-30"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--violet), var(--scan))" }}
        >
          <Radar size={14} color="#fff" />
        </div>
        <span className="ra-display font-bold">ResumeAI</span>
      </div>
      <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg" style={{ background: "var(--paper)" }}>
        <Menu size={18} />
      </button>
    </div>
  );
}
