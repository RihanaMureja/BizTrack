import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminStatsCards from '../../components/admin/AdminStatsCards';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  UserCog,
  Activity,
  CheckCircle,
  XCircle,
  BarChart3,
  DollarSign
} from 'lucide-react';

const AdminDashboard = () => {  // ✅ Changed from AdminDashboardPage to AdminDashboard
  const stats = [
    { label: 'Business Owners', value: '1,124', change: '+8.2%', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Businesses', value: '847', change: '+5.1%', icon: Building2, color: 'bg-green-100 text-green-600' },
    { label: 'Total Cashiers', value: '3,281', change: '+12.4%', icon: UserCog, color: 'bg-purple-100 text-purple-600' },
    { label: 'Total Revenue', value: 'ETB 487K', change: '+18.3%', icon: DollarSign, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Active Users', value: '4,252', change: '+3.7%', icon: Activity, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Storage Used', value: '1.2 GB', change: '-2.1%', icon: BarChart3, color: 'bg-red-100 text-red-600' },
  ];

  const monthlyRegistrations = [
    { month: 'Jan', count: 28 },
    { month: 'Feb', count: 32 },
    { month: 'Mar', count: 36 },
    { month: 'Apr', count: 27 },
    { month: 'May', count: 31 },
    { month: 'Jun', count: 42 },
    { month: 'Jul', count: 36 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Super Admin 🎉</h1>
          <p className="text-gray-500">Sunday, July 20, 2026 — Here's what's happening today.</p>
        </div>

        <AdminStatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Business Registrations</h3>
            <p className="text-sm text-gray-500 mb-4">New businesses joining BizTrack</p>
            <div className="h-48 flex items-end gap-4">
              {monthlyRegistrations.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                    style={{ height: `${(item.count / 42) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                  <span className="text-xs font-medium text-gray-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Status</h3>
            <p className="text-sm text-gray-500 mb-4">Active vs Inactive</p>
            <div className="flex items-center justify-center h-48 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full border-[16px] border-green-500 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">78%</span>
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700 flex items-center justify-center gap-1">
                  <CheckCircle size={16} className="text-green-500" />
                  Active
                </p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 rounded-full border-[16px] border-red-300 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">22%</span>
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700 flex items-center justify-center gap-1">
                  <XCircle size={16} className="text-red-500" />
                  Inactive
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;  // ✅ Changed from AdminDashboardPage to AdminDashboard