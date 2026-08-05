import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axios";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";

const AVATAR_COLORS = [
  { bg: "#e8f2fc", text: "#2268a5" },
  { bg: "#fef3c7", text: "#8a6508" },
  { bg: "#f0fdf4", text: "#15803d" },
  { bg: "#fdf4ff", text: "#7e22ce" },
  { bg: "#fff1f2", text: "#be123c" },
  { bg: "#ecfeff", text: "#0e7490" },
];
const getAvatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const statCards = [
  {
    key: "New", label: "New", accent: "#3685c6", labelColor: "#2268a5", glow: "rgba(54,133,198,0.12)",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="1.8" strokeLinecap="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
      </svg>
    ),
  },
  {
    key: "InProgress", label: "In Progress", accent: "#f9c723", labelColor: "#8a6508", glow: "rgba(249,199,35,0.18)",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
        <path strokeWidth="1.8" strokeLinecap="round" d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    key: "Escalated", label: "Escalated", accent: "#dc2626", labelColor: "#b91c1c", glow: "rgba(220,38,38,0.10)",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="1.8" strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  {
    key: "Resolved", label: "Resolved", accent: "#16a34a", labelColor: "#15803d", glow: "rgba(22,163,74,0.10)",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="1.8" strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function CountUp({ target, duration = 1100 }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (target === null || target === undefined) return;
    cancelAnimationFrame(rafRef.current);
    const startTime = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return <>{target !== null ? count : "-"}</>;
}

function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const dayStr = time.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const clockStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div className="hidden sm:block text-right">
        <p className="text-[10px] font-medium text-slate-500 tracking-wider">{dayStr}</p>
        <p className="text-base font-semibold text-[#1a2540]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{clockStr}</p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
        style={{ background: "rgba(249,199,35,0.12)", border: "1px solid rgba(249,199,35,0.40)" }}>
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#f9c723" }} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#d4a017" }} />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#8a6508", fontFamily: "'JetBrains Mono', monospace" }}>Live</span>
      </div>
    </div>
  );
}

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([API.get("/dashboard"), API.get("/service-requests")])
      .then(([dash, reqs]) => {
        setCounts(dash.data);
        setRecentRequests((reqs.data.serviceRequests || reqs.data).slice(0, 8));
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"));
  }, []);

  return (
    <Layout>
      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1600px] mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="page-header mb-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="page-header-eyebrow">Operations Portal</p>
              <h1 className="page-header-title">Dashboard</h1>
              <p className="page-header-sub">Real-time service request monitoring</p>
            </div>
            <div className="flex items-start gap-5 shrink-0">
              {/* Page illustration */}
              <div className="hidden lg:block" aria-hidden="true">
                <svg width="162" height="106" viewBox="0 0 162 106" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="18" width="96" height="84" rx="10" fill="#e8f2fc"/>
                  <line x1="16" y1="26" x2="16" y2="94" stroke="#c4d8ee" strokeWidth="1.2"/>
                  <line x1="16" y1="94" x2="96" y2="94" stroke="#c4d8ee" strokeWidth="1.2"/>
                  <rect x="20" y="72" width="12" height="22" rx="3" fill="#3685c6" opacity="0.65"/>
                  <rect x="36" y="57" width="12" height="37" rx="3" fill="#f9c723"/>
                  <rect x="52" y="64" width="12" height="30" rx="3" fill="#3685c6" opacity="0.85"/>
                  <rect x="68" y="47" width="12" height="47" rx="3" fill="#f9c723" opacity="0.85"/>
                  <rect x="84" y="55" width="12" height="39" rx="3" fill="#3685c6"/>
                  <polyline points="26,74 42,59 58,66 74,49 90,57" stroke="#1a2540" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="74" cy="49" r="4" fill="#f9c723" stroke="#1a2540" strokeWidth="1.5"/>
                  <circle cx="130" cy="48" r="28" fill="#e8f2fc"/>
                  <circle cx="130" cy="48" r="21" fill="none" stroke="#dde6f0" strokeWidth="5"/>
                  <circle cx="130" cy="48" r="21" fill="none" stroke="#3685c6" strokeWidth="5" strokeDasharray="80 52" strokeDashoffset="-14" strokeLinecap="round"/>
                  <circle cx="130" cy="48" r="11" fill="white"/>
                  <circle cx="130" cy="48" r="4" fill="#3685c6"/>
                  <rect x="104" y="4" width="52" height="20" rx="6" fill="#1a3f7a"/>
                  <rect x="109" y="9" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.4)"/>
                  <rect x="109" y="15" width="28" height="5" rx="2" fill="#f9c723"/>
                  <rect x="104" y="82" width="52" height="20" rx="6" fill="#3685c6"/>
                  <rect x="109" y="87" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.4)"/>
                  <rect x="109" y="93" width="22" height="5" rx="2" fill="white" opacity="0.88"/>
                </svg>
              </div>
              <LiveClock />
            </div>
          </div>
          <div className="page-header-rule" />
        </motion.div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}

        {/* Stat cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map(({ key, label, accent, labelColor, glow, icon }) => (
            <motion.div key={key} variants={cardVariants}
              className="rounded-2xl p-4 sm:p-6 relative overflow-hidden cursor-default"
              style={{ background: "#ffffff", borderTop: `3px solid ${accent}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 4px 24px rgba(0,0,0,0.04)" }}
              whileHover={{ y: -4, boxShadow: `0 10px 32px rgba(0,0,0,0.08), 0 0 0 1.5px ${accent}30`, transition: { duration: 0.2 } }}
            >
              {/* Glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top left, ${glow} 0%, transparent 65%)` }} />

              {/* Icon */}
              <div className="absolute top-4 right-4 opacity-15" style={{ color: accent }}>
                {icon}
              </div>

              <p className="relative text-[9px] font-bold uppercase tracking-[0.22em] mb-3"
                style={{ color: labelColor, fontFamily: "'Space Grotesk', sans-serif" }}>
                {label}
              </p>
              <p className="relative leading-none mb-5 text-4xl sm:text-[3.25rem]"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "#1a2540", letterSpacing: "-0.03em" }}>
                <CountUp target={counts ? (counts[key] ?? 0) : null} />
              </p>

              {/* Fill bar */}
              <div className="relative h-[3px] rounded-full overflow-hidden" style={{ background: `${accent}18` }}>
                <motion.div className="h-full rounded-full" style={{ background: accent }}
                  initial={{ width: "0%" }}
                  animate={{ width: counts ? "100%" : "0%" }}
                  transition={{ duration: 1.3, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent requests */}
        {recentRequests.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-semibold text-[#1a2540]">Recent Requests</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#dde6f0] to-transparent" />
              <button onClick={() => navigate("/service-requests")}
                className="text-sm font-medium text-[#3685c6] hover:text-[#2268a5] transition-colors">
                View all →
              </button>
            </div>
            <div className="section-card overflow-hidden table-gradient-card">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th className="hidden sm:table-cell">Customer</th>
                      <th className="hidden md:table-cell">Created</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((req, i) => {
                      const name = req.customerId?.name || "";
                      const av = getAvatarColor(name);
                      return (
                        <motion.tr key={req._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                          <td className="font-medium">{req.type}</td>
                          <td><StatusBadge value={req.priority} /></td>
                          <td><StatusBadge value={req.status} /></td>
                          <td className="hidden sm:table-cell">
                            <div className="flex items-center gap-2.5">
                              {name && (
                                <span className="row-avatar" style={{ background: "rgba(255,255,255,0.18)", color: "#ffffff", border: "1.5px solid rgba(255,255,255,0.30)" }}>
                                  {name[0].toUpperCase()}
                                </span>
                              )}
                              <span className="font-semibold text-white">{name || ""}</span>
                            </div>
                          </td>
                          <td className="hidden md:table-cell td-secondary" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => navigate(`/service-requests/${req._id}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3685c6] bg-[#e8f2fc] hover:bg-[#3685c6] hover:text-white transition-all duration-150"
                            >
                              View
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeWidth="2.5" strokeLinecap="round" d="M9 18l6-6-6-6" />
                              </svg>
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
