import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axios";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";
import Pagination from "../components/Pagination";

const STATUSES = ["All", "New", "InProgress", "Escalated", "Resolved"];
const PRIORITIES = ["All", "Low", "Medium", "High"];
const TYPES = ["Complaint", "AccountFreeze", "InfoUpdate", "CardIssue"];
const PAGE_SIZE = 8;

function ServiceRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerId: "", accountId: "", type: "Complaint", description: "", priority: "Medium", agentId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [agents, setAgents] = useState([]);
  const [toast, setToast] = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [statusFilter, priorityFilter]);

  // Fetch requests
  useEffect(() => {
    setLoading(true);
    API.get("/service-requests", {
      params: { page, limit: PAGE_SIZE, status: statusFilter, priority: priorityFilter, search: query },
    })
      .then(({ data }) => {
        setRequests(data.serviceRequests);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load requests"))
      .finally(() => setLoading(false));
  }, [query, page, statusFilter, priorityFilter]);

  const isInitialLoading = loading && requests.length === 0;

  const openForm = () => {
    setShowForm(true);
    if (customers.length) return;
    setLoadingCustomers(true);
    Promise.all([
      API.get("/customer", { params: { limit: 500 } }),
      API.get("/agents"),
    ])
      .then(([cRes, aRes]) => {
        setCustomers(cRes.data.customers);
        setAgents(aRes.data);
      })
      .finally(() => setLoadingCustomers(false));
  };

  const handleCustomerChange = async (customerId) => {
    setForm((f) => ({ ...f, customerId, accountId: "" }));
    setCustomerAccounts([]);
    if (!customerId) return;
    const { data } = await API.get(`/customer/${customerId}`);
    setCustomerAccounts(data.accounts || []);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await API.post("/service-requests", form);
      setRequests((prev) => [data.serviceRequest, ...prev]);
      setShowForm(false);
      setForm({ customerId: "", accountId: "", type: "Complaint", description: "", priority: "Medium", agentId: "" });
      setCustomerAccounts([]);
      setTotal((t) => t + 1);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to create request", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (type, value) => {
    if (type === "status") setStatusFilter(value);
    else setPriorityFilter(value);
  };

  const inputCls = "form-input";

  return (
    <Layout>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="page-header-eyebrow">Operations</p>
              <h1 className="page-header-title">Service Requests</h1>
              <p className="page-header-sub">{total} requests</p>
            </div>
            <div className="flex items-start gap-5 shrink-0">
              {/* Page illustration */}
              <div className="hidden lg:block" aria-hidden="true">
                <svg width="148" height="106" viewBox="0 0 148 106" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="14" width="96" height="90" rx="8" fill="white" stroke="#dde8f0" strokeWidth="1.5"/>
                  <rect x="8" y="14" width="96" height="20" rx="8" fill="#e8f2fc"/>
                  <rect x="8" y="24" width="96" height="10" fill="#e8f2fc"/>
                  <rect x="38" y="7" width="36" height="14" rx="5" fill="#1a3f7a"/>
                  <rect x="44" y="10" width="24" height="5" rx="2.5" fill="#2268a5"/>
                  <circle cx="24" cy="48" r="7" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5"/>
                  <path d="M20.5 48l2.5 2.5 4.5-4.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <rect x="36" y="44" width="42" height="4" rx="2" fill="#1a2540" opacity="0.7"/>
                  <rect x="36" y="51" width="26" height="3" rx="1.5" fill="#c4d8ee"/>
                  <rect x="84" y="43" width="14" height="10" rx="4" fill="#dcfce7"/>
                  <rect x="86" y="46" width="10" height="4" rx="2" fill="#16a34a" opacity="0.6"/>
                  <circle cx="24" cy="68" r="7" fill="#fef3c7" stroke="#f9c723" strokeWidth="1.5"/>
                  <circle cx="24" cy="68" r="3" fill="#f9c723"/>
                  <rect x="36" y="64" width="36" height="4" rx="2" fill="#1a2540" opacity="0.7"/>
                  <rect x="36" y="71" width="20" height="3" rx="1.5" fill="#c4d8ee"/>
                  <rect x="84" y="63" width="14" height="10" rx="4" fill="#fef3c7"/>
                  <rect x="86" y="66" width="10" height="4" rx="2" fill="#b8860b" opacity="0.6"/>
                  <circle cx="24" cy="88" r="7" fill="#e8f2fc" stroke="#3685c6" strokeWidth="1.5"/>
                  <circle cx="24" cy="88" r="3" fill="#3685c6" opacity="0.4"/>
                  <rect x="36" y="84" width="48" height="4" rx="2" fill="#1a2540" opacity="0.7"/>
                  <rect x="36" y="91" width="32" height="3" rx="1.5" fill="#c4d8ee"/>
                  <rect x="84" y="83" width="14" height="10" rx="4" fill="#e8f2fc"/>
                  <rect x="86" y="86" width="10" height="4" rx="2" fill="#3685c6" opacity="0.6"/>
                  <rect x="112" y="6" width="36" height="22" rx="7" fill="#1a3f7a"/>
                  <rect x="112" y="6" width="36" height="7" rx="3.5" fill="#f9c723"/>
                  <rect x="112" y="9" width="36" height="4" fill="#f9c723"/>
                  <rect x="117" y="19" width="26" height="5" rx="2" fill="rgba(255,255,255,0.65)"/>
                  <rect x="114" y="36" width="34" height="26" rx="7" fill="#e8f2fc" stroke="#c4d8ee" strokeWidth="1.5"/>
                  <rect x="119" y="43" width="14" height="3" rx="1.5" fill="#3685c6" opacity="0.5"/>
                  <rect x="119" y="50" width="22" height="5" rx="2" fill="#3685c6"/>
                  <rect x="116" y="70" width="32" height="22" rx="6" fill="white" stroke="#dde8f0" strokeWidth="1.5"/>
                  <rect x="121" y="76" width="22" height="3" rx="1.5" fill="#c4d8ee"/>
                  <rect x="121" y="83" width="14" height="3" rx="1.5" fill="#e8f2fc"/>
                </svg>
              </div>
              <button onClick={() => showForm ? setShowForm(false) : openForm()} className="btn-gold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
                New Request
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
                <path strokeWidth="1.8" strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <h3 className="text-base font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>New Service Request</h3>
            </div>
            <div className="px-6 pb-6">
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="form-label">Customer</label>
                <select
                  required
                  value={form.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className={inputCls}
                >
                  <option value="">{loadingCustomers ? "Loading…" : "Select a customer"}</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="form-label">Account (optional)</label>
                <select
                  value={form.accountId}
                  onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                  disabled={!form.customerId || customerAccounts.length === 0}
                  className={`${inputCls} disabled:opacity-50`}
                >
                  <option value="">{form.customerId && customerAccounts.length === 0 ? "No accounts" : "Select an account"}</option>
                  {customerAccounts.map((a) => (
                    <option key={a._id} value={a._id}>{a.Acc_number} (${a.balance.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="form-label">Assigned Agent</label>
                <select
                  required
                  value={form.agentId}
                  onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Select an agent</option>
                  {agents.map((a) => (
                    <option key={a._id} value={a._id}>{a.name} ({a.role})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="form-label">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="form-label">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputCls}>
                  {["Low","Medium","High"].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="form-label">Description</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn px-4 py-2.5 text-sm text-white/70 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-gold">
                  {submitting ? "Saving…" : "Create request"}
                </button>
              </div>
            </form>
            </div>
          </motion.div>
        )}

        {/* Search + Filters */}
        <div className="mb-5 space-y-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" /><path strokeWidth="2" strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by type or description…"
              className="form-input pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-5">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleFilterChange("status", s)}
                    className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                    style={statusFilter === s
                      ? { background: "#f9c723", color: "#1a2540", boxShadow: "0 2px 8px rgba(249,199,35,0.35)" }
                      : { background: "#ffffff", border: "1.5px solid #e2eaf4", color: "#64748b" }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Priority</p>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleFilterChange("priority", p)}
                    className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                    style={priorityFilter === p
                      ? { background: "#f9c723", color: "#1a2540", boxShadow: "0 2px 8px rgba(249,199,35,0.35)" }
                      : { background: "#ffffff", border: "1.5px solid #e2eaf4", color: "#64748b" }
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isInitialLoading ? (
          <p className="text-base text-slate-500 py-10 text-center">Loading requests…</p>
        ) : error ? (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-base">{error}</div>
        ) : (
          <div className="section-card overflow-hidden table-gradient-card">
            <div className="overflow-x-auto" style={{ opacity: loading ? 0.55 : 1, transition: "opacity 0.18s" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Customer</th>
                    <th className="hidden sm:table-cell">Customer ID</th>
                    <th className="hidden md:table-cell">Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-slate-500 py-10 text-base">No requests match the selected filters.</td></tr>
                  ) : requests.map((req, i) => (
                    <motion.tr
                      key={req._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <td className="font-medium">{req.type}</td>
                      <td><StatusBadge value={req.priority} /></td>
                      <td><StatusBadge value={req.status} /></td>
                      <td className="font-medium">{req.customerId?.name || ""}</td>
                      <td className="hidden sm:table-cell td-secondary font-mono text-xs">{String(req.customerId?._id || req.customerId).slice(-8)}</td>
                      <td className="hidden md:table-cell td-secondary text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="text-right">
                        <button
                          onClick={() => navigate(`/service-requests/${req._id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
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

export default ServiceRequests;
