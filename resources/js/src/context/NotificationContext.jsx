import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', title: 'Low Stock Alert',       message: 'Teff Flour is below minimum stock (5 bags remaining).', time: new Date(), read: false },
    { id: 2, type: 'info',    title: 'New Subscription',      message: 'Habesha Cafe upgraded to Premium plan.',                 time: new Date(), read: false },
    { id: 3, type: 'success', title: 'Payment Received',       message: 'ETB 24,500 received from Abebe Bekele via Chapa.',      time: new Date(), read: true  },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const add = (notif) => setNotifications(ns => [{ id: Date.now(), time: new Date(), read: false, ...notif }, ...ns]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, add }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
}

export default NotificationContext;
