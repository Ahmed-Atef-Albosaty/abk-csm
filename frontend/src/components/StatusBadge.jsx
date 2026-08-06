const config = {
  New:        { bg: "bg-[#f9c723]/10", text: "text-[#8a6508]",  dot: "bg-[#f9c723]"  },
  InProgress: { bg: "bg-[#f9c723]/10", text: "text-amber-700",  dot: "bg-amber-400"  },
  Escalated:  { bg: "bg-red-50",       text: "text-red-700",    dot: "bg-red-500"    },
  Resolved:   { bg: "bg-green-50",     text: "text-green-700",  dot: "bg-green-500"  },
  Active:     { bg: "bg-green-50",     text: "text-green-700",  dot: "bg-green-500"  },
  Suspended:  { bg: "bg-[#f9c723]/10", text: "text-amber-700",  dot: "bg-[#f9c723]"  },
  Inactive:   { bg: "bg-slate-100",    text: "text-slate-600",  dot: "bg-slate-400"  },
  Blocked:    { bg: "bg-red-50",       text: "text-red-700",    dot: "bg-red-500"    },
  Frozen:     { bg: "bg-slate-100",    text: "text-slate-600",  dot: "bg-slate-400"  },
  Closed:     { bg: "bg-slate-100",    text: "text-slate-600",  dot: "bg-slate-400"  },
  Low:        { bg: "bg-slate-50",     text: "text-slate-600",  dot: "bg-slate-400"  },
  Medium:     { bg: "bg-[#f9c723]/10", text: "text-amber-700",  dot: "bg-[#f9c723]"  },
  High:       { bg: "bg-red-50",       text: "text-red-700",    dot: "bg-red-500"    },
  Supervisor: { bg: "bg-purple-50",    text: "text-purple-700", dot: "bg-purple-500" },
  Agent:      { bg: "bg-[#e8f2fc]",    text: "text-[#3685c6]",  dot: "bg-[#3685c6]"  },
};

// Same semantics, but readable on the dark `.detail-card` gradient — translucent
// colored pill + light pastel text, matching the action-button palette already
// used on those cards (see LoanDetail/CardDetail Actions buttons).
const darkConfig = {
  New:        { style: { background: "rgba(249,199,35,0.22)",  color: "#f9c723" } },
  InProgress: { style: { background: "rgba(249,199,35,0.22)",  color: "#f9c723" } },
  Escalated:  { style: { background: "rgba(239,68,68,0.22)",   color: "#fca5a5" } },
  Resolved:   { style: { background: "rgba(34,197,94,0.22)",   color: "#86efac" } },
  Active:     { style: { background: "rgba(34,197,94,0.22)",   color: "#86efac" } },
  Suspended:  { style: { background: "rgba(249,199,35,0.22)",  color: "#f9c723" } },
  Inactive:   { style: { background: "rgba(148,163,184,0.22)", color: "#cbd5e1" } },
  Blocked:    { style: { background: "rgba(239,68,68,0.22)",   color: "#fca5a5" } },
  Frozen:     { style: { background: "rgba(148,163,184,0.22)", color: "#cbd5e1" } },
  Closed:     { style: { background: "rgba(148,163,184,0.22)", color: "#cbd5e1" } },
  Low:        { style: { background: "rgba(148,163,184,0.22)", color: "#cbd5e1" } },
  Medium:     { style: { background: "rgba(249,199,35,0.22)",  color: "#f9c723" } },
  High:       { style: { background: "rgba(239,68,68,0.22)",   color: "#fca5a5" } },
  Supervisor: { style: { background: "rgba(168,85,247,0.22)",  color: "#d8b4fe" } },
  Agent:      { style: { background: "rgba(54,133,198,0.28)",  color: "#93c5fd" } },
};

function StatusBadge({ value, dark = false }) {
  if (dark) {
    const c = (darkConfig[value] || { style: { background: "rgba(148,163,184,0.22)", color: "#cbd5e1" } }).style;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium" style={c}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
        {value}
      </span>
    );
  }

  const c = config[value] || { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {value}
    </span>
  );
}

export default StatusBadge;
