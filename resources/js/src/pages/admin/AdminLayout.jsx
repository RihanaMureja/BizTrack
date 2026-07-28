import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { getStoredUser } from '../../utils/auth';
import {
  LayoutDashboard, Users, Briefcase, CreditCard,
  BarChart2, Bell, ClipboardList, Settings, Wallet
} from 'lucide-react';

const navItems = [
  { type: 'section', label: 'Main' },
  { to: '/admin/dashboard',       label: 'Dashboard',          icon: LayoutDashboard },
  { type: 'section', label: 'Management' },
  { to: '/admin/business-owners', label: 'Business Owners',    icon: Briefcase },
  { to: '/admin/cashiers',        label: 'Cashiers',           icon: Users },
  { to: '/admin/customers',       label: 'Customers',          icon: Users },
  { to: '/admin/subscriptions',   label: 'Subscriptions',      icon: CreditCard },
  { to: '/admin/transactions',    label: 'Chapa Transactions', icon: Wallet },
  { type: 'section', label: 'Reports' },
  { to: '/admin/reports',         label: 'Reports',            icon: BarChart2 },
  { to: '/admin/activity-logs',   label: 'Activity Logs',      icon: ClipboardList },
  { type: 'section', label: 'System' },
  { to: '/admin/notifications',   label: 'Notifications',      icon: Bell },
  { to: '/admin/settings',        label: 'System Settings',    icon: Settings },
];

export default function AdminLayout() {
  const user = getStoredUser();
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        title="BizTrack"
        subtitle="Super Admin"
        navItems={navItems}
        user={user}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}