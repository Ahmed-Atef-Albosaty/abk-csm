import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axios";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";

const FREQUENCY_LABELS = {
  Monthly: "Monthly",
  Quarterly: "Quarterly",
  semiAnnually: "Semi-Annually",
  Yearly: "Yearly",
};

function formatMoney(n) {
  return `EGP ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/loan/loan/${id}`)
      .then(({ data }) => setLoan(data))
      .catch((err) => setError(err.response?.data?.message || "Loan not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <Layout>
      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1200px] mx-auto">
        <div className="section-card p-10 text-center text-base text-slate-500">Loading loan…</div>
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

  const schedule = loan.schedule || [];
  const totalInterest = schedule.reduce((sum, row) => sum + row.interestComponent, 0);
  const totalRepayment = loan.principal + totalInterest;
  const installmentAmount = schedule[0]?.payment ?? 0;
  const customerName = loan.customerId?.name || String(loan.customerId).slice(-8);
  const accountNumber = loan.accountId?.Acc_number || String(loan.accountId).slice(-8);

  return (
    <Layout>
      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <button
            onClick={() => navigate("/loans")}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#3685c6] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Loans
          </button>
        </div>

        {/* Loan header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="detail-card rounded-xl p-7 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-semibold text-2xl shrink-0"
                style={{ background: "rgba(255,255,255,0.18)", color: "#ffffff", border: "2px solid rgba(255,255,255,0.30)" }}
              >
                {customerName[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="border-l-[3px] border-[#f9c723] pl-3">
                <h1 className="text-3xl font-bold">{customerName}</h1>
                <p className="text-base detail-muted font-mono">{loan._id}</p>
              </div>
            </div>
            <StatusBadge value={loan.status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t detail-divider">
            {[
              ["Account", accountNumber],
              ["Principal", formatMoney(loan.principal)],
              ["Annual Rate", `${loan.annualInterestRate}%`],
              ["Term", `${loan.termMonths} months`],
              ["Frequency", FREQUENCY_LABELS[loan.frequency] || loan.frequency],
              ["Installment", formatMoney(installmentAmount)],
              ["Total Interest", formatMoney(totalInterest)],
              ["Total Repayment", formatMoney(totalRepayment)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs detail-muted uppercase tracking-wide">{label}</p>
                <p className="text-base font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Amortization schedule */}
        <div className="section-card overflow-hidden table-gradient-card">
          <div className="px-5 py-4">
            <h3 className="text-base font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Amortization Schedule
            </h3>
          </div>
          <div className="overflow-x-auto">
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
                {schedule.map((row) => (
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
        </div>
      </div>
    </Layout>
  );
}

export default LoanDetail;
