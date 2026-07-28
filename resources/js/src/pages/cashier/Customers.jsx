import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Users, CreditCard, Receipt, 
  Bell, User, LogOut, Plus, Search, X, Phone, Mail, CheckCircle, XCircle
} from 'lucide-react';

const CashierCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Tigist Alemu', phone: '+251911234567', email: 'tigist@email.com', totalPurchases: 'ETB 28,400', status: 'Active', since: 'Jan 2025' },
    { id: 2, name: 'Dawit Bekele', phone: '+251912345678', email: 'dawit@email.com', totalPurchases: 'ETB 12,100', status: 'Active', since: 'Feb 2025' },
    { id: 3, name: 'Hana Girma', phone: '+251913456789', email: 'hana@email.com', totalPurchases: 'ETB 5,200', status: 'Inactive', since: 'Mar 2025' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const newCustomer = {
      id: customers.length + 1,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      totalPurchases: 'ETB 0',
      status: 'Active',
      since: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
    setCustomers([...customers, newCustomer]);
    setFormData({ name: '', phone: '', email: '' });
    setShowModal(false);
  };

  const toggleStatus = (id) => {
    setCustomers(customers.map(c => 
      c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c
    ));
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Link 
                  to={item.path} 
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg w-full transition-colors ${
                    item.path === '/cashier/customers' 
                      ? 'bg-green-50 text-green-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link to="/cashier/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg w-full">
            <User size={20} /> Profile
          </Link>
          <Link to="/login" className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg w-full">
            <LogOut size={20} /> Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500">Manage your customers</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add Customer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{customers.filter(c => c.status === 'Active').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Inactive</p>
            <p className="text-2xl font-bold text-red-600">{customers.filter(c => c.status === 'Inactive').length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 flex items-center gap-1">
                      <Phone size={14} className="text-gray-400" /> {customer.phone}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 flex items-center gap-1">
                      <Mail size={14} className="text-gray-400" /> {customer.email}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{customer.totalPurchases}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${
                        customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {customer.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStatus(customer.id)}
                        className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                          customer.status === 'Active'
                            ? 'text-red-600 hover:bg-red-50 border-red-200'
                            : 'text-green-600 hover:bg-green-50 border-green-200'
                        }`}
                      >
                        {customer.status === 'Active' ? 'Disable' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Customer</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Tigist Alemu"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  placeholder="+251 91 234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 text-sm py-2.5 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-700"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierCustomers;