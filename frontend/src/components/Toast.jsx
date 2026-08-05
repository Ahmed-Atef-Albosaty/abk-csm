import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  const isError = toast?.type !== "success";

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.message}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-5 z-[9998] flex items-start gap-3 bg-white border shadow-lg rounded-xl px-4 py-3 max-w-sm"
          style={{ borderColor: isError ? "#fca5a5" : "#86efac" }}
        >
          <div className={`mt-0.5 w-4 h-4 shrink-0 rounded-full flex items-center justify-center ${isError ? "bg-red-100" : "bg-green-100"}`}>
            <svg className={`w-2.5 h-2.5 ${isError ? "text-red-500" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isError
                ? <path strokeWidth="2.5" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeWidth="2.5" strokeLinecap="round" d="M5 13l4 4L19 7" />}
            </svg>
          </div>
          <p className="text-base text-[#1a2540] flex-1 leading-snug">{toast.message}</p>
          <button onClick={onDismiss} className="text-slate-300 hover:text-slate-500 transition-colors mt-0.5 shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
