import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Search, Building2, Calendar, CheckCircle, AlertCircle, User } from 'lucide-react';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    { id: 1, name: 'Fikru Mengistu', email: 'fikru@email.com', business: 'Habesha Café', credit: 'ETB 2,400', status: 'Good', lastPayment: 'Jul 18, 2026', transactions: 14, initials: 'FM' },
    { id: 2, name: 'Alma Solomon', email: 'alma@email.com', business: 'Addis Fashion', credit: 'ETB 800', status: 'Good', lastPayment: 'Jul 19, 2026', transactions: 7, initials: 'AS' },
    { id: 3, name: 'Tesfaye Legesse', email: 'tesfaye@email.com', business: 'Lucy Restaurant', credit: 'ETB 0', status: 'Overdue', lastPayment: 'Jun 2, 2026', transactions: 3, initials: 'TL' },
    { id: 4, name: 'Hana Girma', email: 'hana@email.com', business: 'Blue Nile Tech', credit: 'ETB 4,750', status: 'Good', lastPayment: 'Jul 21, 2026', transactions: 9, initials: 'HG' },
    { id: 5, name: 'Bereket Haile', email: 'bereket@email.com', business: 'Green Market', credit: 'ETB 6,000', status: 'Good', lastPayment: 'Jul 17, 2026', transactions: 22, initials: 'BH' },
    { id: 6, name: 'Meron Tadesse', email: 'meron@email.com', business: 'Ethio Tech Hub', credit: 'ETB 1,200', status: 'Good', lastPayment: 'Jul 18, 2026', transactions: 5, initials: 'MT' },
  ];

  const stats = {
    total: customers.length,
    goodStanding: customers.filter(c => c.status === 'Good').length,
    overdue: customers.filter(c => c.status === 'Overdue').length,
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.business.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-500">All customers across all businesses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500 flex items-center gap-1">Good Standing <CheckCircle size={14} className="text-green-500" /></p>
            <p className="text-2xl font-bold text-green-600">{stats.goodStanding}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500 flex items-center gap-1">Overdue Accounts <AlertCircle size={14} className="text-red-500" /></p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Business</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Credit Balance</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Last Payment</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Transactions</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm">
                          {customer.initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building2 size={14} className="text-gray-400" />
                        {customer.business}
                      </div>
                    </td>
                    <td className="py-3 px-6 font-medium text-gray-900">{customer.credit}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        customer.status === 'Good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        {customer.lastPayment}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-600">{customer.transactions}</td>
                    <td className="py-3 px-6">
                      <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Customers;