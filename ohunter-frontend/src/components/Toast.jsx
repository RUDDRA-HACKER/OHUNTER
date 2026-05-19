import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    if (!message || !onClose) return undefined;

    const timer = window.setTimeout(() => {
      onClose();
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <div className="toast-copy">
        <strong>{type === "success" ? "Success" : type === "error" ? "Error" : "Notice"}</strong>
        <span>{message}</span>
      </div>
      <button className="toast-close" type="button" onClick={onClose} aria-label="Close notification">
        ×
      </button>
    </div>
  );
}
