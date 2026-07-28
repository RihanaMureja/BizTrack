import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Key, 
  Smartphone,
  Save,
  Edit,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const AdminProfilePage = () => {
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: 'Personal Info', icon: User },
    { id: 'password', label: 'Change Password', icon: Key },
    { id: '2fa', label: 'Two-Factor Auth', icon: Shield },
    { id: 'devices', label: 'Login Devices', icon: Smartphone },
  ];

  const devices = [
    { name: 'Chrome on Windows', location: 'Addis Ababa, Ethiopia', ip: '192.168.1.1', lastActive: 'Now', current: true },
    { name: 'Firefox on Mac', location: 'Addis Ababa, Ethiopia', ip: '192.168.1.2', lastActive: '2 hours ago', current: false },
    { name: 'Safari on iPhone', location: 'Addis Ababa, Ethiopia', ip: '192.168.1.3', lastActive: '1 day ago', current: false },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrator Profile</h1>
          <p className="text-gray-500">Super Admin · System Administrator</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-3xl">
              SA
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Super Admin</h2>
              <p className="text-gray-500">admin@biztrack.et</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  System Administrator
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Super Admin
                </span>
              </div>
            </div>
            <button className="ml-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Edit size={16} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-200 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" value="Super" className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" value="Admin" className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" value="admin@biztrack.et" className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" placeholder="Not set" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <Save size={16} /> Update Profile
              </button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <div className="grid grid-cols-1 max-w-md gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Change Password
              </button>
            </div>
          )}

          {activeTab === '2fa' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="font-medium text-green-700">2FA is currently enabled</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Your account is protected with two-factor authentication.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Authenticator App</p>
                    <p className="text-sm text-gray-500">Use Google Authenticator or similar</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Setup</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Recovery Codes</p>
                    <p className="text-sm text-gray-500">Generate backup codes for emergencies</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Generate</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
              <div className="space-y-3">
                {devices.map((device, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                    device.current ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{device.name}</p>
                        {device.current && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <CheckCircle size={12} /> Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{device.location} · {device.ip}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> Last active: {device.lastActive}
                      </p>
                    </div>
                    {!device.current && (
                      <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage;