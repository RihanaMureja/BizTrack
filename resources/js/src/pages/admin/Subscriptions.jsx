import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Check, AlertTriangle, Crown, Users, CreditCard } from 'lucide-react';

const Subscriptions = () => {
  const plans = [
    {
      name: 'Basic',
      price: 'ETB 299',
      period: '/month',
      enrolled: '312 businesses',
      features: ['1 Cashier', '500 Transactions/mo', 'Basic Reports', 'Email Support'],
      popular: false,
      color: 'border-gray-200',
    },
    {
      name: 'Standard',
      price: 'ETB 599',
      period: '/month',
      enrolled: '487 businesses',
      features: ['5 Cashiers', '5,000 Transactions/mo', 'Advanced Reports', 'Priority Support', 'SMS Alerts'],
      popular: true,
      color: 'border-green-500 ring-2 ring-green-500/20',
    },
    {
      name: 'Premium',
      price: 'ETB 1,199',
      period: '/month',
      enrolled: '325 businesses',
      features: ['Unlimited Cashiers', 'Unlimited Transactions', 'Full Analytics', '24/7 Support', 'Custom Branding', 'API Access'],
      popular: false,
      color: 'border-purple-200',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription & Payments</h1>
            <p className="text-gray-500">Manage plans, billing, and renewals</p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg text-sm">
            <AlertTriangle size={16} />
            <span>2 subscriptions expiring within 7 days</span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div key={index} className={`bg-white rounded-xl shadow-sm border p-6 relative ${plan.color}`}>
              {plan.popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                  Popular
                </span>
              )}
              <div className="text-center mt-2">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                  <Users size={14} /> {plan.enrolled}
                </p>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full mt-6 py-2.5 rounded-lg font-medium transition-colors ${
                plan.popular 
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>

        {/* Revenue Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-600">ETB 1.2M</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500">Annual Revenue</p>
              <p className="text-2xl font-bold text-blue-600">ETB 14.4M</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-500">Avg. Revenue/Business</p>
              <p className="text-2xl font-bold text-purple-600">ETB 4,433</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Subscriptions
;