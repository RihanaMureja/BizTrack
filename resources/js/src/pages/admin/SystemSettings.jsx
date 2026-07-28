import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Settings, 
  Mail, 
  Key, 
  Shield, 
  Palette, 
  Users, 
  Save, 
  Upload,
  Globe,
  Phone,
  MapPin
} from 'lucide-react';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'email', label: 'Email (SMTP)', icon: Mail },
    { id: 'chapa', label: 'Chapa API', icon: Key },
    { id: 'roles', label: 'Roles & Permissions', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'theme', label: 'Theme', icon: Palette },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500">Configure platform-wide settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
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
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input type="text" value="BizTrack PLC" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                  <input type="email" value="support@biztrack.et" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value="+251911000000" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value="Bole Sub City, Addis Ababa" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                    <Upload size={24} />
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Upload Logo
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Theme Customization</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-4">
                  <input type="color" value="#16A34A" className="w-16 h-16 rounded-lg cursor-pointer border border-gray-200" />
                  <input type="text" value="#16A34A" className="px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dark Mode</label>
                <div className="flex items-center gap-4">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Light</button>
                  <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">Dark</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">SMTP Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                  <input type="text" value="smtp.gmail.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                  <input type="number" value="587" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input type="text" value="noreply@biztrack.et" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" value="********" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chapa' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Chapa API Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input type="password" value="chapa_live_xxxxxxxxxxxx" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                  <input type="password" value="whsec_xxxxxxxxxxxx" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option>Sandbox</option>
                    <option>Production</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Roles & Permissions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Users</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Permissions</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-3 px-4 font-medium">Super Admin</td>
                      <td className="py-3 px-4 text-sm text-gray-600">1</td>
                      <td className="py-3 px-4"><span className="text-sm text-green-600">Full Access</span></td>
                      <td className="py-3 px-4"><button className="text-sm text-blue-600">Edit</button></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Business Owner</td>
                      <td className="py-3 px-4 text-sm text-gray-600">7</td>
                      <td className="py-3 px-4"><span className="text-sm text-gray-600">Business Management</span></td>
                      <td className="py-3 px-4"><button className="text-sm text-blue-600">Edit</button></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Cashier</td>
                      <td className="py-3 px-4 text-sm text-gray-600">12</td>
                      <td className="py-3 px-4"><span className="text-sm text-gray-600">POS & Sales</span></td>
                      <td className="py-3 px-4"><button className="text-sm text-blue-600">Edit</button></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Customer</td>
                      <td className="py-3 px-4 text-sm text-gray-600">6</td>
                      <td className="py-3 px-4"><span className="text-sm text-gray-600">View Only</span></td>
                      <td className="py-3 px-4"><button className="text-sm text-blue-600">Edit</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
                  </div>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg">Enabled</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Session Timeout</p>
                    <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                  </div>
                  <select className="px-4 py-2 border border-gray-200 rounded-lg">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Password Policy</p>
                    <p className="text-sm text-gray-500">Minimum 8 characters, special characters required</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Configure</button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemSettings;