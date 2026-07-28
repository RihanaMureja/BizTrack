import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { TrendingUp, Users, Wallet, Briefcase } from 'lucide-react';

export default function Reports() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Platform-wide analytics" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue"     value="ETB 482,300" icon={Wallet}    iconBg="bg-green-100"  trend="up" sub="+18% vs last month" />
        <StatCard label="Active Businesses" value="98"          icon={Briefcase} iconBg="bg-blue-100"   trend="up" sub="+4 this week" />
        <StatCard label="New Customers"     value="203"         icon={Users}     iconBg="bg-purple-100" trend="up" sub="This month" />
        <StatCard label="Transactions"      value="1,482"       icon={TrendingUp} iconBg="bg-orange-100" trend="up" sub="This month" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-gray-400 text-sm text-center py-12">Charts will render here once connected to real API data.</p>
      </div>
    </div>
  );
}