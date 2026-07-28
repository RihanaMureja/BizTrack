import React from 'react';
import { Search, Bell, Globe, Moon } from 'lucide-react';

const AdminTopbar = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Globe className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Moon className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">SA</div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">Super Admin</p>
            <p className="text-xs text-gray-500 leading-tight">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;