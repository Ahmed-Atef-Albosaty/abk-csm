import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../api/axios";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";

function exportCustomerPDF(customer, accounts, serviceRequests) {
  const doc = new jsPDF();
  const blue = [21, 116, 196];
  const gold = [250, 178, 11];
  const dark = [15, 30, 60];

  doc.setFillColor(...blue);
  doc.rect(0, 0, 210, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("AL AHLI BANK OF KUWAIT - Customer Report", 14, 12);

  doc.setFillColor(...gold);
  doc.rect(0, 18, 210, 2, "F");

  doc.setTextColor(...dark);
  doc.setFontSize(18);
  const safeName = customer.name.replace(/[^\x00-\x7F]/g, "?");
  doc.text(safeName, 14, 34);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`, 14, 40);

  doc.setFontSize(10);
  doc.setTextColor(...dark);
  const info = [
    ["Email", customer.email],
    ["Phone", customer.phone],
    ["National ID", customer.NationalID],
    ["Status", customer.status],
  ];
  info.forEach(([label, value], i) => {
    const x = i % 2 === 0 ? 14 : 110;
    const y = 52 + Math.floor(i / 2) * 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    doc.text(String(value), x, y + 5);
  });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...blue);
  doc.setFontSize(11);
  doc.text("Accounts", 14, 80);
  autoTable(doc, {
    startY: 84,
    head: [["Account Number", "Balance", "Status"]],
    body: accounts.map((a) => [a.Acc_number, `EGP ${a.balance.toLocaleString()}`, a.status]),
    headStyles: { fillColor: blue, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [237, 242, 255] },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 14, right: 14 },
  });

  const afterAccounts = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...blue);
  doc.setFontSize(11);
  doc.text("Service Requests", 14, afterAccounts);
  autoTable(doc, {
    startY: afterAccounts + 4,
    head: [["Type", "Priority", "Status", "Created"]],
    body: serviceRequests.map((sr) => [sr.type, sr.priority, sr.status, new Date(sr.createdAt).toLocaleDateString("en-GB")]),
    headStyles: { fillColor: blue, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [237, 242, 255] },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 14, right: 14 },
  });

  const pageH = doc.internal.pageSize.height;
  doc.setFillColor(...gold);
  doc.rect(0, pageH - 8, 210, 8, "F");

  doc.save(`customer-${customer.name.replace(/\s+/g, "-")}.pdf`);
}

function exportTransactionsPDF(account, txList, customerName) {
  const doc = new jsPDF();
  const blue = [21, 116, 196];
  const gold = [250, 178, 11];
  const dark = [15, 30, 60];

  doc.setFillColor(...blue);
  doc.rect(0, 0, 210, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("AL AHLI BANK OF KUWAIT - Transaction Statement", 14, 12);

  doc.setFillColor(...gold);
  doc.rect(0, 18, 210, 2, "F");

  doc.setTextColor(...dark);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Account: ${account.Acc_number}`, 14, 34);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`, 14, 40);

  const meta = [
    ["Current Balance", `EGP ${account.balance.toLocaleString()}`],
    ["Account Status", account.status],
    ["Total Transactions", String(txList.length)],
  ];
  meta.forEach(([label, value], i) => {
    const x = 14 + i * 65;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(label.toUpperCase(), x, 52);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    doc.setFontSize(10);
    doc.text(value, x, 58);
  });

  autoTable(doc, {
    startY: 68,
    head: [["#", "Date & Time", "Type", "Amount", "Balance After"]],
    body: txList.map((tx, i) => [
      i + 1,
      new Date(tx.time_stamp).toLocaleString("en-GB"),
      tx.Transaction_type,
      (tx.Transaction_type === "Deposit" ? "+" : "-") + `EGP ${tx.Transaction_Amount.toLocaleString()}`,
      `EGP ${tx.balanceAfter.toLocaleString()}`,
    ]),
    headStyles: { fillColor: blue, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [237, 242, 255] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 42 },
      2: { cellWidth: 26 },
      3: { cellWidth: 30 },
      4: { cellWidth: "auto" },
    },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });

  const pageH = doc.internal.pageSize.height;
  doc.setFillColor(...gold);
  doc.rect(0, pageH - 8, 210, 8, "F");

  doc.save(`transactions-${account.Acc_number}.pdf`);
}

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [expandedAccount, setExpandedAccount] = useState(null);
  const [transactions, setTransactions] = useState({});
  const [txMeta, setTxMeta] = useState({});
  const [txPage, setTxPage] = useState({});
  const [txLoading, setTxLoading] = useState({});
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [newAccNumber, setNewAccNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const TX_PAGE_SIZE = 8;
  const [txModal, setTxModal] = useState({ open: false, accountId: null, type: null });
  const [txAmount, setTxAmount] = useState("");
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txError, setTxError] = useState("");
  const [toast, setToast] = useState(null);
  const [confirmStatusToggle, setConfirmStatusToggle] = useState(false);

  useEffect(() => {
    API.get(`/customer/${id}`)
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || "Customer not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchTxPage = async (accountId, page) => {
    setTxLoading((p) => ({ ...p, [accountId]: true }));
    try {
      const { data } = await API.get(`/transactions/${accountId}/transactions`, {
        params: { page, limit: TX_PAGE_SIZE },
      });
      setTransactions((p) => ({ ...p, [accountId]: data.transactions }));
      setTxMeta((p) => ({ ...p, [accountId]: { total: data.total, totalPages: data.totalPages } }));
      setTxPage((p) => ({ ...p, [accountId]: page }));
    } catch {
      setTransactions((p) => ({ ...p, [accountId]: [] }));
    } finally {
      setTxLoading((p) => ({ ...p, [accountId]: false }));
    }
  };

  const toggleTransactions = async (accountId) => {
    if (expandedAccount === accountId) {
      setExpandedAccount(null);
      return;
    }
    setExpandedAccount(accountId);
    if (!transactions[accountId]) await fetchTxPage(accountId, 1);
  };

  const openTxModal = (accountId, type) => {
    setTxModal({ open: true, accountId, type });
    setTxAmount("");
    setTxError("");
  };

  const closeTxModal = () => {
    if (txSubmitting) return;
    setTxModal({ open: false, accountId: null, type: null });
    setTxAmount("");
    setTxError("");
  };

  const confirmTransaction = async () => {
    const amount = parseFloat(txAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      setTxError("Please enter a valid amount greater than 0.");
      return;
    }
    setTxSubmitting(true);
    try {
      await API.post(`/transactions/${txModal.accountId}/${txModal.type}`, { amount, performedBy: "agent" });
      const { data: refreshed } = await API.get(`/customer/${id}`);
      setData(refreshed);
      setTransactions((p) => ({ ...p, [txModal.accountId]: undefined }));
      setTxMeta((p) => ({ ...p, [txModal.accountId]: undefined }));
      setExpandedAccount(null);
      closeTxModal();
    } catch (err) {
      setTxError(err.response?.data?.message || "Transaction failed");
    } finally {
      setTxSubmitting(false);
    }
  };

  const exportAccountTransactions = async (account) => {
    try {
      const { data: res } = await API.get(`/transactions/${account._id}/transactions`);
      exportTransactionsPDF(account, res.transactions, data.customer.name);
    } catch {
      setToast({ message: "Failed to load transactions for export", type: "error" });
    }
  };

  const createAccount = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post(`/customer/${id}/accounts`, { Acc_number: newAccNumber });
      setData((p) => ({ ...p, accounts: [...p.accounts, data.account] }));
      setShowCreateAccount(false);
      setNewAccNumber("");
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to create account", type: "error" });
    }
  };

  const toggleStatus = async () => {
    const next = data.customer.status === "Active" ? "Blocked" : "Active";
    try {
      await API.patch(`/customer/${id}`, { status: next });
      setData((p) => ({ ...p, customer: { ...p.customer, status: next } }));
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to update status", type: "error" });
    } finally {
      setConfirmStatusToggle(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1200px] mx-auto">
        <div className="section-card p-10 text-center text-base text-slate-500">Loading customer…</div>
      </div>
    </Layout>
  );
  if (error) return (
    <Layout>
      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1200px] mx-auto">
        <div className="section-card p-10 text-center text-base text-red-500">{error}</div>
      </div>
    </Layout>
  );

  const { customer, accounts, serviceRequests } = data;
  const isDeposit = txModal.type === "deposit";

  return (
    <Layout>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <ConfirmModal
        open={confirmStatusToggle}
        title={customer.status === "Active" ? "Block customer" : "Unblock customer"}
        message={
          customer.status === "Active"
            ? `Block ${customer.name}? They will lose access until unblocked.`
            : `Unblock ${customer.name}? This restores their account access.`
        }
        confirmLabel={customer.status === "Active" ? "Block" : "Unblock"}
        danger={customer.status === "Active"}
        onConfirm={toggleStatus}
        onCancel={() => setConfirmStatusToggle(false)}
      />
      {/* Transaction Modal */}
      <AnimatePresence>
        {txModal.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTxModal}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-card rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                {/* Modal header */}
                <div className={`px-6 py-4 border-b border-[#dde6f0] flex items-center gap-3 ${isDeposit ? "bg-green-50" : "bg-amber-50"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDeposit ? "bg-green-100" : "bg-amber-100"}`}>
                    <svg className={`w-4 h-4 ${isDeposit ? "text-green-600" : "text-amber-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isDeposit
                        ? <path strokeWidth="2" strokeLinecap="round" d="M12 4v16m8-8H4" />
                        : <path strokeWidth="2" strokeLinecap="round" d="M20 12H4" />}
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1a2540]">
                      {isDeposit ? "Deposit Funds" : "Withdraw Funds"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {accounts.find((a) => a._id === txModal.accountId)?.Acc_number}
                    </p>
                  </div>
                </div>

                {/* Modal body */}
                <div className="px-6 py-5">
                  <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base font-medium">EGP</span>
                    <input
                      autoFocus
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={txAmount}
                      onChange={(e) => { setTxAmount(e.target.value); setTxError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && confirmTransaction()}
                      placeholder="0.00"
                      className="form-input pl-12"
                    />
                  </div>
                  {txError && (
                    <p className="mt-2 text-sm text-red-500">{txError}</p>
                  )}
                </div>

                {/* Modal footer */}
                <div className="px-6 pb-5 flex gap-2 justify-end">
                  <button
                    onClick={closeTxModal}
                    disabled={txSubmitting}
                    className="px-4 py-2.5 text-base text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmTransaction}
                    disabled={txSubmitting || !txAmount}
                    className={`px-4 py-2.5 text-base font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                      isDeposit ? "bg-green-600 hover:bg-green-700" : "bg-amber-500 hover:bg-amber-600"
                    }`}
                  >
                    {txSubmitting ? "Processing…" : isDeposit ? "Deposit" : "Withdraw"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <button
            onClick={() => navigate("/customers")}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#3685c6] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Customers
          </button>
          <div className="hidden lg:block" aria-hidden="true">
            <svg width="200" height="72" viewBox="0 0 200 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="88" height="68" rx="10" fill="#1a3f7a"/>
              <rect x="0" y="0" width="88" height="4" rx="2" fill="#f9c723"/>
              <circle cx="22" cy="30" r="16" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <circle cx="22" cy="25" r="7" fill="rgba(255,255,255,0.78)"/>
              <ellipse cx="22" cy="40" rx="10" ry="6.5" fill="rgba(255,255,255,0.38)"/>
              <rect x="46" y="14" width="36" height="6" rx="3" fill="rgba(255,255,255,0.88)"/>
              <rect x="46" y="24" width="26" height="4" rx="2" fill="rgba(255,255,255,0.45)"/>
              <rect x="46" y="34" width="34" height="12" rx="6" fill="#f9c723"/>
              <rect x="52" y="37" width="22" height="6" rx="3" fill="#1a2540" opacity="0.45"/>
              <rect x="8" y="54" width="62" height="7" rx="2" fill="rgba(255,255,255,0.12)"/>
              <rect x="10" y="56" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.45)"/>
              <rect x="28" y="56" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.45)"/>
              <rect x="46" y="56" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.45)"/>
              <rect x="10" y="4" width="200" height="36" rx="8" fill="#3685c6" style={{transform: "translateX(96px) translateY(24px)"}}/>
              <rect x="106" y="28" width="90" height="36" rx="8" fill="#3685c6"/>
              <rect x="106" y="28" width="90" height="36" rx="8" fill="url(#cg)"/>
              <circle cx="124" cy="38" r="7" fill="#f9c723" opacity="0.65"/>
              <circle cx="132" cy="38" r="7" fill="#f9c723" opacity="0.38"/>
              <rect x="146" y="34" width="40" height="4" rx="2" fill="rgba(255,255,255,0.55)"/>
              <rect x="146" y="42" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.35)"/>
              <rect x="110" y="52" width="50" height="7" rx="2" fill="rgba(255,255,255,0.12)"/>
              <rect x="112" y="54" width="22" height="3" rx="1.5" fill="rgba(255,255,255,0.6)"/>
            </svg>
          </div>
          <button
            onClick={() => exportCustomerPDF(customer, accounts, serviceRequests)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#dde6f0] hover:border-[#3685c6] text-[#3685c6] text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Export PDF
          </button>
        </div>

        {/* Customer header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="detail-card rounded-xl p-7 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-semibold text-2xl shrink-0" style={{ background: "rgba(255,255,255,0.18)", color: "#ffffff", border: "2px solid rgba(255,255,255,0.30)" }}>
                {customer.name[0].toUpperCase()}
              </div>
              <div className="border-l-[3px] border-[#f9c723] pl-3">
                <h1 className="text-3xl font-bold">{customer.name}</h1>
                <p className="text-base detail-muted">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge value={customer.status} />
              <button
                onClick={() => setConfirmStatusToggle(true)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  customer.status === "Active"
                    ? "bg-red-500/20 text-red-200 hover:bg-red-500/30"
                    : "bg-green-500/20 text-green-200 hover:bg-green-500/30"
                }`}
              >
                {customer.status === "Active" ? "Block" : "Unblock"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t detail-divider">
            {[["Phone", customer.phone], ["National ID", customer.NationalID], ["Accounts", accounts.length]].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs detail-muted uppercase tracking-wide">{label}</p>
                <p className="text-base font-medium font-mono mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 p-1 mb-5 w-fit shadow-sm">
          {["accounts", "service-requests"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2 text-base font-medium rounded-md transition-colors ${
                activeTab === tab ? "text-[#3685c6]" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              {activeTab === tab && (
                <motion.span layoutId="tabBg" className="absolute inset-0 bg-[#e8f2fc] rounded-md" style={{ zIndex: -1 }} />
              )}
              {tab === "accounts" ? `Accounts (${accounts.length})` : `Service Requests (${serviceRequests.length})`}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "accounts" && (
            <motion.div key="accounts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCreateAccount(!showCreateAccount)}
                  className="btn-primary"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14" />
                  </svg>
                  New account
                </button>
              </div>
              {showCreateAccount && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  onSubmit={createAccount}
                  className="detail-card rounded-xl p-4 flex items-end gap-3 overflow-hidden"
                >
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="form-label">Account Number</label>
                    <input
                      required
                      value={newAccNumber}
                      onChange={(e) => setNewAccNumber(e.target.value)}
                      placeholder="e.g. ACC-003"
                      className="form-input"
                    />
                  </div>
                  <button type="submit" className="btn-primary">Create</button>
                  <button type="button" onClick={() => setShowCreateAccount(false)} className="px-3 py-3 text-base text-slate-500 hover:text-slate-600">Cancel</button>
                </motion.form>
              )}
              {accounts.length === 0 ? (
                <div className="detail-card rounded-xl p-8 text-center text-base detail-muted">No accounts yet. Create the first one above.</div>
              ) : accounts.map((acc) => (
                <div key={acc._id} className="detail-card rounded-xl overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-7">
                    <div>
                      <p className="text-xs detail-muted uppercase tracking-wide mb-1">Account</p>
                      <p className="font-mono text-base font-medium">{acc.Acc_number}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <StatusBadge value={acc.status} />
                        <span className="text-sm detail-muted">Balance</span>
                        <span className="text-xl font-bold text-[#f9c723]">
                          {acc.balance.toLocaleString("en-EG", { style: "currency", currency: "EGP" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => openTxModal(acc._id, "deposit")}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                        style={{ background: "rgba(34,197,94,0.22)", color: "#86efac" }}
                      >
                        + Deposit
                      </button>
                      <button
                        onClick={() => openTxModal(acc._id, "withdraw")}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                        style={{ background: "rgba(249,199,35,0.22)", color: "#f9c723" }}
                      >
                        − Withdraw
                      </button>
                      <button
                        onClick={() => toggleTransactions(acc._id)}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                        style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff" }}
                      >
                        {expandedAccount === acc._id ? "Hide" : "Transactions"}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedAccount === acc._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t detail-divider overflow-hidden"
                      >
                        <div className="p-7">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium detail-muted uppercase tracking-wide">Recent Transactions</p>
                            <button
                              onClick={() => exportAccountTransactions(acc)}
                              className="flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium rounded-lg transition-colors"
                              style={{ background: "rgba(255,255,255,0.12)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.20)" }}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeWidth="2" strokeLinecap="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                              </svg>
                              Export
                            </button>
                          </div>
                          {txLoading[acc._id] ? (
                            <p className="text-base detail-muted">Loading…</p>
                          ) : !transactions[acc._id]?.length ? (
                            <p className="text-base detail-muted">No transactions yet.</p>
                          ) : (
                            <>
                              <div className="space-y-2">
                                {transactions[acc._id].map((tx) => (
                                  <div key={tx._id} className="flex items-center justify-between text-base py-2 border-b detail-divider last:border-0">
                                    <div>
                                      <span className="font-medium" style={{ color: tx.Transaction_type === "Deposit" ? "#86efac" : "#fca5a5" }}>
                                        {tx.Transaction_type === "Deposit" ? "+" : "-"}
                                        {tx.Transaction_Amount.toLocaleString("en-EG", { style: "currency", currency: "EGP" })}
                                      </span>
                                      <p className="text-sm detail-muted mt-0.5">{new Date(tx.time_stamp).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-sm detail-muted">
                                      Balance: {tx.balanceAfter.toLocaleString("en-EG", { style: "currency", currency: "EGP" })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {txMeta[acc._id]?.totalPages > 1 && (
                                <Pagination
                                  page={txPage[acc._id] || 1}
                                  totalPages={txMeta[acc._id].totalPages}
                                  total={txMeta[acc._id].total}
                                  limit={TX_PAGE_SIZE}
                                  onPageChange={(p) => fetchTxPage(acc._id, p)}
                                />
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "service-requests" && (
            <motion.div key="srs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {serviceRequests.length === 0 ? (
                <div className="detail-card rounded-xl p-8 text-center text-base detail-muted">No service requests for this customer.</div>
              ) : (
                <div className="detail-card table-gradient-card rounded-xl overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {["Type", "Priority", "Status", "Created", ""].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {serviceRequests.map((sr) => (
                        <tr key={sr._id}>
                          <td className="font-medium">{sr.type}</td>
                          <td><StatusBadge value={sr.priority} /></td>
                          <td><StatusBadge value={sr.status} /></td>
                          <td className="td-secondary text-sm">{new Date(sr.createdAt).toLocaleDateString()}</td>
                          <td className="text-right">
                            <button onClick={() => navigate(`/service-requests/${sr._id}`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold">
                              View
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeWidth="2.5" strokeLinecap="round" d="M9 18l6-6-6-6" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

export default CustomerDetail;
