import React, { useState } from 'react';
import BusinessLayout from './BusinessLayout';
import { Plus, Search, X, UserPlus, CheckCircle, XCircle } from 'lucide-react';

const CashierMng = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cashiers, setCashiers] = useState([
    { id: 1, name: 'Mekdes T.', email: 'mekdes@example.com', phone: '+251911000001', status: 'Active', since: 'Mar 2025' },
    { id: 2, name: 'Biruk A.', email: 'biruk@example.com', phone: '+251911000002', status: 'Active', since: 'Apr 2025' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleAddCashier = (e) => {
    e.preventDefault();
    const newCashier = {
      id: cashiers.length + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: 'Active',
      since: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
    setCashiers([...cashiers, newCashier]);
    setFormData({ name: '', email: '', phone: '', password: '' });
    setShowModal(false);
  };

  const toggleStatus = (id) => {
    setCashiers(cashiers.map(c =>
      c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c
    ));
  };

  const filteredCashiers = cashiers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cashier Management</h1>
            <p className="text-gray-500">Manage your cashiers</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <UserPlus size={18} /> Add Cashier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Total Cashiers</p>
            <p className="text-2xl font-bold text-gray-900">{cashiers.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{cashiers.filter(c => c.status === 'Active').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Inactive</p>
            <p className="text-2xl font-bold text-red-600">{cashiers.filter(c => c.status === 'Inactive').length}</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search cashiers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Since</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCashiers.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${
                        item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.since}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStatus(item.id)}
                        className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                          item.status === 'Active'
                            ? 'text-red-600 hover:bg-red-50 border-red-200'
                            : 'text-green-600 hover:bg-green-50 border-green-200'
                        }`}
                      >
                        {item.status === 'Active' ? 'Disable' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Cashier</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCashier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="Cashier name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="cashier@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  placeholder="+251911..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  placeholder="•••••••• (min 6 chars)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
                  required
                  minLength="6"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm py-2.5 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-700">Add Cashier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
};

export default CashierMng;