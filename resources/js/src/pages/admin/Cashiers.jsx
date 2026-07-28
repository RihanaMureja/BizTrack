import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Search, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';

const Cashiers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const businesses = [
    {
      id: 1,
      name: 'Habesha Café',
      owner: 'Abebe Kebede',
      cashiers: [
        { id: 1, name: 'Liya Worku', email: 'liya@habesha.com', phone: '+251911100001', status: 'Active', since: 'Mar 2025', initials: 'LW' },
        { id: 2, name: 'Robel Tsegay', email: 'robel@habesha.com', phone: '+251911100002', status: 'Active', since: 'Apr 2025', initials: 'RT' },
      ]
    },
    {
      id: 2,
      name: 'Addis Fashion',
      owner: 'Sara Haile',
      cashiers: [
        { id: 3, name: 'Sara Haile', email: 'sara@addisfashion.com', phone: '+251922345678', status: 'Active', since: 'Feb 2025', initials: 'SH' },
      ]
    },
    {
      id: 3,
      name: 'Blue Nile Tech',
      owner: 'Yonas Tesfaye',
      cashiers: [
        { id: 4, name: 'Tigist Alemu', email: 'tigist@bluenile.com', phone: '+251933456789', status: 'Inactive', since: 'Mar 2025', initials: 'TA' },
        { id: 5, name: 'Fikru Mengistu', email: 'fikru@bluenile.com', phone: '+251944567890', status: 'Active', since: 'Apr 2025', initials: 'FM' },
      ]
    },
  ];

  const filtered = businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header - NO ADD BUTTON */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cashier Management</h1>
          <p className="text-gray-500">Grouped by business owner</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search cashiers or businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Business Groups */}
        {filtered.map((business) => (
          <div key={business.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Business Header - NO ADD BUTTON */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{business.name}</h3>
              <p className="text-sm text-gray-500">Owner: {business.owner} · {business.cashiers.length} cashiers</p>
            </div>

            {/* Cashiers Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Since</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {business.cashiers.map((cashier) => (
                    <tr key={cashier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm">
                            {cashier.initials}
                          </div>
                          <span className="font-medium text-gray-900">{cashier.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail size={14} className="text-gray-400" /> {cashier.email}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone size={14} className="text-gray-400" /> {cashier.phone}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${
                          cashier.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {cashier.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {cashier.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-500">{cashier.since}</td>
                      <td className="py-3 px-6">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors">
                            Disable
                          </button>
                          <button className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors">
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Cashiers;