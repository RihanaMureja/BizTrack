import React from 'react';
import BusinessLayout from './BusinessLayout';
const BusinessProfile = () => {
  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-gray-500">Manage your business information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input type="text" value="Habesha Café" className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
              <input type="text" value="Abebe Kebede" className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value="abebe@habesha.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value="+25191234567" className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save Changes</button>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessProfile;