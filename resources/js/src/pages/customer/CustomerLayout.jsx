import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { getStoredUser } from '../../utils/auth';
import { LayoutDashboard, ShoppingBag, FileText, Wallet, History, Bell, User } from 'lucide-react';

const navItems = [
  { type: 'section', label: 'Main' },
  { to: '/customer/dashboard',      label: 'Dashboard',       icon: LayoutDashboard },
  { type: 'section', label: 'My Account' },
  { to: '/customer/purchases',      label: 'My Purchases',    icon: ShoppingBag },
  { to: '/customer/invoices',       label: 'Invoices',        icon: FileText },
  { to: '/customer/chapa-payments', label: 'Pay with Chapa',  icon: Wallet },
  { to: '/customer/payment-history',label: 'Payment History', icon: History },
  { type: 'section', label: 'Settings' },
  { to: '/customer/notifications',  label: 'Notifications',   icon: Bell },
  { to: '/customer/profile',        label: 'My Profile',      icon: User },
];

export default function CustomerLayout() {
  const user = getStoredUser();
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="BizTrack" subtitle="Customer" navItems={navItems} user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}