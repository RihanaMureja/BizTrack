import React from 'react';

const AdminStatsCards = ({ stats = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((item, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">{item.label}</span>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
              <item.icon size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{item.value}</p>
          <p className={`text-sm mt-1 ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {item.change} vs last period
          </p>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsCards;