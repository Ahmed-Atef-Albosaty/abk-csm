function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    if (start > 1) { pages.push(1); if (start > 2) pages.push("…"); }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) { if (end < totalPages - 1) pages.push("…"); pages.push(totalPages); }
    return pages;
  };

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 justify-between px-5 py-3"
      style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
        Showing <span style={{ color: "#ffffff", fontWeight: 700 }}>{from}–{to}</span>{" "}
        of <span style={{ color: "#ffffff", fontWeight: 700 }}>{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "rgba(255,255,255,0.65)" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {getPages().map((p, i) =>
          p === "…" ? (
            <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-sm"
              style={{ color: "rgba(255,255,255,0.45)" }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-150"
              style={page === p
                ? { background: "#f9c723", color: "#1a2540", fontWeight: 700 }
                : { color: "rgba(255,255,255,0.70)" }
              }
              onMouseEnter={e => { if (page !== p) e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
              onMouseLeave={e => { if (page !== p) e.currentTarget.style.background = "transparent"; }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "rgba(255,255,255,0.65)" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Pagination;
