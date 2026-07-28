import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { Bell, CheckCircle, AlertCircle, CreditCard, Package } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Chapa Payment Received', description: 'TXN-8802 for ETB 12,500 from Meron Tadesse confirmed.', time: '8 min ago', type: 'payment', read: false },
  { id: 2, title: 'Credit Due Reminder', description: 'Abebe Kebede\'s credit of ETB 700 is overdue (due 25 Jul).', time: '32 min ago', type: 'credit', read: false },
  { id: 3, title: 'Low Stock Alert', description: 'Printer Paper is running low – only 4 units remaining.', time: '1 hr ago', type: 'stock', read: false },
  { id: 4, title: 'Chapa Payment Received', description: 'TXN-8801 for ETB 1,250 from Dawit Bekele confirmed.', time: '2 hr ago', type: 'payment', read: true },
  { id: 5, title: 'Credit Due Reminder', description: 'Bereket Halle has ETB 3,000 remaining – due 28 Jul.', time: '3 hr ago', type: 'credit', read: true },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: !n.read } : n
    ));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const filtered = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const getIcon = (type) => {
    switch(type) {
      case 'payment': return <CreditCard className="w-5 h-5 text-green-600" />;
      case 'credit': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'stock': return <Package className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'payment': return 'bg-green-50 border-green-200';
      case 'credit': return 'bg-red-50 border-red-200';
      case 'stock': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div>
      <PageHeader 
        title="Notifications" 
        subtitle={`${unreadCount} unread`}
        action={
          unreadCount > 0 && (
            <button 
              onClick={markAllRead}
              className="text-sm text-green-600 hover:underline font-medium"
            >
              Mark all as read
            </button>
          )
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'payment', 'credit', 'stock'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === type 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'All' : type}
            {type === 'all' && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                {notifications.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div 
              key={notif.id} 
              className={`bg-white rounded-xl border shadow-sm p-4 transition-all hover:shadow-md ${
                notif.read ? 'border-gray-100' : 'border-green-200 bg-green-50/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  notif.read ? 'bg-gray-100' : getColor(notif.type)
                }`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-gray-400">{notif.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{notif.description}</p>
                </div>
                {!notif.read && (
                  <button 
                    onClick={() => toggleRead(notif.id)}
                    className="w-2 h-2 bg-green-500 rounded-full hover:scale-150 transition-transform"
                    title="Mark as read"
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}