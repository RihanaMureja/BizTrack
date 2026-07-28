import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const ActivityLogs = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-500">User activity and system logs</p>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-500">Activity logs coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ActivityLogs;  // ✅ THIS IS THE IMPORTANT PART