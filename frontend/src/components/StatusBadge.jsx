const config = {
  New:        { bg: "bg-[#f9c723]/10", text: "text-[#8a6508]",  dot: "bg-[#f9c723]"  },
  InProgress: { bg: "bg-[#f9c723]/10", text: "text-amber-700",  dot: "bg-amber-400"  },
  Escalated:  { bg: "bg-red-50",       text: "text-red-700",    dot: "bg-red-500"    },
  Resolved:   { bg: "bg-green-50",     text: "text-green-700",  dot: "bg-green-500"  },
  Active:     { bg: "bg-green-50",     text: "text-green-700",  dot: "bg-green-500"  },
  Blocked:    { bg: "bg-red-50",       text: "text-red-700",    dot: "bg-red-500"    },
  Frozen:     { bg: "bg-slate-100",    text: "text-slate-600",  dot: "bg-slate-400"  },
  Closed:     { bg: "bg-slate-100",    text: "text-slate-600",  dot: "bg-slate-400"  },
  Low:        { bg: "bg-slate-50",     text: "text-slate-600",  dot: "bg-slate-400"  },
  Medium:     { bg: "bg-[#f9c723]/10", text: "text-amber-700",  dot: "bg-[#f9c723]"  },
  High:       { bg: "bg-red-50",       text: "text-red-700",    dot: "bg-red-500"    },
  Supervisor: { bg: "bg-purple-50",    text: "text-purple-700", dot: "bg-purple-500" },
  Agent:      { bg: "bg-[#e8f2fc]",    text: "text-[#3685c6]",  dot: "bg-[#3685c6]"  },
};

function StatusBadge({ value }) {
  const c = config[value] || { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {value}
    </span>
  );
}

export default StatusBadge;
