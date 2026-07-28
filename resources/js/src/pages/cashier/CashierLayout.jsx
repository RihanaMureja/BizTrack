import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { getStoredUser } from '../../utils/auth';
import {
  LayoutDashboard, ShoppingCart, Users,
  Smartphone, FileText, Bell, User,
} from 'lucide-react';

// Credit service removed from cashier navigation
const navItems = [
  { type: 'section', label: 'Main Menu' },
  { to: '/cashier/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/cashier/sales',          label: 'Sales',          icon: ShoppingCart    },
  { to: '/cashier/customers',      label: 'Customers',      icon: Users           },
  { to: '/cashier/chapa-payments', label: 'Chapa Payments', icon: Smartphone      },
  { to: '/cashier/receipts',       label: 'Receipts',       icon: FileText        },
  { to: '/cashier/notifications',  label: 'Notifications',  icon: Bell, badge: 2  },
  { to: '/cashier/profile',        label: 'Profile',        icon: User            },
];

export default function CashierLayout() {
  const user = getStoredUser();
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        subtitle="Cashier Portal"
        navItems={navItems}
        user={{ ...user, roleLabel: 'Cashier', avatarColor: 'bg-blue-500' }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
