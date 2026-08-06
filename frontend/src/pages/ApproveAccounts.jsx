import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axios";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { getTokenPayload } from "../utils/jwt";

function ApproveAccounts() {
  const isSupervisor = getTokenPayload()?.role === "Supervisor";

  const [pending, setPending] = useState([]);
  const [roles, setRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingId, setApprovingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);

  useEffect(() => {
    if (!isSupervisor) return;
    API.get("/agents/pending")
      .then(({ data }) => {
        setPending(data);
        setRoles(Object.fromEntries(data.map((a) => [a._id, a.role])));
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load pending accounts"))
      .finally(() => setLoading(false));
  }, [isSupervisor]);

  if (!isSupervisor) return <Navigate to="/" replace />;

  const approve = async (id) => {
    setApprovingId(id);
    try {
      await API.patch(`/agents/${id}/approve`, { role: roles[id] });
      setPending((prev) => prev.filter((a) => a._id !== id));
      setToast({ message: "Account approved", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to approve account", type: "error" });
    } finally {
      setApprovingId(null);
    }
  };

  const reject = async (id) => {
    try {
      await API.delete(`/agents/${id}`);
      setPending((prev) => prev.filter((a) => a._id !== id));
      setConfirmReject(null);
      setToast({ message: "Account rejected", type: "success" });
    } catch (err) {
      setConfirmReject(null);
      setToast({ message: err.response?.data?.message || "Failed to reject account", type: "error" });
    }
  };

  return (
    <Layout>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <ConfirmModal
        open={!!confirmReject}
        title="Reject account"
        message={`Permanently reject ${confirmReject?.name}'s signup request? This cannot be undone.`}
        confirmLabel="Reject"
        onConfirm={() => reject(confirmReject._id)}
        onCancel={() => setConfirmReject(null)}
      />
      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <p className="page-header-eyebrow">Team</p>
          <h1 className="page-header-title">Approve Accounts</h1>
          <p className="page-header-sub">{pending.length} signup{pending.length === 1 ? "" : "s"} awaiting approval</p>
          <div className="page-header-rule" />
        </motion.div>

        {loading ? (
          <p className="text-base text-slate-500 py-10 text-center">Loading pending accounts…</p>
        ) : error ? (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-base">{error}</div>
        ) : pending.length === 0 ? (
          <div className="section-card p-10 text-center text-base text-slate-500">
            No accounts waiting on approval.
          </div>
        ) : (
          <div className="section-card overflow-hidden table-gradient-card">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Requested role</th>
                    <th>Approve as</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((agent, i) => (
                    <motion.tr key={agent._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "rgba(255,255,255,0.18)", color: "#ffffff", border: "1.5px solid rgba(255,255,255,0.30)" }}>
                            {agent.name[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-white">{agent.name}</span>
                        </div>
                      </td>
                      <td><StatusBadge value={agent.role} dark /></td>
                      <td>
                        <select
                          value={roles[agent._id]}
                          onChange={(e) => setRoles((prev) => ({ ...prev, [agent._id]: e.target.value }))}
                          className="form-select"
                        >
                          <option value="Agent">Agent</option>
                          <option value="Supervisor">Supervisor</option>
                        </select>
                      </td>
                      <td className="text-right">
                        <div className="row-action flex items-center justify-end gap-2">
                          <button
                            onClick={() => approve(agent._id)}
                            disabled={approvingId === agent._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-600 hover:text-white transition-all duration-150 disabled:opacity-50"
                          >
                            {approvingId === agent._id ? "Approving…" : "Approve"}
                          </button>
                          <button
                            onClick={() => setConfirmReject(agent)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-150"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ApproveAccounts;
