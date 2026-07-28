import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

const BusinessLayout = ({ children }) => {
  const menuItems = [
    { path: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/owner/revenue', icon: TrendingUp, label: 'Revenue' },
    { path: '/owner/expenses', icon: TrendingDown, label: 'Expenses' },
    { path: '/owner/inventory', icon: Package, label: 'Inventory' },
    { path: '/owner/cashiers', icon: Users, label: 'Cashiers' },
    { path: '/owner/customers', icon: Users, label: 'Customers' },
    { path: '/owner/reports', icon: BarChart3, label: 'Reports' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col sticky top-0 flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-green-600">BizTrack</h1>
          <p className="text-sm text-gray-500">Business Owner</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg w-full ${
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
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">AB</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Abebe Kebede</p>
              <p className="text-xs text-gray-500">Owner</p>
            </div>
          </div>
          <Link to="/login" className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg w-full">
            <LogOut size={20} /> Logout
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default BusinessLayout;