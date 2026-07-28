import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { getStoredUser } from '../../utils/auth';

export default function Profile() {
  const user = getStoredUser();
  const [saved, setSaved] = useState(false);
  
  const handleSave = (e) => { 
    e.preventDefault(); 
    setSaved(true); 
    setTimeout(() => setSaved(false), 2000); 
  };
  
  return (
    <div>
      <PageHeader title="My Profile" subtitle="View and update your information" />
      <div className="max-w-xl bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.avatar || 'C'}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.name || 'Cashier'}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_',' ') || 'Cashier'}</p>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input defaultValue={user?.name} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input defaultValue={user?.email} type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" placeholder="Leave blank to keep current" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button type="submit" className="bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors">
            {saved ? 'Saved ✓' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}