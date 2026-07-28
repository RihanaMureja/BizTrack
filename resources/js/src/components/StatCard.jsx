import clsx from 'clsx';

export default function StatCard({ label, value, sub, icon: Icon, iconBg, trend }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      {Icon && (
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', iconBg || 'bg-green-100')}>
          <Icon className="w-6 h-6 text-green-600" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        {sub && <p className={clsx('text-xs mt-0.5', trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-500')}>{sub}</p>}
      </div>
    </div>
  );
}