import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { getTokenPayload } from "../utils/jwt";

const EMPTY_FORM = { name: "", role: "Agent", password: "" };

function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isSupervisor = getTokenPayload()?.role === "Supervisor";

  useEffect(() => {
    API.get("/agents")
      .then(({ data }) => setAgents(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load agents"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (agent) => {
    setEditingId(agent._id);
    setForm({ name: agent.name, role: agent.role, password: "" });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const payload = { name: form.name, role: form.role };
        if (form.password) payload.password = form.password;
        const { data } = await API.put(`/agents/${editingId}`, payload);
        setAgents((prev) => prev.map((a) => (a._id === editingId ? data.agent : a)));
      } else {
        const { data } = await API.post("/agents", form);
        setAgents((prev) => [...prev, data.agent].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to save agent", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/agents/${id}`);
      setAgents((prev) => prev.filter((a) => a._id !== id));
      setConfirmDelete(null);
    } catch (err) {
      setConfirmDelete(null);
      setToast({ message: err.response?.data?.message || "Failed to delete agent", type: "error" });
    }
  };

  const inputCls = "form-input";
  const labelCls = "form-label";

  return (
    <Layout>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete agent"
        message={`Remove ${confirmDelete?.name} from the system? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => handleDelete(confirmDelete._id)}
        onCancel={() => setConfirmDelete(null)}
      />
      <div className="px-6 sm:px-8 lg:px-10 xl:px-14 py-8 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="page-header-eyebrow">Team</p>
              <h1 className="page-header-title">Agents</h1>
              <p className="page-header-sub">{agents.length} team members</p>
            </div>
            <div className="flex items-start gap-5 shrink-0">
              {/* Page illustration */}
              <div className="hidden lg:block" aria-hidden="true">
                <svg width="155" height="106" viewBox="0 0 155 106" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="10" width="68" height="92" rx="10" fill="white" stroke="#dde8f0" strokeWidth="1.5"/>
                  <rect x="2" y="10" width="68" height="30" rx="10" fill="#1a3f7a"/>
                  <rect x="2" y="30" width="68" height="10" fill="#1a3f7a"/>
                  <rect x="2" y="10" width="68" height="3" rx="1.5" fill="#f9c723"/>
                  <circle cx="36" cy="38" r="15" fill="white"/>
                  <circle cx="36" cy="33" r="6.5" fill="#3685c6"/>
                  <ellipse cx="36" cy="47" rx="10" ry="6" fill="#3685c6" opacity="0.45"/>
                  <rect x="11" y="60" width="48" height="5" rx="2.5" fill="#1a2540" opacity="0.78"/>
                  <rect x="18" y="69" width="34" height="4" rx="2" fill="#c4d8ee"/>
                  <rect x="11" y="80" width="48" height="14" rx="7" fill="#f9c723"/>
                  <rect x="20" y="84" width="30" height="6" rx="3" fill="#1a2540" opacity="0.5"/>
                  <rect x="84" y="10" width="68" height="92" rx="10" fill="white" stroke="#dde8f0" strokeWidth="1.5"/>
                  <rect x="84" y="10" width="68" height="30" rx="10" fill="#3685c6"/>
                  <rect x="84" y="30" width="68" height="10" fill="#3685c6"/>
                  <rect x="84" y="10" width="68" height="3" rx="1.5" fill="#f9c723"/>
                  <circle cx="118" cy="38" r="15" fill="white"/>
                  <circle cx="118" cy="33" r="6.5" fill="#1a3f7a"/>
                  <ellipse cx="118" cy="47" rx="10" ry="6" fill="#1a3f7a" opacity="0.4"/>
                  <rect x="93" y="60" width="48" height="5" rx="2.5" fill="#1a2540" opacity="0.78"/>
                  <rect x="100" y="69" width="34" height="4" rx="2" fill="#c4d8ee"/>
                  <rect x="93" y="80" width="48" height="14" rx="7" fill="#e8f2fc"/>
                  <rect x="102" y="84" width="30" height="6" rx="3" fill="#3685c6" opacity="0.65"/>
                  <circle cx="77" cy="56" r="5" fill="#f9c723" stroke="white" strokeWidth="1.5"/>
                  <line x1="70" y1="56" x2="84" y2="56" stroke="#f9c723" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              {isSupervisor && (
                <button onClick={() => showForm ? setShowForm(false) : openCreate()} className="btn-gold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14" />
                  </svg>
                  New Agent
                </button>
              )}
            </div>
          </div>
          <div className="page-header-rule" />
        </motion.div>

        {/* Create / Edit form — two-tone */}
        <AnimatePresence>
          {showForm && isSupervisor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 section-card overflow-hidden form-gradient-card"
              style={{ background: "linear-gradient(160deg, #2d6aaa 0%, #253660 100%)" }}
            >
              <div className="px-6 py-4 flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0 text-[#f9c723]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.8" strokeLinecap="round" d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 20v-1a6 6 0 0112 0v1"/>
                </svg>
                <h3 className="text-base font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {editingId ? "Edit Agent" : "New Agent"}
                </h3>
              </div>
              <div className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className={inputCls}
                  >
                    <option>Agent</option>
                    <option>Supervisor</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{editingId ? "New Password (optional)" : "Password"}</label>
                  <input
                    type="password"
                    required={!editingId}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingId ? "Leave blank to keep" : "Password"}
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-3 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="cancel-btn px-4 py-2.5 text-sm text-white/70 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-gold">
                    {submitting ? "Saving…" : editingId ? "Save changes" : "Create agent"}
                  </button>
                </div>
              </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <p className="text-base text-slate-500 py-10 text-center">Loading agents…</p>
        ) : error ? (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-base">{error}</div>
        ) : agents.length === 0 ? (
          <div className="section-card p-10 text-center text-base text-slate-500">
            No agents found.{isSupervisor && " Use the button above to add the first one."}
          </div>
        ) : (
          <div className="section-card overflow-hidden table-gradient-card">
            <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Role</th>
                  <th className="hidden sm:table-cell">ID</th>
                  {isSupervisor && <th></th>}
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, i) => (
                  <motion.tr
                    key={agent._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "rgba(255,255,255,0.18)", color: "#ffffff", border: "1.5px solid rgba(255,255,255,0.30)" }}>
                          {agent.name[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{agent.name}</span>
                      </div>
                    </td>
                    <td><StatusBadge value={agent.role} /></td>
                    <td className="hidden sm:table-cell td-secondary font-mono text-xs">{agent._id}</td>
                    {isSupervisor && (
                      <td className="text-right">
                        <div className="row-action flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(agent)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3685c6] bg-[#e8f2fc] hover:bg-[#3685c6] hover:text-white transition-all duration-150"
                          >
                            Edit
                          </button>
                          {agent.role !== "Supervisor" && (
                            <button
                              onClick={() => setConfirmDelete(agent)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-150"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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

export default Agents;
