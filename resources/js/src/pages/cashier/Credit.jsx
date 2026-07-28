import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Users, CreditCard, Receipt, 
  Bell, User, LogOut, Plus, Search, X
} from 'lucide-react';

const Credit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [credits, setCredits] = useState([
    { id: 1, name: 'Hana Girma', invoice: 'INV-2399', amount: 'ETB 2,300', due: '2026-08-01', status: 'Unpaid' },
    { id: 2, name: 'Bereket Haile', invoice: 'INV-2388', amount: 'ETB 3,000', due: '2026-07-28', status: 'Partial' },
    { id: 3, name: 'Abebe Kebede', invoice: 'INV-2385', amount: 'ETB 700', due: '2026-07-28', status: 'Unpaid' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    invoice: '',
    amount: '',
    due: '',
    status: 'Unpaid',
  });

  const handleAddCredit = (e) => {
    e.preventDefault();
    const newCredit = {
      id: credits.length + 1,
      name: formData.name,
      invoice: formData.invoice,
      amount: `ETB ${Number(formData.amount).toLocaleString()}`,
      due: formData.due,
      status: formData.status,
    };
    setCredits([newCredit, ...credits]);
    setFormData({ name: '', invoice: '', amount: '', due: '', status: 'Unpaid' });
    setShowModal(false);
  };

  const updateStatus = (id) => {
    const statuses = ['Unpaid', 'Partial', 'Paid'];
    setCredits(credits.map(c =>
      c.id === id ? { ...c, status: statuses[(statuses.indexOf(c.status) + 1) % statuses.length] } : c
    ));
  };

  const filteredCredits = credits.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.invoice.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Link to={item.path} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg w-full transition-colors ${item.path === '/cashier/credit' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Credit</h1>
            <p className="text-gray-500">Track customer credit balances</p>
          </div>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Plus size={18} /> Add Credit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total Credits</p>
            <p className="text-2xl font-bold text-gray-900">{credits.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Unpaid</p>
            <p className="text-2xl font-bold text-red-600">{credits.filter(c => c.status === 'Unpaid').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Partial</p>
            <p className="text-2xl font-bold text-yellow-600">{credits.filter(c => c.status === 'Partial').length}</p>
          </div>
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search credits..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCredits.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="py-3 px-4 text-sm font-mono text-gray-600">{c.invoice}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{c.amount}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{c.due}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        c.status === 'Unpaid' ? 'bg-red-100 text-red-700' :
                        c.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => updateStatus(c.id)} className="text-xs text-blue-600 hover:underline font-medium">
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Credit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Customer Credit</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCredit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input type="text" placeholder="Customer name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
                <input type="text" placeholder="INV-XXXX" value={formData.invoice} onChange={(e) => setFormData({ ...formData, invoice: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETB) *</label>
                <input type="number" placeholder="Enter amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input type="date" value={formData.due} onChange={(e) => setFormData({ ...formData, due: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500">
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm py-2.5 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-700">Add Credit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credit;