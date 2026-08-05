import { motion, AnimatePresence } from "framer-motion";

function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = "Delete", danger = true }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-[#dde6f0] w-full max-w-sm overflow-hidden">
              <div className="px-6 pt-6 pb-5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-red-50" : "bg-[#e8f2fc]"}`}>
                  <svg className={`w-5 h-5 ${danger ? "text-red-500" : "text-[#3685c6]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {danger
                      ? <path strokeWidth="2" strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      : <path strokeWidth="2" strokeLinecap="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 21h.01" />}
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[#1a2540] mb-1">{title}</h3>
                {message && <p className="text-base text-slate-500">{message}</p>}
              </div>
              <div className="px-6 pb-5 flex gap-2 justify-end border-t border-[#dde6f0] pt-4">
                <button
                  onClick={onCancel}
                  className="py-2.5 px-5 text-base text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className={`py-2.5 px-5 text-base font-medium text-white rounded-lg transition-colors ${
                    danger ? "bg-red-500 hover:bg-red-600" : "bg-[#3685c6] hover:bg-[#2268a5]"
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ConfirmModal;
