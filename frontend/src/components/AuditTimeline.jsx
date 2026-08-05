import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function AuditTimeline({ notes }) {
  const [expanded, setExpanded] = useState(null);

  if (!notes?.length)
    return <p className="text-sm py-6 text-center" style={{ color: "rgba(255,255,255,0.50)" }}>No activity recorded yet.</p>;

  return (
    <ol className="relative ml-3 space-y-6" style={{ borderLeft: "1px solid rgba(255,255,255,0.18)" }}>
      {notes.map((note, i) => {
        const agentName = note.agentId?.name || "Unknown Agent";
        const agentRole = note.agentId?.role || "";
        const isOpen = expanded === note._id;

        return (
          <motion.li
            key={note._id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
            className="ml-6"
          >
            <span
              className="absolute -left-[9px] flex items-center justify-center w-[18px] h-[18px] rounded-full"
              style={{ background: "#f9c723", boxShadow: "0 0 0 3px rgba(249,199,35,0.25)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#1a2540" }} />
            </span>

            <button
              onClick={() => setExpanded(isOpen ? null : note._id)}
              className="w-full text-left group"
            >
              <div className="flex items-start justify-between gap-3">
                <p
                  className="text-base font-medium leading-snug transition-colors"
                  style={{ color: "#ffffff" }}
                >
                  {note.note}
                </p>
                <svg
                  className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  style={{ color: "rgba(255,255,255,0.45)" }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeWidth="2" strokeLinecap="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <time className="text-sm" style={{ color: "rgba(255,255,255,0.52)" }}>
                  {new Date(note.timestamp).toLocaleString()}
                </time>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>·</span>
                <span className="text-sm font-medium" style={{ color: "#f9c723" }}>{agentName}</span>
              </div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-3 rounded-lg p-4 space-y-3"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>Event</p>
                      <p className="text-base" style={{ color: "#ffffff" }}>{note.note}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>Agent</p>
                        <p className="text-base font-medium" style={{ color: "#ffffff" }}>{agentName}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>Role</p>
                        <p className="text-base" style={{ color: "#ffffff" }}>{agentRole || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>Date</p>
                        <p className="text-base" style={{ color: "#ffffff" }}>
                          {new Date(note.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>Time</p>
                        <p className="text-base" style={{ color: "#ffffff" }}>
                          {new Date(note.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </ol>
  );
}

export default AuditTimeline;
