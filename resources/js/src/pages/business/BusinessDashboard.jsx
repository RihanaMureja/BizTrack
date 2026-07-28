import React from 'react';
import BusinessLayout from './BusinessLayout';
const BusinessDashboard = () => {
  const stats = [
    { label: 'Revenue', value: 'ETB 159,300', change: '+12.4%', color: 'text-green-600' },
    { label: 'Expenses', value: 'ETB 76,500', change: '+4.1%', color: 'text-red-600' },
    { label: 'Net Profit', value: 'ETB 82,800', change: '+8.7%', color: 'text-blue-600' },
    { label: 'Inventory', value: '2,450 items', change: '+3.2%', color: 'text-yellow-600' },
  ];

  const recentTransactions = [
    { date: 'Jul 22, 2026', category: 'Sales', amount: 'ETB 4,800', status: 'Paid' },
    { date: 'Jul 22, 2026', category: 'Expense', amount: 'ETB 1,250', status: 'Pending' },
    { date: 'Jul 21, 2026', category: 'Sales', amount: 'ETB 2,300', status: 'Paid' },
    { date: 'Jul 21, 2026', category: 'Expense', amount: 'ETB 700', status: 'Paid' },
  ];

  const chartData = [
    { month: 'Jan', revenue: 65, expense: 45 },
    { month: 'Feb', revenue: 75, expense: 50 },
    { month: 'Mar', revenue: 85, expense: 55 },
    { month: 'Apr', revenue: 70, expense: 48 },
    { month: 'May', revenue: 90, expense: 60 },
    { month: 'Jun', revenue: 95, expense: 65 },
    { month: 'Jul', revenue: 85, expense: 58 },
  ];

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, Abebe! 😊</h2>
            <p className="text-gray-500">Here's what's happening with your business today.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">July 22, 2026</span>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">A</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
              <p className={`text-sm mt-1 ${item.color}`}>{item.change} vs last period</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
          <div className="h-48 flex items-end gap-4">
            {chartData.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center gap-1">
                  <div className="w-full bg-green-500 rounded-t" style={{ height: `${item.revenue}%` }} />
                  <div className="w-full bg-red-400 rounded-t" style={{ height: `${item.expense}%` }} />
                </div>
                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <span className="text-xs flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Revenue</span>
            <span className="text-xs flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded"></span> Expenses</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTransactions.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{item.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.category}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessDashboard;