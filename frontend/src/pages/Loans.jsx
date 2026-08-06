import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axios";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";
import Pagination from "../components/Pagination";

const FREQUENCIES = [
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "semiAnnually", label: "Semi-Annually" },
  { value: "Yearly", label: "Yearly" },
];

const SEARCH_MODES = [
  { value: "name", label: "By Name" },
  { value: "customerId", label: "By Customer ID" },
  { value: "loanId", label: "By Loan ID" },
];

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  customerId: "",
  accountId: "",
  principal: "",
  annualInterestRate: "",
  termMonths: "",
  frequency: "Monthly",
  disburseNow: false,
};

function formatMoney(n) {
  return `EGP ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function frequencyLabel(value) {
  return FREQUENCIES.find((f) => f.value === value)?.label || value;
}

function Loans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [customers, setCustomers] = useState([]);
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [previewData, setPreviewData] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [creating, setCreating] = useState(false);

  const [searchBy, setSearchBy] = useState("name");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loans, setLoans] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [toast, setToast] = useState(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when switching search mode
  useEffect(() => { setPage(1); }, [searchBy]);

  // Fetch loans
  useEffect(() => {
    setLoading(true);
    API.get("/loan", { params: { page, limit: PAGE_SIZE, search: query, searchBy } })
      .then(({ data }) => {
        setLoans(data.loans);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load loans"))
      .finally(() => setLoading(false));
  }, [query, page, searchBy]);

  const isInitialLoading = loading && loans.length === 0;

  const openForm = () => {
    setShowForm(true);
    if (customers.length) return;
    setLoadingCustomers(true);
    API.get("/customer", { params: { limit: 500 } })
      .then(({ data }) => setCustomers(data.customers))
      .finally(() => setLoadingCustomers(false));
  };

  const updateField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setPreviewData(null);
    setPreviewError("");
  };

  const handleCustomerChange = async (customerId) => {
    updateField("customerId", customerId);
    setForm((f) => ({ ...f, accountId: "" }));
    setCustomerAccounts([]);
    if (!customerId) return;
    const { data } = await API.get(`/customer/${customerId}`);
    setCustomerAccounts(data.accounts || []);
  };

  // Deep-link support: /loans?customerId=... opens the form pre-selected for that customer
  useEffect(() => {
    const customerId = searchParams.get("customerId");
    if (!customerId) return;
    openForm();
    handleCustomerChange(customerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreview = async (e) => {
    e.preventDefault();
    setPreviewing(true);
    setPreviewError("");
    setPreviewData(null);
    try {
      const { data } = await API.post("/loan/preview", {
        principal: Number(form.principal),
        annualInterestRate: Number(form.annualInterestRate),
        termMonths: Number(form.termMonths),
        frequency: form.frequency,
      });
      setPreviewData(data.amortizationSchedule);
    } catch (err) {
      setPreviewError(err.response?.data?.message || "Failed to calculate loan");
    } finally {
      setPreviewing(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await API.post("/loan/", {
        customerId: form.customerId,
        accountId: form.accountId,
        principal: Number(form.principal),
        annualInterestRate: Number(form.annualInterestRate),
        termMonths: Number(form.termMonths),
        frequency: form.frequency,
        disburseNow: form.disburseNow,
      });
      setToast({ message: "Loan created successfully", type: "success" });
      setShowForm(false);
      setForm(EMPTY_FORM);
      setCustomerAccounts([]);
      setPreviewData(null);
      setPage(1);
      setSearch("");
      setQuery("");
      const { data } = await API.get("/loan", { params: { page: 1, limit: PAGE_SIZE, search: "", searchBy } });
      setLoans(data.loans);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to create loan", type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const inputCls = "form-input";

  return (
    <Layout>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="page-header-eyebrow">Lending</p>
              <h1 className="page-header-title">Loans</h1>
              <p className="page-header-sub">{total} loans on record</p>
            </div>
            <button onClick={() => (showForm ? setShowForm(false) : openForm())} className="btn-gold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
              New Loan
            </button>
          </div>
          <div className="page-header-rule" />
        </motion.div>

        {/* Create form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 section-card overflow-hidden form-gradient-card"
            style={{ background: "linear-gradient(160deg, #2d6aaa 0%, #253660 100%)" }}
          >
            <div className="px-6 py-4 flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0 text-[#f9c723]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="1.8" strokeLinecap="round" d="M12 8v8m-3-5h6M5 21V9a2 2 0 012-2h1.5L12 3l3.5 4H17a2 2 0 012 2v12" />
              </svg>
              <h3 className="text-base font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                New Loan
              </h3>
            </div>
            <div className="px-6 pb-6">
              <form onSubmit={handlePreview} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="form-label">Account</label>
                  <select
                    required
                    value={form.accountId}
                    onChange={(e) => updateField("accountId", e.target.value)}
                    disabled={!form.customerId || customerAccounts.length === 0}
                    className={`${inputCls} disabled:opacity-50`}
                  >
                    <option value="">{form.customerId && customerAccounts.length === 0 ? "No accounts" : "Select an account"}</option>
                    {customerAccounts.map((a) => (
                      <option key={a._id} value={a._id}>{a.Acc_number} (EGP {a.balance.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="form-label">Principal (EGP)</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.principal}
                    onChange={(e) => updateField("principal", e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="form-label">Annual Interest Rate (%)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.annualInterestRate}
                    onChange={(e) => updateField("annualInterestRate", e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="form-label">Term (months)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.termMonths}
                    onChange={(e) => updateField("termMonths", e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="form-label">Payment Frequency</label>
                  <select value={form.frequency} onChange={(e) => updateField("frequency", e.target.value)} className={inputCls}>
                    {FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2.5">
                  <input
                    id="disburseNow"
                    type="checkbox"
                    checked={form.disburseNow}
                    onChange={(e) => updateField("disburseNow", e.target.checked)}
                    className="w-4 h-4 rounded accent-[#f9c723]"
                  />
                  <label htmlFor="disburseNow" className="text-sm" style={{ color: "rgba(255,255,255,0.88)" }}>
                    Disburse funds into the account immediately
                  </label>
                </div>

                <div className="sm:col-span-2 flex gap-3 justify-end actions-row">
                  <button type="button" onClick={() => setShowForm(false)} className="cancel-btn px-4 py-2.5 text-sm text-white/70 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={previewing} className="btn-gold">
                    {previewing ? "Calculating…" : "Calculate"}
                  </button>
                </div>
              </form>

              {previewError && (
                <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {previewError}
                </div>
              )}

              {previewData && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)" }}
                >
                  <div className="px-5 py-4 flex flex-wrap gap-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/50">Installment</p>
                      <p className="text-lg font-semibold text-white">{formatMoney(previewData.installmentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/50">Total Interest</p>
                      <p className="text-lg font-semibold text-white">{formatMoney(previewData.totalInterest)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/50">Total Repayment</p>
                      <p className="text-lg font-semibold text-white">{formatMoney(previewData.totalRepayment)}</p>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Payment</th>
                          <th>Interest</th>
                          <th>Principal</th>
                          <th>Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.schedule.map((row) => (
                          <tr key={row.installmentNumber}>
                            <td>{row.installmentNumber}</td>
                            <td>{formatMoney(row.payment)}</td>
                            <td>{formatMoney(row.interestComponent)}</td>
                            <td>{formatMoney(row.principalComponent)}</td>
                            <td>{formatMoney(row.remainingBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-4 flex justify-end">
                    <button onClick={handleCreate} disabled={creating} className="btn-gold">
                      {creating ? "Creating…" : "Confirm & Create Loan"}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Search */}
        <div className="mb-5 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {SEARCH_MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setSearchBy(m.value)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                style={searchBy === m.value
                  ? { background: "#f9c723", color: "#1a2540", boxShadow: "0 2px 8px rgba(249,199,35,0.35)" }
                  : { background: "#ffffff", border: "1.5px solid #e2eaf4", color: "#64748b" }
                }
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" /><path strokeWidth="2" strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                searchBy === "name" ? "Search by customer name…"
                  : searchBy === "customerId" ? "Enter customer ID…"
                  : "Enter loan ID…"
              }
              className="form-input pl-9"
            />
          </div>
        </div>

        {isInitialLoading ? (
          <p className="text-base text-slate-500 py-10 text-center">Loading loans…</p>
        ) : error ? (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-base">{error}</div>
        ) : (
          <div className="section-card overflow-hidden table-gradient-card">
            <div className="overflow-x-auto" style={{ opacity: loading ? 0.55 : 1, transition: "opacity 0.18s" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Customer</th>
                    <th className="hidden sm:table-cell">Account</th>
                    <th>Principal</th>
                    <th className="hidden md:table-cell">Rate</th>
                    <th className="hidden md:table-cell">Frequency</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loans.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-slate-500 py-10 text-base">No loans found.</td></tr>
                  ) : loans.map((loan, i) => (
                    <motion.tr key={loan._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                      <td className="td-secondary font-mono text-xs">{loan._id.slice(-8)}</td>
                      <td className="font-medium">{loan.customerId?.name || String(loan.customerId).slice(-8)}</td>
                      <td className="hidden sm:table-cell td-secondary text-sm">{loan.accountId?.Acc_number || String(loan.accountId).slice(-8)}</td>
                      <td className="font-medium">{formatMoney(loan.principal)}</td>
                      <td className="hidden md:table-cell td-secondary text-sm">{loan.annualInterestRate}%</td>
                      <td className="hidden md:table-cell td-secondary text-sm">{frequencyLabel(loan.frequency)}</td>
                      <td><StatusBadge value={loan.status} /></td>
                      <td className="text-right">
                        <button
                          onClick={() => navigate(`/loans/${loan._id}`)}
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

export default Loans;
