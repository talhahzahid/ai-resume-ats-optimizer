export default function Badge({ tone = "violet", children }) {
  const map = {
    violet: { bg: "var(--violet-soft)", fg: "var(--violet)" },
    scan: { bg: "var(--scan-soft)", fg: "#0A8F71" },
    amber: { bg: "var(--amber-soft)", fg: "#A16A0F" },
    red: { bg: "var(--red-soft)", fg: "#C43D3D" },
    ink: { bg: "#F0F0F4", fg: "var(--ink-soft)" },
  };
  const c = map[tone] || map.violet;
  return (
    <span
      className="ra-mono text-[11px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide"
      style={{ background: c.bg, color: c.fg }}
    >
      {children}
    </span>
  );
}
