import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axios";

const ABK_LOGO = "https://upload.wikimedia.org/wikipedia/commons/5/52/ABK_Logo.svg";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [infoMessage, setInfoMessage] = useState(location.state?.message || "");
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex auth-page">

      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[58%] relative flex-col justify-between p-14 overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#061628]/88" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />
        {/* Gold top stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#f9c723] via-[#fad84a] to-transparent" />
        {/* Blue accent glow bottom-right */}
        <div
          className="absolute bottom-0 right-0 w-96 h-72 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 100% 100%, rgba(54,133,198,0.18) 0%, transparent 65%)" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <img
            src={ABK_LOGO}
            alt="ABK"
            className="h-11 object-contain"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <p
            className="text-[#f9c723] text-[10px] font-bold tracking-[0.3em] uppercase mb-6"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Internal Operations Portal
          </p>
          <h1
            className="text-white leading-tight mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "3.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Every account.<br />Every request.<br />
            <span style={{ color: "#f9c723" }}>One place.</span>
          </h1>
          <p className="text-blue-200/60 text-base leading-relaxed max-w-sm">
            Manage customers, track service requests, and process transactions with a full audit trail.
          </p>

          {/* Stats strip */}
          <div className="mt-10 flex items-center gap-8 pt-8 border-t border-white/10">
            {[
              { val: "24/7", label: "Uptime" },
              { val: "100%", label: "Audit trail" },
              { val: "< 2s", label: "Response" },
            ].map(({ val, label }) => (
              <div key={label}>
                <p
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {val}
                </p>
                <p className="text-xs text-blue-300/50 uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-300/30 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          © {new Date().getFullYear()} Al Ahli Bank of Kuwait
        </p>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f5f5f5] px-6 py-12 sm:px-12 relative overflow-hidden">
        {/* Subtle background accents */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 600px 500px at 80% 10%, rgba(54,133,198,0.07) 0%, transparent 60%), radial-gradient(ellipse 400px 400px at 20% 90%, rgba(249,199,35,0.05) 0%, transparent 60%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.11 }}>
          <svg viewBox="0 0 600 900" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            {/* === TOP-LEFT: floating stat cards === */}
            <rect x="20" y="30" width="110" height="56" rx="7" fill="none" stroke="#3685c6" strokeWidth="1.8" opacity="0.6" />
            <rect x="28" y="42" width="44" height="5" rx="2" fill="#3685c6" opacity="0.5" />
            <rect x="28" y="52" width="60" height="10" rx="2" fill="#f9c723" opacity="0.45" />
            <rect x="28" y="67" width="36" height="4" rx="1" fill="#3685c6" opacity="0.3" />
            <rect x="148" y="18" width="110" height="56" rx="7" fill="none" stroke="#3685c6" strokeWidth="1.8" opacity="0.55" />
            <rect x="156" y="30" width="44" height="5" rx="2" fill="#3685c6" opacity="0.5" />
            <rect x="156" y="40" width="60" height="10" rx="2" fill="#3685c6" opacity="0.4" />
            <rect x="156" y="55" width="36" height="4" rx="1" fill="#3685c6" opacity="0.3" />
            <rect x="290" y="28" width="110" height="56" rx="7" fill="none" stroke="#3685c6" strokeWidth="1.8" opacity="0.5" />
            <rect x="298" y="40" width="44" height="5" rx="2" fill="#3685c6" opacity="0.4" />
            <rect x="298" y="50" width="60" height="10" rx="2" fill="#f9c723" opacity="0.38" />
            <rect x="298" y="65" width="36" height="4" rx="1" fill="#3685c6" opacity="0.28" />
            {/* connector lines between cards */}
            <line x1="130" y1="58" x2="148" y2="46" stroke="#3685c6" strokeWidth="1" strokeDasharray="4 3" opacity="0.3" />
            <line x1="258" y1="46" x2="290" y2="56" stroke="#3685c6" strokeWidth="1" strokeDasharray="4 3" opacity="0.28" />

            {/* === TOP-RIGHT: donut gauge === */}
            <circle cx="530" cy="80" r="50" fill="none" stroke="#3685c6" strokeWidth="7" opacity="0.2" />
            <circle cx="530" cy="80" r="50" fill="none" stroke="#f9c723" strokeWidth="7" strokeDasharray="188 126" strokeLinecap="round" opacity="0.5" />
            <circle cx="530" cy="80" r="38" fill="none" stroke="#3685c6" strokeWidth="3" opacity="0.15" />
            <rect x="508" y="138" width="44" height="5" rx="2" fill="#3685c6" opacity="0.3" />
            <rect x="514" y="147" width="32" height="4" rx="1" fill="#3685c6" opacity="0.22" />

            {/* === MID-LEFT: network mesh === */}
            <circle cx="35" cy="230" r="6" fill="#3685c6" opacity="0.4" />
            <circle cx="100" cy="200" r="5" fill="#f9c723" opacity="0.35" />
            <circle cx="68" cy="270" r="4" fill="#3685c6" opacity="0.35" />
            <circle cx="145" cy="245" r="6" fill="#3685c6" opacity="0.4" />
            <circle cx="110" cy="310" r="4" fill="#f9c723" opacity="0.3" />
            <circle cx="55" cy="340" r="5" fill="#3685c6" opacity="0.3" />
            <line x1="35" y1="230" x2="100" y2="200" stroke="#3685c6" strokeWidth="1.2" opacity="0.28" />
            <line x1="100" y1="200" x2="145" y2="245" stroke="#3685c6" strokeWidth="1.2" opacity="0.28" />
            <line x1="35" y1="230" x2="68" y2="270" stroke="#3685c6" strokeWidth="1" opacity="0.22" />
            <line x1="68" y1="270" x2="110" y2="310" stroke="#3685c6" strokeWidth="1" opacity="0.22" />
            <line x1="110" y1="310" x2="55" y2="340" stroke="#3685c6" strokeWidth="1" opacity="0.2" />
            <line x1="145" y1="245" x2="110" y2="310" stroke="#3685c6" strokeWidth="1" opacity="0.2" />

            {/* === CENTER: main wide monitor === */}
            <rect x="80" y="390" width="300" height="210" rx="10" fill="none" stroke="#3685c6" strokeWidth="2.5" opacity="0.65" />
            <rect x="85" y="395" width="290" height="196" rx="7" fill="#dbe8f5" opacity="0.5" />
            <rect x="218" y="600" width="32" height="14" rx="2" fill="#3685c6" opacity="0.5" />
            <rect x="200" y="612" width="68" height="6" rx="2" fill="#3685c6" opacity="0.4" />
            {/* screen header */}
            <rect x="100" y="408" width="100" height="7" rx="2" fill="#3685c6" opacity="0.45" />
            <rect x="210" y="408" width="50" height="7" rx="2" fill="#f9c723" opacity="0.4" />
            {/* bar chart */}
            <rect x="104" y="530" width="22" height="52" rx="3" fill="#f9c723" opacity="0.55" />
            <rect x="132" y="508" width="22" height="74" rx="3" fill="#3685c6" opacity="0.55" />
            <rect x="160" y="542" width="22" height="40" rx="3" fill="#f9c723" opacity="0.5" />
            <rect x="188" y="496" width="22" height="86" rx="3" fill="#3685c6" opacity="0.55" />
            <rect x="216" y="518" width="22" height="64" rx="3" fill="#f9c723" opacity="0.45" />
            <rect x="244" y="504" width="22" height="78" rx="3" fill="#3685c6" opacity="0.5" />
            <rect x="272" y="528" width="22" height="54" rx="3" fill="#f9c723" opacity="0.4" />
            <rect x="300" y="512" width="22" height="70" rx="3" fill="#3685c6" opacity="0.45" />
            <rect x="328" y="535" width="22" height="47" rx="3" fill="#f9c723" opacity="0.38" />
            {/* trend line */}
            <polyline points="100,522 132,506 160,514 188,492 216,500 244,484 272,490 300,476 340,466" fill="none" stroke="#f9c723" strokeWidth="2.2" opacity="0.55" />
            <circle cx="340" cy="466" r="4" fill="#f9c723" opacity="0.6" />

            {/* === RIGHT: side monitor portrait === */}
            <rect x="400" y="420" width="72" height="158" rx="7" fill="none" stroke="#3685c6" strokeWidth="2" opacity="0.55" />
            <rect x="404" y="424" width="64" height="148" rx="5" fill="#dbe8f5" opacity="0.45" />
            <rect x="432" y="578" width="16" height="10" rx="1" fill="#3685c6" opacity="0.4" />
            <circle cx="436" cy="490" r="36" fill="none" stroke="#3685c6" strokeWidth="6" opacity="0.28" />
            <circle cx="436" cy="490" r="36" fill="none" stroke="#f9c723" strokeWidth="6" strokeDasharray="136 90" strokeLinecap="round" opacity="0.55" />
            <rect x="416" y="538" width="40" height="5" rx="1" fill="#3685c6" opacity="0.28" />
            <rect x="420" y="547" width="32" height="4" rx="1" fill="#3685c6" opacity="0.22" />

            {/* === BOTTOM-LEFT: keyboard + mouse === */}
            <rect x="70" y="648" width="200" height="28" rx="4" fill="none" stroke="#3685c6" strokeWidth="1.5" opacity="0.45" />
            <rect x="78" y="654" width="12" height="6" rx="1" fill="#3685c6" opacity="0.3" />
            <rect x="96" y="654" width="12" height="6" rx="1" fill="#3685c6" opacity="0.3" />
            <rect x="114" y="654" width="12" height="6" rx="1" fill="#3685c6" opacity="0.3" />
            <rect x="132" y="654" width="44" height="6" rx="1" fill="#3685c6" opacity="0.3" />
            <rect x="182" y="654" width="12" height="6" rx="1" fill="#3685c6" opacity="0.3" />
            <rect x="200" y="654" width="12" height="6" rx="1" fill="#3685c6" opacity="0.3" />
            <rect x="78" y="664" width="180" height="6" rx="1" fill="#3685c6" opacity="0.2" />
            <rect x="286" y="644" width="34" height="46" rx="17" fill="none" stroke="#3685c6" strokeWidth="1.5" opacity="0.4" />
            <line x1="303" y1="644" x2="303" y2="666" stroke="#3685c6" strokeWidth="1" opacity="0.3" />

            {/* === BOTTOM-RIGHT: mini alert cards === */}
            <rect x="400" y="618" width="150" height="38" rx="6" fill="none" stroke="#f9c723" strokeWidth="1.5" opacity="0.4" />
            <rect x="410" y="628" width="8" height="8" rx="2" fill="#f9c723" opacity="0.45" />
            <rect x="424" y="629" width="60" height="4" rx="1" fill="#3685c6" opacity="0.35" />
            <rect x="424" y="637" width="40" height="4" rx="1" fill="#3685c6" opacity="0.25" />
            <rect x="400" y="664" width="150" height="38" rx="6" fill="none" stroke="#3685c6" strokeWidth="1.5" opacity="0.35" />
            <rect x="410" y="674" width="8" height="8" rx="2" fill="#3685c6" opacity="0.4" />
            <rect x="424" y="675" width="60" height="4" rx="1" fill="#3685c6" opacity="0.3" />
            <rect x="424" y="683" width="40" height="4" rx="1" fill="#3685c6" opacity="0.22" />

            {/* === scattered decorative dots === */}
            <circle cx="490" cy="300" r="3" fill="#f9c723" opacity="0.25" />
            <circle cx="520" cy="340" r="2" fill="#3685c6" opacity="0.22" />
            <circle cx="560" cy="280" r="3.5" fill="#3685c6" opacity="0.2" />
            <circle cx="30" cy="480" r="3" fill="#f9c723" opacity="0.2" />
            <circle cx="60" cy="560" r="2.5" fill="#3685c6" opacity="0.2" />
            <line x1="490" y1="300" x2="520" y2="340" stroke="#3685c6" strokeWidth="1" opacity="0.18" />
            <line x1="520" y1="340" x2="560" y2="280" stroke="#3685c6" strokeWidth="1" opacity="0.18" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-6">
            <img src={ABK_LOGO} alt="ABK" className="h-9" onError={(e) => { e.target.style.display = "none"; }} />
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "#ffffff",
              borderTop: "3px solid #f9c723",
              border: "1.5px solid #d0dde8",
              borderTopWidth: "3px",
              borderTopColor: "#f9c723",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {/* Secure access indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: "rgba(249,199,35,0.12)", border: "1px solid rgba(249,199,35,0.45)" }}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#8a6508" }}>
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8a6508" }}
                >
                  Secure Access
                </span>
              </div>
            </div>

            <h2
              className="text-3xl font-bold text-[#1a2540] mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
            >
              Sign in
            </h2>
            <p className="text-sm text-slate-500 mb-7">Access your operations dashboard</p>

            {infoMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2.5" strokeLinecap="round" d="M5 13l4 4L19 7" />
                </svg>
                {infoMessage}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="form-label">Username</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="form-label">Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-secondary w-full mt-6">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign in →"
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#eef2f7] text-center">
              <p className="text-sm text-slate-500">
                No account?{" "}
                <Link to="/signup" className="font-semibold transition-colors" style={{ color: "#3685c6" }}>
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
