import React from 'react';
import BusinessLayout from './BusinessLayout';
const Reports = () => {
  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Generate business reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900">Profit & Loss</h3>
            <p className="text-sm text-gray-500 mt-1">View your P&L statement</p>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Generate Report</button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900">Revenue Report</h3>
            <p className="text-sm text-gray-500 mt-1">View revenue analytics</p>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Generate Report</button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900">Expense Report</h3>
            <p className="text-sm text-gray-500 mt-1">View expense analytics</p>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Generate Report</button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900">Inventory Report</h3>
            <p className="text-sm text-gray-500 mt-1">View inventory analytics</p>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Generate Report</button>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default Reports;