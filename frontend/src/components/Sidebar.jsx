import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getTokenPayload } from "../utils/jwt";
import ABK_LOGO from "../assets/abk-logo.svg";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    to: "/customers",
    label: "Customers",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="1.8" strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" strokeWidth="1.8" />
        <path strokeWidth="1.8" strokeLinecap="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    to: "/service-requests",
    label: "Service Requests",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="1.8" strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" strokeWidth="1.8" />
        <path strokeWidth="1.8" strokeLinecap="round" d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    to: "/agents",
    label: "Agents",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" strokeWidth="1.8" />
        <path strokeWidth="1.8" strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    to: "/loans",
    label: "Loans",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="1.8" strokeLinecap="round" d="M12 8v8m-3-5h6M5 21V9a2 2 0 012-2h1.5L12 3l3.5 4H17a2 2 0 012 2v12" />
      </svg>
    ),
  },
];

function TestingBanner() {
  return (
    <div
      className="w-full text-center text-[11px] font-semibold tracking-wide py-1.5 px-3"
      style={{ background: "#fde68a", color: "#78350f" }}
    >
      ⚠ This is a testing environment — not a real banking application.
    </div>
  );
}

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(
    () => sessionStorage.getItem("mobileNavOpen") === "true"
  );
  const navigate = useNavigate();
  const me = getTokenPayload();

  const toggleMobile = () => {
    setMobileOpen((v) => {
      const next = !v;
      sessionStorage.setItem("mobileNavOpen", next);
      return next;
    });
  };

  const logout = () => {
    sessionStorage.removeItem("mobileNavOpen");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* ── DESKTOP: horizontal sticky top navbar ── */}
      <header
        className="hidden lg:block sticky top-0 z-30 w-full shrink-0"
        style={{ background: "#f5f5f5", boxShadow: "0 1px 0 rgba(0,0,0,0.07)" }}
      >
        <TestingBanner />
        <div className="flex items-center h-[72px] px-8 xl:px-14 gap-6 max-w-[1600px] mx-auto">
          {/* Logo */}
          <NavLink to="/" className="shrink-0 flex items-center mr-6">
            <img
              src={ABK_LOGO}
              alt="ABK Bank"
              className="h-13 w-auto object-contain"
            />
          </NavLink>

          {/* Nav items — animated pill indicator */}
          <nav className="flex items-center gap-0.5 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 select-none ${
                    isActive ? "text-[#1a2540]" : "text-slate-600 hover:text-white hover:bg-[#3685c6]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className="absolute inset-0 rounded-lg bg-white transition-opacity duration-150"
                      style={{
                        boxShadow: "0 1px 4px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.05)",
                        zIndex: -1,
                        opacity: isActive ? 1 : 0,
                        pointerEvents: "none",
                      }}
                    />
                    <span
                      className={isActive ? "" : "group-hover:text-white transition-colors duration-150"}
                      style={{ color: isActive ? "#f9c723" : undefined }}
                    >
                      {item.icon}
                    </span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{item.label}</span>
                    <span
                      className="absolute bottom-[3px] left-4 right-4 h-[2px] rounded-full transition-opacity duration-150"
                      style={{ background: "#f9c723", opacity: isActive ? 1 : 0 }}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right: user chip + sign out */}
          {me && (
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "rgba(249,199,35,0.18)",
                    border: "1.5px solid rgba(249,199,35,0.45)",
                    color: "#8a6508",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {me.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-[#1a2540]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {me.name}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {me.role}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:text-white hover:bg-red-500 transition-all duration-200"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.8" strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── MOBILE: sticky header + top-expanding full-width drawer ── */}
      <div className="lg:hidden sticky top-0 z-30">
        <TestingBanner />
        {/* Mobile header bar */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: "white", borderBottom: "1px solid #dde6f0" }}
        >
          <NavLink to="/">
            <img
              src={ABK_LOGO}
              alt="ABK Bank"
              className="h-8 w-auto object-contain"
            />
          </NavLink>
          <button
            onClick={toggleMobile}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <motion.div animate={{ rotate: mobileOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.div>
          </button>
        </div>

        {/* Mobile drawer — slides from top, full width, auto height, in document flow */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              style={{
                overflow: "hidden",
                background: "linear-gradient(180deg, #2d6aaa 0%, #253660 100%)",
                boxShadow: "0 6px 28px rgba(0,0,0,0.28)",
              }}
            >
              {/* Gold top stripe */}
              <div className="h-[2px] bg-gradient-to-r from-[#f9c723] via-[#fad84a] to-transparent" />

              {/* Nav rows */}
              <nav className="px-3 pt-3 pb-2 flex flex-col gap-0.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                        isActive
                          ? "text-white border-l-2 border-[#f9c723]"
                          : "text-white/70 hover:text-white/90 hover:bg-white/5"
                      }`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? { background: "linear-gradient(90deg, rgba(249,199,35,0.13) 0%, rgba(249,199,35,0.04) 100%)" }
                        : {}
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span style={{ color: isActive ? "#f9c723" : undefined }}>{item.icon}</span>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: isActive ? 700 : 600 }}>
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* User + sign out row */}
              <div
                className="flex items-center justify-between px-4 py-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.09)" }}
              >
                {me && (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        background: "linear-gradient(135deg, rgba(249,199,35,0.22) 0%, rgba(249,199,35,0.10) 100%)",
                        border: "1px solid rgba(249,199,35,0.30)",
                        color: "#f9c723",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {me.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {me.name ?? "Unknown"}
                      </p>
                      <p className="text-[10px] text-white/70 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {me.role ?? "N/A"}
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-white hover:bg-red-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="1.8" strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default Sidebar;
