import { useState } from 'react';

/**
 * Manages open/close state + optional data for a modal.
 * Usage:
 *   const { isOpen, data, open, close } = useModal();
 *   open(selectedItem);   // passes item as modal data
 *   close();
 */
export function useModal(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const [data, setData]     = useState(null);

  const open  = (payload = null) => { setData(payload); setIsOpen(true);  };
  const close = ()               => { setIsOpen(false); setData(null);    };
  const toggle = ()              => setIsOpen(v => !v);

  return { isOpen, data, open, close, toggle };
}

export default useModal;
