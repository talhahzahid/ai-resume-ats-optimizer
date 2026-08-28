export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8 lg:py-10">
      <h1 className="ra-display text-2xl font-bold mb-6">Settings</h1>
      <div className="ra-card p-6 space-y-5">
        <div>
          <label className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wide">Name</label>
          <input
            defaultValue="Talha Zahid"
            className="w-full mt-1.5 px-3 py-2.5 rounded-lg text-sm"
            style={{ border: "1px solid var(--line)", background: "var(--paper)" }}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wide">Email</label>
          <input
            defaultValue="talhazahid2038@gmail.com"
            className="w-full mt-1.5 px-3 py-2.5 rounded-lg text-sm"
            style={{ border: "1px solid var(--line)", background: "var(--paper)" }}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wide">Target role</label>
          <input
            defaultValue="Frontend / Full-stack Engineer"
            className="w-full mt-1.5 px-3 py-2.5 rounded-lg text-sm"
            style={{ border: "1px solid var(--line)", background: "var(--paper)" }}
          />
        </div>
        <button className="ra-btn-primary px-5 py-2.5 rounded-xl text-sm">Save changes</button>
      </div>
    </div>
  );
}
