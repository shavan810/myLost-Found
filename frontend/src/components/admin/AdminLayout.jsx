import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Shield, LayoutDashboard, Users, Package, Search, LogOut, Menu, X, Bell, ChevronRight } from 'lucide-react';

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/lost-items', label: 'Lost Items', icon: Search },
  { to: '/admin/found-items', label: 'Found Items', icon: Package },
];

export default function AdminLayout({ children, title }) {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/admin/login'); };
  const isActive = (to) => location.pathname === to;

  return (
    <div className="min-h-screen bg-slate-950 flex font-body">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800/60 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand */}
        <div className="p-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-base leading-none">FindBack</p>
              <p className="text-slate-500 text-xs mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive(item.to)
                  ? 'bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/30 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}>
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive(item.to) ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="flex-1">{item.label}</span>
              {isActive(item.to) && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>
          ))}
        </nav>

        {/* Admin Info */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {admin?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{admin?.name}</p>
              <p className="text-xs text-slate-500 truncate">{admin?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/60 flex items-center gap-4 px-4 sm:px-6 sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="lg:hidden text-slate-400 hover:text-white transition-colors p-1">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-slate-100 text-lg truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors hidden sm:block">← Live Site</Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
              {admin?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
