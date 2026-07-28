import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  CreditCard, 
  FileText, 
  Receipt, 
  History, 
  Bell, 
  LogOut,
  HelpCircle
} from 'lucide-react';

const CustomerDashboard = () => {
  const stats = [
    { label: 'Total Purchases', value: 'ETB 177,000', sub: '+12% this month' },
    { label: 'Outstanding Credit', value: 'ETB 89,000', sub: 'Due Aug 10' },
    { label: 'Total Amount Paid', value: 'ETB 88,000', sub: 'Across 4 invoices' },
    { label: 'Pending Invoices', value: '2', sub: 'ETB 107,000 total' },
  ];

  const purchases = [
    { name: 'Office Furniture Set', date: '2025-07-15', ref: 'PUR-001', amount: 'ETB 24,500', status: 'Paid' },
    { name: 'Laptop Dell XPS 15', date: '2025-07-10', ref: 'PUR-002', amount: 'ETB 4,200', status: 'Pending' },
    { name: 'A4 Paper Ream', date: '2025-07-05', ref: 'PUR-003', amount: 'ETB 3,800', status: 'Paid' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* LEFT: Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col sticky top-0 flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-green-600">BizTrack</h1>
          <p className="text-sm text-gray-500">Customer Portal</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li><Link to="/customer/dashboard" className="flex items-center gap-3 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg w-full"><LayoutDashboard size={20} /> Dashboard</Link></li>
            <li><Link to="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg w-full"><ShoppingCart size={20} /> My Purchases</Link></li>
            <li><Link to="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg w-full"><CreditCard size={20} /> My Credit</Link></li>
            <li><Link to="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg w-full"><FileText size={20} /> Invoices</Link></li>
            <li><Link to="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg w-full"><Receipt size={20} /> Chapa Payments</Link></li>
            <li><Link to="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg w-full"><History size={20} /> Payment History</Link></li>
            <li><Link to="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg w-full"><Bell size={20} /> Notifications</Link></li>
            <li><Link to="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg w-full"><HelpCircle size={20} /> Help & Support</Link></li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">AB</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Abebe Bekele</p>
              <p className="text-xs text-gray-500">Acme Corporation</p>
            </div>
          </div>
          <Link to="/login" className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg w-full">
            <LogOut size={20} /> Logout
          </Link>
        </div>
      </aside>

      {/* RIGHT: Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Good morning, Abebe! 😊</h2>
          <p className="text-gray-500">Here's your financial overview for today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
              <p className="text-sm text-gray-500 mt-1">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Recent Purchases Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Purchases</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchases.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.ref}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{item.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;