import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Users, CreditCard, Receipt, 
  Bell, User, LogOut, Plus, Search, X
} from 'lucide-react';

const ChapaPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [payments, setPayments] = useState([
    { id: 'TXN-8802', customer: 'Meron Tadesse', amount: 'ETB 12,500', date: '2026-07-23', status: 'Confirmed' },
    { id: 'TXN-8801', customer: 'Dawit Bekele', amount: 'ETB 1,250', date: '2026-07-23', status: 'Confirmed' },
    { id: 'TXN-8800', customer: 'Tigist Alemu', amount: 'ETB 4,800', date: '2026-07-22', status: 'Pending' },
  ]);

  const [formData, setFormData] = useState({ customer: '', amount: '', invoice: '' });

  const handleAddPayment = (e) => {
    e.preventDefault();
    const newPayment = {
      id: `TXN-${String(payments.length + 8800).padStart(4, '0')}`,
      customer: formData.customer,
      amount: `ETB ${Number(formData.amount).toLocaleString()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending',
    };
    setPayments([newPayment, ...payments]);
    setFormData({ customer: '', amount: '', invoice: '' });
    setShowModal(false);
  };

  const verifyPayment = (id) => {
    setPayments(payments.map(p => p.id === id ? { ...p, status: 'Confirmed' } : p));
  };

  const filtered = payments.filter(p =>
    p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col sticky top-0 flex-shrink-0">
        <div className="p-6 border-b border-gray-200"><h1 className="text-2xl font-bold text-green-600">BizTrack</h1><p className="text-sm text-gray-500">Cashier Portal</p></div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg w-full transition-colors ${item.path === '/cashier/chapa' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
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

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900">Chapa Payments</h1><p className="text-gray-500">Track Chapa payment transactions</p></div>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"><Plus size={18} /> New Payment</button>
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search payments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono font-medium text-gray-900">{p.id}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{p.customer}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{p.amount}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{p.date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      {p.status === 'Pending' ? (
                        <button onClick={() => verifyPayment(p.id)} className="text-xs text-green-600 hover:underline font-medium">Verify</button>
                      ) : (
                        <span className="text-xs text-green-600">✅ Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-gray-900">New Chapa Payment</h3><button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label><input type="text" placeholder="Customer name" value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETB) *</label><input type="number" placeholder="Enter amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label><input type="text" placeholder="INV-XXXX" value={formData.invoice} onChange={(e) => setFormData({ ...formData, invoice: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500" /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm py-2.5 rounded-lg">Cancel</button><button type="submit" className="flex-1 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-700">Create Payment</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapaPayments;