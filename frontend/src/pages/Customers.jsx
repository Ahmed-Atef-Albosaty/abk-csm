import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AVATAR_COLORS = [
  { bg: "#e8f2fc", text: "#2268a5" },
  { bg: "#fef3c7", text: "#8a6508" },
  { bg: "#f0fdf4", text: "#15803d" },
  { bg: "#fdf4ff", text: "#7e22ce" },
  { bg: "#fff1f2", text: "#be123c" },
  { bg: "#ecfeff", text: "#0e7490" },
];
const getAvatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
import API from "../api/axios";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 8;

function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", NationalID: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Debounce search input → query
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch when query or page changes
  useEffect(() => {
    setLoading(true);
    API.get("/customer", { params: { page, limit: PAGE_SIZE, search: query } })
      .then(({ data }) => {
        setCustomers(data.customers);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load customers"))
      .finally(() => setLoading(false));
  }, [query, page]);

  // true only when we have no rows yet (initial/search reset) — page changes keep the table mounted
  const isInitialLoading = loading && customers.length === 0;

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/customer", form);
      setForm({ name: "", email: "", NationalID: "", phone: "" });
      setShowForm(false);
      setPage(1);
      setSearch("");
      setQuery("");
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to create customer", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="page-header-eyebrow">Directory</p>
              <h1 className="page-header-title">Customers</h1>
              <p className="page-header-sub">{total} total records</p>
            </div>
            <div className="flex items-start gap-5 shrink-0">
              {/* Page illustration */}
              <div className="hidden lg:block" aria-hidden="true">
                <svg width="160" height="106" viewBox="0 0 160 106" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="145" height="20" rx="10" fill="#e8f2fc" stroke="#c4d8ee" strokeWidth="1.5"/>
                  <circle cx="13" cy="10" r="4.5" fill="none" stroke="#3685c6" strokeWidth="2"/>
                  <line x1="16.5" y1="13.5" x2="20" y2="17" stroke="#3685c6" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="26" y="7" width="55" height="5" rx="2.5" fill="#c4d8ee"/>
                  <rect x="0" y="27" width="155" height="22" rx="6" fill="white" stroke="#e8f2fc" strokeWidth="1.5"/>
                  <circle cx="13" cy="38" r="8" fill="#3685c6"/>
                  <circle cx="13" cy="35" r="3.5" fill="rgba(255,255,255,0.8)"/>
                  <ellipse cx="13" cy="44" rx="5.5" ry="3.5" fill="rgba(255,255,255,0.5)"/>
                  <rect x="27" y="33" width="44" height="4" rx="2" fill="#1a2540" opacity="0.75"/>
                  <rect x="27" y="40" width="28" height="3" rx="1.5" fill="#c4d8ee"/>
                  <rect x="128" y="33" width="22" height="10" rx="5" fill="#e8f2fc"/>
                  <rect x="131" y="36" width="16" height="4" rx="2" fill="#3685c6" opacity="0.6"/>
                  <rect x="0" y="55" width="155" height="22" rx="6" fill="white" stroke="#e8f2fc" strokeWidth="1.5"/>
                  <circle cx="13" cy="66" r="8" fill="#f9c723"/>
                  <circle cx="13" cy="63" r="3.5" fill="rgba(255,255,255,0.8)"/>
                  <ellipse cx="13" cy="72" rx="5.5" ry="3.5" fill="rgba(255,255,255,0.5)"/>
                  <rect x="27" y="61" width="52" height="4" rx="2" fill="#1a2540" opacity="0.75"/>
                  <rect x="27" y="68" width="32" height="3" rx="1.5" fill="#c4d8ee"/>
                  <rect x="128" y="61" width="22" height="10" rx="5" fill="#f0fdf4"/>
                  <rect x="131" y="64" width="16" height="4" rx="2" fill="#16a34a" opacity="0.65"/>
                  <rect x="0" y="83" width="155" height="22" rx="6" fill="white" stroke="#e8f2fc" strokeWidth="1.5"/>
                  <circle cx="13" cy="94" r="8" fill="#1a3f7a"/>
                  <circle cx="13" cy="91" r="3.5" fill="rgba(255,255,255,0.8)"/>
                  <ellipse cx="13" cy="100" rx="5.5" ry="3.5" fill="rgba(255,255,255,0.4)"/>
                  <rect x="27" y="89" width="46" height="4" rx="2" fill="#1a2540" opacity="0.75"/>
                  <rect x="27" y="96" width="30" height="3" rx="1.5" fill="#c4d8ee"/>
                  <rect x="128" y="89" width="22" height="10" rx="5" fill="#fef3c7"/>
                  <rect x="131" y="92" width="16" height="4" rx="2" fill="#b8860b" opacity="0.65"/>
                </svg>
              </div>
              <button onClick={() => setShowForm(!showForm)} className="btn-gold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
                New Customer
              </button>
            </div>
          </div>
          <div className="page-header-rule" />
        </motion.div>

        {/* Create form — two-tone */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 section-card overflow-hidden form-gradient-card"
            style={{ background: "linear-gradient(160deg, #2d6aaa 0%, #253660 100%)" }}
          >
            <div className="px-6 py-4 flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0 text-[#f9c723]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="1.8" strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <h3 className="text-base font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>New Customer</h3>
            </div>
            <div className="px-6 pb-6">
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[["name","Full name"],["email","Email"],["NationalID","National ID"],["phone","Phone"]].map(([field, label]) => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <label className="form-label">{label}</label>
                    <input
                      required
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="form-input"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="cancel-btn px-4 py-2.5 text-sm text-white/70 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-gold">
                    {submitting ? "Saving…" : "Create customer"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" /><path strokeWidth="2" strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or ID…"
            className="form-input pl-9"
          />
        </div>

        {/* Table */}
        {isInitialLoading ? (
          <p className="text-base text-slate-500 py-10 text-center">Loading customers…</p>
        ) : error ? (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-base">{error}</div>
        ) : (
          <div className="section-card overflow-hidden table-gradient-card">
            <div className="overflow-x-auto" style={{ opacity: loading ? 0.55 : 1, transition: "opacity 0.18s" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className="hidden sm:table-cell">Email</th>
                    <th className="hidden md:table-cell">Phone</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-slate-500 py-10 text-base">No customers found.</td></tr>
                  ) : customers.map((c, i) => (
                    <motion.tr
                      key={c._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="row-avatar shrink-0"
                            style={{ background: "rgba(255,255,255,0.18)", color: "#ffffff", border: "1.5px solid rgba(255,255,255,0.30)" }}>
                            {c.name?.[0]?.toUpperCase() ?? "?"}
                          </span>
                          <div>
                            <p className="font-semibold text-sm">{c.name}</p>
                            <p className="text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.55)" }}>{c.NationalID}</p>
                          </div>
                        </div>
                      </td>
                      <td className="td-secondary hidden sm:table-cell text-sm">{c.email}</td>
                      <td className="td-secondary hidden md:table-cell text-sm">{c.phone}</td>
                      <td><StatusBadge value={c.status} /></td>
                      <td className="text-right">
                        <button
                          onClick={() => navigate(`/customers/${c._id}`)}
                          className="row-action inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3685c6] bg-[#e8f2fc] hover:bg-[#3685c6] hover:text-white transition-all duration-150"
                        >
                          View
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeWidth="2.5" strokeLinecap="round" d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} limit={PAGE_SIZE} onPageChange={setPage} />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Customers;
