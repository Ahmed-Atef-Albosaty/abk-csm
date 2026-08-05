import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getTokenPayload } from "../utils/jwt";
import Layout from "../components/Layout";

const MODULES = [
  {
    num: "01",
    label: "Customers",
    to: "/customers",
    description: "Full customer registry with profiles, balances, and complete transaction history in one view.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="1.6" strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" strokeWidth="1.6" />
        <path strokeWidth="1.6" strokeLinecap="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    num: "02",
    label: "Service Requests",
    to: "/service-requests",
    description: "Track, assign, and resolve requests across every status, from intake to resolution.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="1.6" strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" strokeWidth="1.6" />
        <path strokeWidth="1.6" strokeLinecap="round" d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    num: "03",
    label: "Agents",
    to: "/agents",
    description: "Onboard service agents, assign roles, and monitor workload distribution across the team.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" strokeWidth="1.6" />
        <path strokeWidth="1.6" strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    num: "04",
    label: "Dashboard",
    to: "/dashboard",
    description: "Live KPIs and real-time request monitoring across the entire portal, at a glance.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.6" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.6" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.6" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.6" />
      </svg>
    ),
  },
];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=80";

const STATS = [
  ["4", "Portal Modules"],
  ["Live", "Real-Time Sync"],
  ["KWD", "Base Currency"],
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Eyebrow({ children, dark }) {
  return (
    <p
      className="text-[10px] font-bold uppercase tracking-[0.28em] mb-2.5"
      style={{ fontFamily: "'JetBrains Mono', monospace", color: dark ? "#f9c723" : "#8a6508" }}
    >
      {children}
    </p>
  );
}

function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!getTokenPayload();
  const destination = isLoggedIn ? "/dashboard" : "/login";
  const ctaLabel = isLoggedIn ? "Open Dashboard" : "Access Portal";

  const scrollToModules = (e) => {
    e.preventDefault();
    document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* ── HERO ── */}
        <section
          className="relative flex flex-col min-h-[560px] sm:min-h-[640px] lg:min-h-[80vh]"
          style={{
            backgroundImage: `url('${HERO_IMAGE}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark gradient overlay for text legibility over the photo */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, rgba(26,37,64,0.93) 0%, rgba(42,79,138,0.82) 60%, rgba(26,37,64,0.93) 100%)",
            }}
          />
          {/* Faint grid texture, matches .app-bg language elsewhere in the app */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 sm:px-8 py-16 sm:py-20">
            <motion.div
              initial={{ width: 0 }} animate={{ width: 64 }} transition={{ duration: 0.6, delay: 0.1 }}
              style={{ height: 3, background: "linear-gradient(to right, #f9c723, #fad84a)", borderRadius: 99, marginBottom: 22 }}
            />
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <Eyebrow dark>Al Ahli Bank of Kuwait &middot; Operations Portal</Eyebrow>
            </motion.div>

            <motion.h1
              custom={1} variants={fadeUp} initial="hidden" animate="visible"
              className="font-extrabold text-white leading-[1.08] tracking-tight mb-5"
              style={{ fontSize: "clamp(2.1rem, 6vw, 3.8rem)", maxWidth: 780 }}
            >
              One portal for every{" "}
              <span style={{ color: "#f9c723" }}>banking operation</span>
            </motion.h1>

            <motion.p
              custom={2} variants={fadeUp} initial="hidden" animate="visible"
              className="text-base sm:text-lg leading-relaxed mb-9 max-w-[540px]"
              style={{ color: "rgba(255,255,255,0.82)" }}
            >
              Manage customers, service requests, and agents from a single unified
              workspace &mdash; built for speed, clarity, and real-time visibility.
            </motion.p>

            <motion.div
              custom={3} variants={fadeUp} initial="hidden" animate="visible"
              className="flex flex-wrap items-center justify-center gap-4 mb-14"
            >
              <button onClick={() => navigate(destination)} className="btn-gold px-8 py-3.5 rounded-xl text-sm font-bold">
                {ctaLabel}
              </button>
              <button
                onClick={scrollToModules}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ background: "rgba(249,199,35,0.08)", color: "#ffffff", border: "1px solid rgba(249,199,35,0.30)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(249,199,35,0.18)"; e.currentTarget.style.borderColor = "rgba(249,199,35,0.60)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(249,199,35,0.08)"; e.currentTarget.style.borderColor = "rgba(249,199,35,0.30)"; }}
              >
                Explore Modules
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2.5" strokeLinecap="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </motion.div>

            <motion.div
              custom={4} variants={fadeUp} initial="hidden" animate="visible"
              className="flex flex-wrap items-center justify-center gap-x-9 gap-y-5"
            >
              {STATS.map(([val, lbl]) => (
                <div key={lbl} className="text-center">
                  <p className="text-xl sm:text-2xl font-extrabold leading-none" style={{ color: "#f9c723" }}>{val}</p>
                  <p
                    className="text-[0.6rem] sm:text-[0.65rem] font-semibold uppercase tracking-[0.14em] mt-1.5"
                    style={{ color: "rgba(255,255,255,0.70)" }}
                  >
                    {lbl}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom fade into the modules section below */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, #eaf1f8)" }}
          />
        </section>

        {/* ── MODULES ── */}
        <section id="modules" className="py-14 sm:py-20 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
            <div className="text-center mb-14">
              <Eyebrow>What&rsquo;s inside</Eyebrow>
              <h2 className="text-[1.7rem] sm:text-4xl font-bold tracking-tight" style={{ color: "#1a2540" }}>
                Four modules, one workspace
              </h2>
              <div style={{ height: 3, width: 48, background: "#f9c723", borderRadius: 99, margin: "16px auto 0" }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MODULES.map((m, i) => (
                <motion.div
                  key={m.label}
                  custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className="section-card p-7 flex flex-col cursor-pointer"
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  onClick={() => navigate(m.to)}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="flex items-center justify-center w-14 h-14 rounded-xl"
                      style={{ background: "rgba(249,199,35,0.12)", border: "1px solid rgba(249,199,35,0.30)", color: "#8a6508" }}
                    >
                      {m.icon}
                    </div>
                    <span
                      className="text-[0.65rem] font-bold tracking-[0.12em]"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}
                    >
                      {m.num}
                    </span>
                  </div>
                  <p className="text-[1.05rem] font-bold mb-2" style={{ color: "#1a2540" }}>{m.label}</p>
                  <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: "#4b5e7a" }}>
                    {m.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#3685c6" }}>
                    Open {m.label}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2.5" strokeLinecap="round" d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER CTA ── */}
        <section
          className="px-6 py-14 sm:py-16 text-center"
          style={{
            background: "linear-gradient(160deg, #2d6aaa 0%, #253660 100%)",
          }}
        >
          <div style={{ height: 3, background: "linear-gradient(to right, transparent, #f9c723, transparent)", marginBottom: 36, maxWidth: 200, marginLeft: "auto", marginRight: "auto" }} />
          <Eyebrow dark>Ready to get started?</Eyebrow>
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-3">
            {isLoggedIn ? "Jump back into your portal" : "Sign in to your operations portal"}
          </h2>
          <p className="text-sm sm:text-base mb-8" style={{ color: "rgba(255,255,255,0.70)" }}>
            {isLoggedIn ? "Your session is active. Head straight to the dashboard." : "Authorised personnel only. Contact your system administrator for access."}
          </p>
          <button onClick={() => navigate(destination)} className="btn-gold px-10 py-3.5 rounded-xl text-sm font-bold">
            {isLoggedIn ? "Go to Dashboard" : "Sign In to Portal"}
          </button>
          <p
            className="mt-10 text-xs"
            style={{ color: "rgba(255,255,255,0.70)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            &copy; {new Date().getFullYear()} Al Ahli Bank of Kuwait. All rights reserved.
          </p>
        </section>
      </div>
    </Layout>
  );
}

export default Home;
