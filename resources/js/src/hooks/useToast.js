import { useState, useCallback } from 'react';

/**
 * Lightweight toast notification hook.
 * Usage:
 *   const { toasts, showToast } = useToast();
 *   showToast('Saved!', 'success');
 *   showToast('Something went wrong', 'error');
 *
 * Render <ToastContainer toasts={toasts} /> in your layout.
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const dismiss = (id) => setToasts(t => t.filter(x => x.id !== id));

  return { toasts, showToast, dismiss };
}

export default useToast;
