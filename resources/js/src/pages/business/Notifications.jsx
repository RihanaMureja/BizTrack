import React from 'react';
import BusinessLayout from './BusinessLayout';
const BusinessNotifications = () => {
  const notifications = [
    { title: 'New sale recorded', description: 'Sale of ETB 4,800 from Tigist Alemu', time: '5 min ago' },
    { title: 'Low stock alert', description: 'Printer Paper is running low – only 4 units remaining', time: '1 hour ago' },
    { title: 'Payment received', description: 'Chapa payment of ETB 12,500 confirmed', time: '3 hours ago' },
  ];

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Stay updated with your business activity</p>
        </div>

        <div className="space-y-3">
          {notifications.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessNotifications;