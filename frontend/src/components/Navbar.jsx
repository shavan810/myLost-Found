import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Menu, X, Plus, LogOut, User, LayoutDashboard, GitMerge } from 'lucide-react';
import api from '../utils/api';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
    setMenuOpen(false);
  }, [location, isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setUnread(data.unreadCount);
      setNotifications(data.notifications.slice(0, 5));
    } catch {}
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/browse', label: 'Browse Items' },
    { to: '/browse?type=lost', label: 'Lost' },
    { to: '/browse?type=found', label: 'Found' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || menuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-white/80 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">Find<span className="text-primary-600">Back</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname + location.search === link.to ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/report" className="hidden sm:flex btn-primary text-sm items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Report Item
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) { fetchNotifications(); api.put('/notifications/mark-read').catch(() => {}); setUnread(0); } }}
                    className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <Bell className="w-5 h-5 text-slate-600" />
                    {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unread > 9 ? '9+' : unread}</span>}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-800">Notifications</span>
                        <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center text-slate-400 text-sm py-6">No notifications</p>
                        ) : notifications.map(n => (
                          <div key={n._id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-primary-50/40' : ''}`}>
                            <p className="text-sm font-medium text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2 border-t border-slate-100">
                        <Link to="/dashboard" onClick={() => setNotifOpen(false)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">View all in dashboard →</Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-sm text-slate-800">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                    <Link to="/matches" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"><GitMerge className="w-4 h-4" /> My Matches</Link>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"><User className="w-4 h-4" /> Profile</Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors border-t border-slate-100"><LogOut className="w-4 h-4" /> Logout</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 animate-fade-in">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">{link.label}</Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/report" className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors"><Plus className="w-4 h-4" /> Report Item</Link>
                <Link to="/dashboard" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Dashboard</Link>
                <Link to="/matches" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">My Matches</Link>
                <Link to="/profile" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Profile</Link>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"><LogOut className="w-4 h-4" /> Logout</button>
              </>
            ) : (
              <div className="flex gap-2 px-4 py-2">
                <Link to="/login" className="btn-secondary text-sm flex-1 text-center">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm flex-1 text-center">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
