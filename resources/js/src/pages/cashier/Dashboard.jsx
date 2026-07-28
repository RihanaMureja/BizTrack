import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Users, CreditCard, Receipt, 
  Bell, User, LogOut, TrendingUp, Eye, Search
} from 'lucide-react';

const CashierDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { label: "Today's Sales", value: 'ETB 21,900', sub: '12 transactions', change: '+18% vs yesterday', icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { label: 'Transactions', value: '12', sub: '7 cash + 4 Chapa - 1 credit', change: '+3 vs yesterday', icon: TrendingUp, color: 'bg-blue-100 text-blue-600' },
    { label: 'Credit Sales', value: 'ETB 2,300', sub: '1 new credit today', icon: CreditCard, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Chapa Payments', value: 'ETB 13,750', sub: '2 confirmed today', change: '+5% vs yesterday', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ];

  const recentSales = [
    { invoice: 'INV-2401', customer: 'Tigist Alemu', amount: 'ETB 4,800', status: 'Paid' },
    { invoice: 'INV-2400', customer: 'Dawit Bekele', amount: 'ETB 1,250', status: 'Paid' },
    { invoice: 'INV-2399', customer: 'Hana Girma', amount: 'ETB 2,300', status: 'Pending' },
  ];

  const pendingCredits = [
    { name: 'Hana Girma', invoice: 'INV-2399', amount: 'ETB 2,300', due: 'Due 2026-08-01', status: 'Unpaid' },
    { name: 'Bereket Haile', invoice: 'INV-2388', amount: 'ETB 3,000', due: 'Due 2026-07-28', status: 'Partial' },
    { name: 'Abebe Kebede', invoice: 'INV-2385', amount: 'ETB 700', due: 'Due 2026-07-28', status: 'Unpaid' },
  ];

  const menuItems = [
    { path: '/cashier/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/cashier/sales', icon: ShoppingCart, label: 'Sales' },
    { path: '/cashier/customers', icon: Users, label: 'Customers' },
    { path: '/cashier/credit', icon: CreditCard, label: 'Customer Credit' },
    { path: '/cashier/chapa', icon: Receipt, label: 'Chapa Payments' },
    { path: '/cashier/receipts', icon: Receipt, label: 'Receipts' },
    { path: '/cashier/notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col sticky top-0 flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-green-600">BizTrack</h1>
          <p className="text-sm text-gray-500">Cashier Portal</p>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg w-full transition-colors ${item.path === '/cashier/dashboard' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <item.icon size={20} /><span className="text-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link to="/cashier/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg w-full"><User size={20} /> Profile</Link>
          <Link to="/login" className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg w-full"><LogOut size={20} /> Logout</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div><h2 className="text-2xl font-bold text-gray-900">Dashboard</h2><p className="text-gray-500">Welcome to your cashier dashboard</p></div>
          <div className="flex items-center gap-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-56 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div className="flex items-center gap-3"><span className="text-sm text-gray-500">July 23, 2026</span><div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">C</div></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">{item.label}</p><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}><item.icon size={20} /></div></div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
              <p className="text-sm text-gray-500 mt-1">{item.sub}</p>
              {item.change && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp size={12} /> {item.change}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3><Link to="/cashier/sales" className="text-sm text-green-600 hover:underline font-medium">View All →</Link></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase">Invoice</th><th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase">Customer</th><th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase">Amount</th><th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {recentSales.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-3 text-sm font-medium text-gray-900">{item.invoice}</td>
                      <td className="py-3 px-3 text-sm text-gray-600">{item.customer}</td>
                      <td className="py-3 px-3 text-sm font-medium text-gray-900">{item.amount}</td>
                      <td className="py-3 px-3"><span className={`text-xs px-2 py-1 rounded-full ${item.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900">Pending Credits</h3><Link to="/cashier/credit" className="text-sm text-green-600 hover:underline font-medium">View All →</Link></div>
            <div className="space-y-3">
              {pendingCredits.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div><p className="font-medium text-gray-900">{item.name}</p><p className="text-sm text-gray-500">{item.invoice} - {item.due}</p></div>
                  <div className="text-right"><p className="font-medium text-gray-900">{item.amount}</p><span className={`text-xs px-2 py-1 rounded-full ${item.status === 'Unpaid' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CashierDashboard;