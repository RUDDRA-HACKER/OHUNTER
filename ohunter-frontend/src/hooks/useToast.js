import { useCallback, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    if (!message) {
      setToast(null);
      return;
    }

    setToast({
      id: Date.now(),
      message,
      type,
      onClose: () => setToast(null),
    });
  }, []);

  return { toast, showToast };
}
