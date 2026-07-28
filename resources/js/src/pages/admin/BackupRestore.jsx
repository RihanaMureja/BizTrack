import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const BackupRestore = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
        <p className="text-gray-500">Manage backups and restore data</p>
      </div>
    </AdminLayout>
  );
};

export default BackupRestore;