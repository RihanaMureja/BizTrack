import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Search, 
  Plus, 
  X, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  Building2,
  Crown,
  Calendar,
  Edit,
  Eye,
  User
} from 'lucide-react';

const BusinessOwners = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingOwner, setEditingOwner] = useState(null);

  const [owners, setOwners] = useState([
    { 
      id: 1, 
      name: 'Abebe Kebede', 
      business: 'Habesha Café', 
      email: 'abebe@habesha.com', 
      phone: '+25191234567', 
      plan: 'Premium', 
      status: 'Active', 
      since: 'Jan 12, 2025',
      initials: 'AK',
      subscriptionEnd: '2026-01-12',
      address: 'Addis Ababa, Ethiopia'
    },
    { 
      id: 2, 
      name: 'Sara Haile', 
      business: 'Addis Fashion', 
      email: 'sara@addisfashion.com', 
      phone: '+251922345678', 
      plan: 'Standard', 
      status: 'Active', 
      since: 'Feb 3, 2025',
      initials: 'SH',
      subscriptionEnd: '2026-02-03',
      address: 'Addis Ababa, Ethiopia'
    },
    { 
      id: 3, 
      name: 'Yonas Tesfaye', 
      business: 'Blue Nile Tech', 
      email: 'yonas@bluenile.et', 
      phone: '+251933456789', 
      plan: 'Basic', 
      status: 'Suspended', 
      since: 'Mar 18, 2025',
      initials: 'YT',
      subscriptionEnd: '2025-09-18',
      address: 'Addis Ababa, Ethiopia'
    },
    { 
      id: 4, 
      name: 'Mekdes Girma', 
      business: 'Lucy Restaurant', 
      email: 'mekdes@lucy.et', 
      phone: '+251944567890', 
      plan: 'Premium', 
      status: 'Active', 
      since: 'Apr 5, 2025',
      initials: 'MG',
      subscriptionEnd: '2026-04-05',
      address: 'Addis Ababa, Ethiopia'
    },
    { 
      id: 5, 
      name: 'Henok Tadesse', 
      business: 'Zelan Imports', 
      email: 'henok@zelan.com', 
      phone: '+251955678901', 
      plan: 'Basic', 
      status: 'Active', 
      since: 'May 5, 2025',
      initials: 'HT',
      subscriptionEnd: '2025-11-05',
      address: 'Addis Ababa, Ethiopia'
    },
    { 
      id: 6, 
      name: 'Tsion Ayele', 
      business: 'Ethio Tech Hub', 
      email: 'tsion@ethiotech.com', 
      phone: '+251966789012', 
      plan: 'Premium', 
      status: 'Active', 
      since: 'Jun 5, 2025',
      initials: 'TA',
      subscriptionEnd: '2026-06-05',
      address: 'Addis Ababa, Ethiopia'
    },
    { 
      id: 7, 
      name: 'Dawit Belay', 
      business: 'Green Market', 
      email: 'dawit@greenmarket.com', 
      phone: '+251977890123', 
      plan: 'Basic', 
      status: 'Inactive', 
      since: 'Jul 5, 2025',
      initials: 'DB',
      subscriptionEnd: '2026-01-05',
      address: 'Addis Ababa, Ethiopia'
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    business: '',
    email: '',
    phone: '',
    plan: 'Basic',
    status: 'Active',
    subscriptionEnd: '',
    address: '',
  });

  // ===== HANDLERS =====
  const handleAddOwner = (e) => {
    e.preventDefault();
    const newOwner = {
      id: owners.length + 1,
      name: formData.name,
      business: formData.business,
      email: formData.email,
      phone: formData.phone,
      plan: formData.plan,
      status: 'Active',
      since: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      initials: formData.name.split(' ').map(n => n[0]).join(''),
      subscriptionEnd: formData.subscriptionEnd || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      address: formData.address || 'Addis Ababa, Ethiopia',
    };
    setOwners([...owners, newOwner]);
    setFormData({ name: '', business: '', email: '', phone: '', plan: 'Basic', status: 'Active', subscriptionEnd: '', address: '' });
    setShowModal(false);
  };

  const toggleStatus = (id) => {
    setOwners(owners.map(owner => {
      if (owner.id === id) {
        const newStatus = owner.status === 'Active' ? 'Inactive' : 'Active';
        return { ...owner, status: newStatus };
      }
      return owner;
    }));
  };

  const deleteOwner = (id) => {
    if (window.confirm('Are you sure you want to delete this business owner?')) {
      setOwners(owners.filter(owner => owner.id !== id));
    }
  };

  const viewOwner = (owner) => {
    setSelectedOwner(owner);
    setShowViewModal(true);
  };

  const startEdit = (owner) => {
    setEditingOwner(owner);
    setFormData({
      name: owner.name,
      business: owner.business,
      email: owner.email,
      phone: owner.phone,
      plan: owner.plan,
      status: owner.status,
      subscriptionEnd: owner.subscriptionEnd,
      address: owner.address,
    });
    setShowModal(true);
  };

  const handleUpdateOwner = (e) => {
    e.preventDefault();
    setOwners(owners.map(owner => 
      owner.id === editingOwner.id 
        ? { 
            ...owner, 
            name: formData.name,
            business: formData.business,
            email: formData.email,
            phone: formData.phone,
            plan: formData.plan,
            status: formData.status,
            subscriptionEnd: formData.subscriptionEnd,
            address: formData.address,
            initials: formData.name.split(' ').map(n => n[0]).join(''),
          }
        : owner
    ));
    setFormData({ name: '', business: '', email: '', phone: '', plan: 'Basic', status: 'Active', subscriptionEnd: '', address: '' });
    setEditingOwner(null);
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700',
      'Inactive': 'bg-gray-100 text-gray-700',
      'Suspended': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPlanBadge = (plan) => {
    const colors = {
      'Premium': 'bg-yellow-100 text-yellow-700',
      'Standard': 'bg-blue-100 text-blue-700',
      'Basic': 'bg-gray-100 text-gray-700',
    };
    return colors[plan] || 'bg-gray-100 text-gray-700';
  };

  const filteredOwners = owners.filter(owner => {
    const matchesSearch = 
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.business.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || owner.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Check if subscription is expired
  const isSubscriptionExpired = (subscriptionEnd) => {
    if (!subscriptionEnd) return false;
    const endDate = new Date(subscriptionEnd);
    const today = new Date();
    return endDate < today;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Owners</h1>
            <p className="text-gray-500">{owners.length} registered owners</p>
          </div>
          <button
            onClick={() => {
              setEditingOwner(null);
              setFormData({ name: '', business: '', email: '', phone: '', plan: 'Basic', status: 'Active', subscriptionEnd: '', address: '' });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add Business Owner
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Active', 'Inactive', 'Suspended'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Owners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOwners.map((owner) => {
            const expired = isSubscriptionExpired(owner.subscriptionEnd);
            const showExpiredWarning = expired && owner.status === 'Active';
            
            return (
              <div key={owner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      owner.status === 'Active' ? 'bg-green-500' : 
                      owner.status === 'Suspended' ? 'bg-red-500' : 'bg-gray-400'
                    }`}>
                      {owner.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{owner.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Building2 size={14} /> {owner.business}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlanBadge(owner.plan)}`}>
                      {owner.plan}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusBadge(owner.status)}`}>
                      {owner.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {owner.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Mail size={14} /> {owner.email}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone size={14} /> {owner.phone}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} /> Since {owner.since}
                  </p>
                  {owner.subscriptionEnd && (
                    <p className={`text-xs flex items-center gap-1 ${expired ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      <Crown size={12} /> 
                      {expired ? '⚠️ Subscription Expired' : `Renews: ${owner.subscriptionEnd}`}
                    </p>
                  )}
                </div>

                {showExpiredWarning && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                    ⚠️ Subscription expired. Please renew to keep active.
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <button 
                    onClick={() => viewOwner(owner)} 
                    className="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button 
                    onClick={() => startEdit(owner)} 
                    className="flex-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg border border-green-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => toggleStatus(owner.id)} 
                    className={`flex-1 px-3 py-1.5 text-sm rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                      owner.status === 'Active'
                        ? 'text-red-600 hover:bg-red-50 border-red-200'
                        : 'text-green-600 hover:bg-green-50 border-green-200'
                    }`}
                  >
                    {owner.status === 'Active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    {owner.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== ADD/EDIT MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingOwner ? 'Edit Business Owner' : 'Add Business Owner'}
              </h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingOwner(null);
                  setFormData({ name: '', business: '', email: '', phone: '', plan: 'Basic', status: 'Active', subscriptionEnd: '', address: '' });
                }} 
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editingOwner ? handleUpdateOwner : handleAddOwner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Abebe Kebede"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Habesha Café"
                  value={formData.business}
                  onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="owner@example.com"
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
                  placeholder="+251 91 234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription End Date</label>
                <input
                  type="date"
                  value={formData.subscriptionEnd}
                  onChange={(e) => setFormData({ ...formData, subscriptionEnd: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">If expired, owner will be deactivated</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Addis Ababa, Ethiopia"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingOwner(null);
                    setFormData({ name: '', business: '', email: '', phone: '', plan: 'Basic', status: 'Active', subscriptionEnd: '', address: '' });
                  }}
                  className="flex-1 border border-gray-200 text-gray-700 text-sm py-2.5 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-700"
                >
                  {editingOwner ? 'Update Owner' : 'Add Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== VIEW MODAL ===== */}
      {showViewModal && selectedOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Business Owner Details</h3>
              <button onClick={() => setShowViewModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${
                  selectedOwner.status === 'Active' ? 'bg-green-500' : 
                  selectedOwner.status === 'Suspended' ? 'bg-red-500' : 'bg-gray-400'
                }`}>
                  {selectedOwner.initials}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedOwner.name}</h4>
                  <p className="text-sm text-gray-500">{selectedOwner.business}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlanBadge(selectedOwner.plan)}`}>
                      {selectedOwner.plan}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusBadge(selectedOwner.status)}`}>
                      {selectedOwner.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {selectedOwner.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOwner.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOwner.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Since</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOwner.since}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Subscription</p>
                  <p className={`text-sm font-medium ${isSubscriptionExpired(selectedOwner.subscriptionEnd) ? 'text-red-500' : 'text-gray-900'}`}>
                    {selectedOwner.subscriptionEnd || 'N/A'}
                    {isSubscriptionExpired(selectedOwner.subscriptionEnd) && ' ⚠️ Expired'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOwner.address}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowViewModal(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm py-2.5 rounded-lg hover:bg-gray-50">
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    startEdit(selectedOwner);
                  }}
                  className="flex-1 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-700"
                >
                  Edit Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default BusinessOwners;