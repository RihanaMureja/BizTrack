import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Users, UserCog, User, 
  CreditCard, Activity, BarChart3, Bell, Database, 
  Settings, Crown, LogOut 
} from 'lucide-react';

const AdminSidebar = () => {
  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/elearning', icon: BookOpen, label: 'E-Learning' },
    { path: '/admin/business-owners', icon: Users, label: 'Business Owners' },
    { path: '/admin/cashiers', icon: UserCog, label: 'Cashiers' },
    { path: '/admin/customers', icon: User, label: 'Customers' },
    { path: '/admin/subscriptions', icon: CreditCard, label: 'Subscription & Payments' },
    { path: '/admin/chapa-transactions', icon: Activity, label: 'Chapa Transactions' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/activity-logs', icon: Database, label: 'Activity Logs' },
    { path: '/admin/backup-restore', icon: Database, label: 'Backup & Restore' },
    { path: '/admin/settings', icon: Settings, label: 'System Settings' },
    { path: '/admin/profile', icon: Crown, label: 'Profile' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-green-600">BizTrack</h1>
        <p className="text-sm text-gray-500">Super Admin</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors w-full ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <NavLink
          to="/login"
          className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
        >
          <LogOut size={20} />
          <span className="text-sm">Logout</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;