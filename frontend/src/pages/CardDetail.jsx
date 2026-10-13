import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axios";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import BankCard from "../components/BankCard";

const CARD_STATUS_TRANSITIONS = {
  Active: ["Inactive", "Blocked"],
  Inactive: ["Active", "Blocked"],
  Blocked: [],
};

const TX_PAGE_SIZE = 8;

function formatMoney(n) {
  return `EGP ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [toast, setToast] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ totalPages: 1, total: 0 });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [txForm, setTxForm] = useState({ open: false, type: "Purchase", amount: "", description: "" });
  const [txSubmitting, setTxSubmitting] = useState(false);

  const loadCard = () =>
    API.get(`/cards/card/${id}`)
      .then(({ data }) => setCard(data))
      .catch((err) => setError(err.response?.data?.message || "Card not found"))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadCard();
  }, [id]);

  const loadHistory = (page) => {
    if (!card) return;
    setHistoryLoading(true);
    const request =
      card.cardType === "Credit"
        ? API.get(`/cards/card/${id}/transactions`, { params: { page, limit: TX_PAGE_SIZE } })
        : API.get(`/transactions/${card.accountId?._id || card.accountId}/transactions`, {
            params: { page, limit: TX_PAGE_SIZE, cardId: id },
          });
    request
      .then(({ data }) => {
        setHistory(data.transactions);
        setHistoryMeta({ totalPages: data.totalPages, total: data.total });
        setHistoryPage(page);
      })
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    if (card) loadHistory(1);
  }, [card?._id, card?.cardType]);

  const updateStatus = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const { data } = await API.patch(`/cards/card/${id}/status`, { status: newStatus });
      setCard((c) => ({ ...c, status: data.card.status }));
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Status update failed", type: "error" });
    } finally {
      setStatusUpdating(false);
      setConfirmBlock(false);
    }
  };

  const submitTransaction = async (e) => {
    e.preventDefault();
    setTxSubmitting(true);
    try {
      const amount = Number(txForm.amount);
      if (card.cardType === "Credit") {
        const { data } = await API.post(`/cards/card/${id}/transaction`, {
          type: txForm.type,
          amount,
          description: txForm.description,
        });
        setCard((c) => ({ ...c, owedBalance: data.card.owedBalance }));
      } else {
        await API.post(`/cards/card/${id}/purchase`, {
          amount,
          description: txForm.description,
        });
      }
      setTxForm({ open: false, type: "Purchase", amount: "", description: "" });
      loadHistory(1);
      setToast({ message: "Transaction recorded", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Transaction failed", type: "error" });
    } finally {
      setTxSubmitting(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1200px] mx-auto">
        <div className="section-card p-10 text-center text-base text-slate-500">Loading card…</div>
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

  const nextStatuses = CARD_STATUS_TRANSITIONS[card.status] || [];
  const isCredit = card.cardType === "Credit";
  const availableCredit = isCredit ? Math.max(0, (card.creditLimit || 0) - (card.owedBalance || 0)) : null;
  const accountNumber = card.accountId?.Acc_number || String(card.accountId).slice(-8);
  const customerName = card.customerId?.name;

  return (
    <Layout>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <ConfirmModal
        open={confirmBlock}
        title="Block card"
        message="This permanently blocks the card. It cannot be unblocked afterward, a new card would need to be issued. Continue?"
        confirmLabel="Block card"
        danger
        onConfirm={() => updateStatus("Blocked")}
        onCancel={() => setConfirmBlock(false)}
      />

      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#3685c6] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <BankCard card={card} className="w-full rounded-2xl shadow-lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="detail-card rounded-xl p-7"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="border-l-[3px] border-[#f9c723] pl-3">
                <h1 className="text-2xl font-bold">{customerName || "Card"}</h1>
                <p className="text-base detail-muted font-mono">{card._id}</p>
              </div>
              <StatusBadge value={card.status} dark />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-5 border-t detail-divider">
              {[
                ["Account", accountNumber],
                ["Card type", card.cardType],
                ["Issued", new Date(card.issuanceDate).toLocaleDateString()],
                ["Expires", new Date(card.expiryDate).toLocaleDateString()],
                ...(isCredit
                  ? [
                      ["Credit limit", formatMoney(card.creditLimit)],
                      ["Owed balance", formatMoney(card.owedBalance)],
                      ["Available credit", formatMoney(availableCredit)],
                      ["Declared salary", card.salaryDeclared ? formatMoney(card.salaryDeclared) : "—"],
                    ]
                  : []),
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs detail-muted uppercase tracking-wide">{label}</p>
                  <p className="text-base font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="detail-card rounded-xl p-7 mb-6">
          <div className="border-l-[3px] border-[#f9c723] pl-3 mb-4">
            <h2 className="text-xl font-semibold">Actions</h2>
          </div>
          <div className="flex flex-wrap gap-3 items-start actions-row">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => (s === "Blocked" ? setConfirmBlock(true) : updateStatus(s))}
                disabled={statusUpdating}
                className="py-2.5 px-5 rounded-lg text-base font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                style={
                  s === "Inactive"
                    ? { background: "rgba(148,163,184,0.22)", color: "#cbd5e1", border: "1px solid rgba(148,163,184,0.35)" }
                    : s === "Blocked"
                    ? { background: "rgba(239,68,68,0.18)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.35)" }
                    : { background: "rgba(34,197,94,0.22)", color: "#86efac", border: "1px solid rgba(34,197,94,0.35)" }
                }
              >
                {s === "Inactive" ? "Deactivate" : s === "Blocked" ? "Block" : "Activate"}
              </button>
            ))}
            {card.status === "Active" && (
              <button
                onClick={() => setTxForm((f) => ({ ...f, open: !f.open, type: "Purchase" }))}
                className="btn-primary py-2.5 px-5"
              >
                {isCredit ? "Record transaction" : "Make purchase"}
              </button>
            )}
          </div>

          {txForm.open && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={submitTransaction}
              className="mt-5 pt-5 border-t detail-divider grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-hidden"
            >
              {isCredit && (
                <div className="flex flex-col gap-1.5">
                  <label className="form-label">Type</label>
                  <select
                    value={txForm.type}
                    onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
                    className="form-input"
                  >
                    <option value="Purchase">Purchase</option>
                    <option value="Payment">Payment</option>
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="form-label">Amount (EGP)</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="form-label">Description (optional)</label>
                <input
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end actions-row">
                <button type="submit" disabled={txSubmitting} className="btn-gold">
                  {txSubmitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            </motion.form>
          )}
        </div>

        {/* Transaction history */}
        <div className="section-card overflow-hidden table-gradient-card">
          <div className="px-5 py-4">
            <h3 className="text-base font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Transaction History
            </h3>
          </div>
          <div className="overflow-x-auto" style={{ opacity: historyLoading ? 0.55 : 1, transition: "opacity 0.18s" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>{isCredit ? "Owed After" : "Balance After"}</th>
                  <th className="hidden sm:table-cell">Description</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-slate-500 py-10 text-base">No transactions yet.</td></tr>
                ) : isCredit ? (
                  history.map((tx) => (
                    <tr key={tx._id}>
                      <td className="td-secondary text-sm">{new Date(tx.timestamp).toLocaleDateString()}</td>
                      <td className="font-medium">{tx.type}</td>
                      <td style={{ color: tx.type === "Payment" ? "#86efac" : "#fca5a5" }}>
                        {tx.type === "Payment" ? "-" : "+"}{formatMoney(tx.amount)}
                      </td>
                      <td>{formatMoney(tx.resultingOwedBalance)}</td>
                      <td className="hidden sm:table-cell td-secondary text-sm">{tx.description || "-"}</td>
                    </tr>
                  ))
                ) : (
                  history.map((tx) => (
                    <tr key={tx._id}>
                      <td className="td-secondary text-sm">{new Date(tx.time_stamp).toLocaleDateString()}</td>
                      <td className="font-medium">{tx.Transaction_type}</td>
                      <td style={{ color: "#fca5a5" }}>-{formatMoney(tx.Transaction_Amount)}</td>
                      <td>{formatMoney(tx.balanceAfter)}</td>
                      <td className="hidden sm:table-cell td-secondary text-sm">{tx.performedBy || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {historyMeta.totalPages > 1 && (
            <Pagination
              page={historyPage}
              totalPages={historyMeta.totalPages}
              total={historyMeta.total}
              limit={TX_PAGE_SIZE}
              onPageChange={loadHistory}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default CardDetail;
