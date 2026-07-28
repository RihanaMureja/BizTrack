import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const ChapaTransactions = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Chapa Transactions</h1>
        <p className="text-gray-500">View all Chapa payment transactions</p>
      </div>
    </AdminLayout>
  );
};

export default ChapaTransactions;