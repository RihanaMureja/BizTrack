import { Link } from 'react-router-dom';
import { BarChart3, Users, ShoppingCart, FileText, ArrowRight } from 'lucide-react';

const features = [
  { icon: BarChart3, title: 'Revenue Tracking',    desc: 'Monitor your income and expenses in real time.' },
  { icon: ShoppingCart, title: 'Sales & Inventory', desc: 'Manage products, stock levels, and point-of-sale.' },
  { icon: Users, title: 'Customer Management',     desc: 'Track customers, credit balances, and histories.' },
  { icon: FileText, title: 'Reports & Analytics',  desc: 'Gain insights with detailed financial reports.' },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center pt-24 pb-16 px-4">
        <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <span className="text-3xl font-black text-white">BT</span>
        </div>
        <h1 className="text-5xl font-black text-gray-900 mb-4">
          Welcome to <span className="text-green-600">BizTrack</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-lg mb-10">
          The complete business management platform for Ethiopian small businesses.
          Track revenue, expenses, inventory, and more — all in one place.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link to="/register" className="flex items-center gap-2 px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-lg">
            Get Started Free <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-lg">
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 pb-24 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center pb-8 text-xs text-gray-400">© 2025 BizTrack · Built for Ethiopian businesses · ETB currency</p>
    </div>
  );
}
