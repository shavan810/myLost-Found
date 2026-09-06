import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Package, CheckCircle, TrendingUp, ArrowRight, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

const StatCard = ({ label, value, icon: Icon, gradient, sub, to }) => (
  <Link to={to || '#'} className="group bg-slate-900 border border-slate-800/60 hover:border-slate-700 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 block">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors" />
    </div>
    <p className="font-display font-bold text-3xl text-white">{value ?? '—'}</p>
    <p className="text-slate-400 text-sm mt-1">{label}</p>
    {sub && <p className="text-slate-600 text-xs mt-0.5">{sub}</p>}
  </Link>
);

export default function AdminDashboard() {
  const { api } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const { data: res } = await api.get('/admin/stats');
      setData(res);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Delete this item permanently?')) return;
    try {
      await api.delete(`/admin/items/${id}`);
      toast.success('Item deleted');
      fetchStats();
    } catch { toast.error('Delete failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user and all their items?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchStats();
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  const { stats, recentUsers, lostItems, foundItems, categoryStats } = data || {};
  const maxCat = Math.max(...(categoryStats?.map(c => c.count) || [1]));

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8 animate-fade-in">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} gradient="from-blue-500 to-blue-700" to="/admin/users" sub="Registered users" />
          <StatCard label="Lost Items" value={stats?.totalLost} icon={Search} gradient="from-red-500 to-rose-700" to="/admin/lost-items" sub="Active reports" />
          <StatCard label="Found Items" value={stats?.totalFound} icon={Package} gradient="from-emerald-500 to-green-700" to="/admin/found-items" sub="Active reports" />
          <StatCard label="Resolved" value={stats?.totalResolved} icon={CheckCircle} gradient="from-violet-500 to-purple-700" sub="Successfully returned" />
        </div>

        {/* Success rate bar */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-slate-200">Platform Success Rate</span>
            </div>
            <span className="font-display font-bold text-emerald-400 text-lg">
              {stats?.totalLost > 0 ? Math.round((stats.totalResolved / (stats.totalLost + stats.totalFound)) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2.5 rounded-full transition-all duration-1000"
              style={{ width: `${stats?.totalLost > 0 ? Math.round((stats.totalResolved / (stats.totalLost + stats.totalFound)) * 100) : 0}%` }} />
          </div>
          <p className="text-slate-500 text-xs mt-2">{stats?.totalResolved} items successfully returned out of {(stats?.totalLost || 0) + (stats?.totalFound || 0)} total reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category breakdown */}
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <h3 className="font-display font-semibold text-slate-100 mb-4 text-sm uppercase tracking-wider">Items by Category</h3>
            <div className="space-y-3">
              {categoryStats?.map(cat => (
                <div key={cat._id} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-20 flex-shrink-0 truncate">{cat._id}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-blue-500 to-violet-500 h-1.5 rounded-full"
                      style={{ width: `${Math.round((cat.count / maxCat) * 100)}%` }} />
                  </div>
                  <span className="text-xs text-slate-300 w-4 text-right font-mono">{cat.count}</span>
                </div>
              ))}
              {!categoryStats?.length && <p className="text-slate-600 text-sm text-center py-4">No data yet</p>}
            </div>
          </div>

          {/* Recent Users */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-slate-100 text-sm uppercase tracking-wider">Recent Users</h3>
              <Link to="/admin/users" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentUsers?.map(user => (
                <div key={user._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {user.isVerified
                      ? <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full">Verified</span>
                      : <span className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">Unverified</span>}
                    {user.isBanned && <span className="text-xs bg-red-900/40 text-red-400 border border-red-800/50 px-2 py-0.5 rounded-full">Banned</span>}
                    <button onClick={() => handleDeleteUser(user._id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {!recentUsers?.length && <p className="text-slate-600 text-sm text-center py-4">No users yet</p>}
            </div>
          </div>
        </div>

        {/* Lost Items Preview */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <h3 className="font-display font-semibold text-slate-100 text-sm uppercase tracking-wider">Recent Lost Items</h3>
            </div>
            <Link to="/admin/lost-items" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lostItems?.map(item => (
              <ItemMiniCard key={item._id} item={item} onDelete={handleDeleteItem} type="lost" />
            ))}
            {!lostItems?.length && <p className="text-slate-600 text-sm col-span-3 text-center py-4">No lost items reported yet</p>}
          </div>
        </div>

        {/* Found Items Preview */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <h3 className="font-display font-semibold text-slate-100 text-sm uppercase tracking-wider">Recent Found Items</h3>
            </div>
            <Link to="/admin/found-items" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {foundItems?.map(item => (
              <ItemMiniCard key={item._id} item={item} onDelete={handleDeleteItem} type="found" />
            ))}
            {!foundItems?.length && <p className="text-slate-600 text-sm col-span-3 text-center py-4">No found items reported yet</p>}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

function ItemMiniCard({ item, onDelete, type }) {
  return (
    <div className="group bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {item.images?.[0]
            ? <img src={item.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
            : <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">{type === 'lost' ? '🔴' : '🟢'}</div>}
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{item.title}</p>
            <p className="text-xs text-slate-500 truncate">{item.category}</p>
          </div>
        </div>
        <button onClick={() => onDelete(item._id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg transition-all flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 truncate">{item.location?.city}</p>
        <p className="text-xs text-slate-600">{format(new Date(item.createdAt), 'MMM d')}</p>
      </div>
      <p className="text-xs text-slate-500 mt-1 truncate">by {item.reporter?.name}</p>
    </div>
  );
}
