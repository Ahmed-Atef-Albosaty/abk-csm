import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../api/axios";
import Layout from "../components/Layout";
import { getTokenPayload } from "../utils/jwt";
import StatusBadge from "../components/StatusBadge";
import AuditTimeline from "../components/AuditTimeline";
import Toast from "../components/Toast";

function exportAuditPDF(request, notes) {
  const doc = new jsPDF();
  const blue = [21, 116, 196];
  const gold = [250, 178, 11];
  const dark = [15, 30, 60];

  // Header bar
  doc.setFillColor(...blue);
  doc.rect(0, 0, 210, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("AL AHLI BANK OF KUWAIT - Audit Trail Report", 14, 12);

  // Gold accent
  doc.setFillColor(...gold);
  doc.rect(0, 18, 210, 2, "F");

  // Title
  doc.setTextColor(...dark);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`${request.type} - Audit Trail`, 14, 34);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated ${new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" })}`, 14, 40);

  // Request metadata
  doc.setFontSize(10);
  const meta = [
    ["Request ID", String(request._id)],
    ["Status", request.status],
    ["Priority", request.priority],
    ["Created", new Date(request.createdAt).toLocaleDateString("en-GB")],
    ["Resolved", request.resolvedAt ? new Date(request.resolvedAt).toLocaleDateString("en-GB") : "Pending"],
  ];
  meta.forEach(([label, value], i) => {
    const x = i % 2 === 0 ? 14 : 110;
    const y = 52 + Math.floor(i / 2) * 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    doc.text(String(value), x, y + 5);
  });

  // Description
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...blue);
  doc.setFontSize(11);
  doc.text("Description", 14, 84);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dark);
  doc.setFontSize(9);
  const descLines = doc.splitTextToSize(request.description || "N/A", 182);
  doc.text(descLines, 14, 90);

  // Audit events table
  const tableY = 90 + descLines.length * 5 + 8;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...blue);
  doc.setFontSize(11);
  doc.text(`Audit Events (${notes.length})`, 14, tableY);
  autoTable(doc, {
    startY: tableY + 4,
    head: [["#", "Timestamp", "Agent", "Role", "Event"]],
    body: notes.map((n, i) => [
      i + 1,
      new Date(n.timestamp).toLocaleString("en-GB"),
      n.agentId?.name || String(n.agentId?._id || n.agentId).slice(-8),
      n.agentId?.role || "N/A",
      n.note,
    ]),
    headStyles: { fillColor: blue, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [237, 242, 255] },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 36 }, 2: { cellWidth: 28 }, 3: { cellWidth: 22 }, 4: { cellWidth: "auto" } },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageH = doc.internal.pageSize.height;
  doc.setFillColor(...gold);
  doc.rect(0, pageH - 8, 210, 8, "F");

  doc.save(`audit-trail-${String(request._id).slice(-8)}.pdf`);
}

const VALID_TRANSITIONS = {
  New: ["InProgress"],
  InProgress: ["Escalated", "Resolved"],
  Escalated: ["Resolved"],
  Resolved: [],
};

function ServiceRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agentId, setAgentId] = useState("");
  const [agents, setAgents] = useState([]);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const myAgentId = getTokenPayload()?.agentId;

  useEffect(() => {
    Promise.all([
      API.get(`/service-requests/${id}`),
      API.get(`/service-requests/${id}/notes`),
      API.get("/agents"),
    ])
      .then(([reqRes, notesRes, agentsRes]) => {
        setRequest(reqRes.data);
        setNotes(notesRes.data);
        setAgents(agentsRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load request"))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const { data } = await API.patch(`/service-requests/${id}/status`, { status: newStatus, agentId: myAgentId });
      setRequest(data.serviceRequest);
      const { data: updatedNotes } = await API.get(`/service-requests/${id}/notes`);
      setNotes(updatedNotes);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Status update failed", type: "error" });
    } finally {
      setStatusUpdating(false);
    }
  };

  const assignAgent = async () => {
    if (!agentId.trim()) return;
    try {
      const { data } = await API.patch(`/service-requests/${id}/assign`, { agentId });
      setRequest(data.serviceRequest);
      const { data: updatedNotes } = await API.get(`/service-requests/${id}/notes`);
      setNotes(updatedNotes);
      setAgentId("");
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Assignment failed", type: "error" });
    }
  };

  if (loading) return (
    <Layout>
      <div className="px-6 sm:px-8 lg:px-10 py-8 max-w-4xl mx-auto">
        <div className="section-card p-10 text-center text-base text-slate-500">Loading request…</div>
      </div>
    </Layout>
  );
  if (error) return (
    <Layout>
      <div className="px-6 sm:px-8 lg:px-10 py-8 max-w-4xl mx-auto">
        <div className="section-card p-10 text-center text-base text-red-500">{error}</div>
      </div>
    </Layout>
  );

  const nextStatuses = VALID_TRANSITIONS[request.status] || [];

  return (
    <Layout>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <div className="px-6 sm:px-8 lg:px-10 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <button
            onClick={() => navigate("/service-requests")}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#3685c6] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Requests
          </button>
          <div className="hidden lg:block" aria-hidden="true">
            <svg width="188" height="72" viewBox="0 0 188 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="22" y1="8" x2="22" y2="68" stroke="#dde8f0" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="22" cy="14" r="8" fill="#16a34a"/>
              <path d="M17.5 14l3 3 5.5-5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <rect x="36" y="7" width="148" height="16" rx="6" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="1"/>
              <rect x="42" y="11" width="34" height="4" rx="2" fill="#16a34a" opacity="0.7"/>
              <rect x="82" y="11" width="24" height="4" rx="2" fill="#c4d8ee"/>
              <circle cx="22" cy="36" r="8" fill="#dc2626"/>
              <path d="M22 32v4m0 2h.01" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <rect x="36" y="29" width="148" height="16" rx="6" fill="#fef2f2" stroke="#fecaca" strokeWidth="1"/>
              <rect x="42" y="33" width="40" height="4" rx="2" fill="#dc2626" opacity="0.6"/>
              <rect x="88" y="33" width="24" height="4" rx="2" fill="#c4d8ee"/>
              <circle cx="22" cy="58" r="8" fill="#f9c723"/>
              <circle cx="22" cy="58" r="3.5" fill="#1a2540" opacity="0.35"/>
              <rect x="36" y="51" width="148" height="16" rx="6" fill="#fef3c7" stroke="#fde68a" strokeWidth="1"/>
              <rect x="42" y="55" width="44" height="4" rx="2" fill="#b8860b" opacity="0.7"/>
              <rect x="92" y="55" width="24" height="4" rx="2" fill="#c4d8ee"/>
            </svg>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Request info card */}
          <div className="detail-card rounded-xl p-7">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
              <div className="border-l-[3px] border-[#f9c723] pl-3">
                <h1 className="text-2xl font-bold">{request.type}</h1>
                <p className="text-xs detail-muted font-mono mt-0.5">{request._id}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge value={request.status} />
                <StatusBadge value={request.priority} />
              </div>
            </div>

            <p className="text-base detail-muted mb-5 leading-relaxed">{request.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t detail-divider">
              {[
                ["Customer ID", String(request.customerId).slice(-8)],
                ["Account ID", request.accountId ? String(request.accountId).slice(-8) : "None"],
                ["Created", new Date(request.createdAt).toLocaleDateString()],
                ["Resolved", request.resolvedAt ? new Date(request.resolvedAt).toLocaleDateString() : "Pending"],
                ["Assigned Agent", request.assignedAgentId ? String(request.assignedAgentId).slice(-8) : "Unassigned"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs detail-muted uppercase tracking-wide font-medium">{label}</p>
                  <p className="text-base font-medium font-mono mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {(nextStatuses.length > 0 || true) && (
            <div className="detail-card rounded-xl p-7">
              <div className="border-l-[3px] border-[#f9c723] pl-3 mb-4">
                <h2 className="text-xl font-semibold">Actions</h2>
              </div>
              <div className="flex flex-wrap gap-3 items-start">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={statusUpdating}
                    className="py-2.5 px-5 rounded-lg text-base font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    style={
                      s === "Escalated"
                        ? { background: "rgba(239,68,68,0.22)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.35)" }
                        : s === "Resolved"
                        ? { background: "rgba(34,197,94,0.22)", color: "#86efac", border: "1px solid rgba(34,197,94,0.35)" }
                        : { background: "rgba(249,199,35,0.22)", color: "#f9c723", border: "1px solid rgba(249,199,35,0.35)" }
                    }
                  >
                    {s === "Escalated" && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="2" strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      </svg>
                    )}
                    {s === "Resolved" && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="2" strokeLinecap="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                    {s === "InProgress" && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="2" strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                    )}
                    Mark as {s}
                  </button>
                ))}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <select
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="form-select sm:w-52"
                  >
                    <option value="">Select agent…</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id}>{a.name} ({a.role})</option>
                    ))}
                  </select>
                  <button
                    onClick={assignAgent}
                    className="btn-primary"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Audit trail */}
          <div className="detail-card rounded-xl p-7">
            <div className="flex items-center justify-between mb-5">
              <div className="border-l-[3px] border-[#f9c723] pl-3">
                <h2 className="text-xl font-semibold">Audit Trail</h2>
                <p className="text-sm detail-muted mt-0.5">{notes.length} events recorded</p>
              </div>
              <button
                onClick={() => exportAuditPDF(request, notes)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.12)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.20)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
                Export PDF
              </button>
            </div>
            <AuditTimeline notes={notes} />
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

export default ServiceRequestDetail;
