import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logout } from '../utils/auth';
import clsx from 'clsx';

export default function Sidebar({ title, subtitle, navItems, user }) {
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-56 flex-shrink-0 bg-gray-900 min-h-screen flex flex-col">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700/50">
        <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-base leading-tight">BizTrack</p>
          {subtitle && <p className="text-gray-400 text-xs leading-tight truncate">{subtitle}</p>}
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (item.type === 'section') {
            return <p key={item.label} className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3 pt-4 pb-1.5">{item.label}</p>;
          }
          return (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => clsx('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200', isActive ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/60')}>
              {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
              <span className="truncate">{item.label}</span>
              {item.badge && <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{item.badge}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-gray-700/50 px-3 py-3 space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0', user.avatarColor || 'bg-green-600')}>
              {user.avatar || user.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-gray-400 text-xs truncate">{user.roleLabel || user.role}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200 w-full text-sm font-medium">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}