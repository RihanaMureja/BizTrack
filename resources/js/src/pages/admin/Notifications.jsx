import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Bell, Check, AlertCircle, Database, UserPlus, RefreshCw, TrendingUp, Send, Clock } from 'lucide-react';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('inbox');

  const notifications = [
    { id: 1, title: 'Database backup completed', description: 'Nightly backup finished successfully at 02:00 AM.', time: '2 hr ago', type: 'system', read: false, icon: Database, color: 'text-blue-500 bg-blue-50' },
    { id: 2, title: 'New business owner registered', description: 'Henok Tadesse just registered Zelan Imports.', time: '4 hr ago', type: 'user', read: false, icon: UserPlus, color: 'text-green-500 bg-green-50' },
    { id: 3, title: 'Subscription renewed', description: 'Habesha Café renewed Premium plan successfully.', time: '6 hr ago', type: 'payment', read: false, icon: RefreshCw, color: 'text-purple-500 bg-purple-50' },
    { id: 4, title: 'High traffic detected', description: 'Server load reached 87% — monitoring closely.', time: '8 hr ago', type: 'alert', read: true, icon: TrendingUp, color: 'text-yellow-500 bg-yellow-50' },
    { id: 5, title: 'Payment received', description: 'Chapa payment of ETB 12,500 from Meron Tadesse confirmed.', time: '1 day ago', type: 'payment', read: true, icon: Check, color: 'text-green-500 bg-green-50' },
    { id: 6, title: 'Cashier password reset requested', description: 'Liya Worku requested a password reset for Habesha Café.', time: '1 week ago', type: 'system', read: true, icon: AlertCircle, color: 'text-red-500 bg-red-50' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications Center</h1>
            <p className="text-gray-500">Manage system alerts and announcements</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Send size={16} /> Send Announcement
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'inbox'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell size={16} />
            Inbox
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'sent'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Sent
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((item) => (
            <div key={item.id} className={`bg-white rounded-xl shadow-sm border p-4 transition-all hover:shadow-md ${
              item.read ? 'border-gray-100' : 'border-green-200 bg-green-50/50'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${item.read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {item.title}
                    </h4>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {item.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                </div>
                {!item.read && (
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Notifications 
;