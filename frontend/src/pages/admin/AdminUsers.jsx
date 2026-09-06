import { useState, useEffect } from 'react';
import { Search, Trash2, Ban, CheckCircle, ChevronLeft, ChevronRight, UserX, Users } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminUsers() {
  const { api } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => { fetchUsers(); }, [page, search, status]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { page, limit: 12, search, status } });
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleBan = async (user) => {
    setActionLoading(user._id + 'ban');
    try {
      const { data } = await api.put(`/admin/users/${user._id}/ban`);
      toast.success(data.message);
      fetchUsers();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(deleteModal._id + 'del');
    try {
      await api.delete(`/admin/users/${deleteModal._id}`);
      toast.success('User deleted successfully');
      setDeleteModal(null);
      fetchUsers();
    } catch (error) { toast.error(error.response?.data?.message || 'Delete failed'); }
    finally { setActionLoading(''); }
  };

  const statusFilters = [
    { val: '', label: 'All Users' },
    { val: 'verified', label: 'Verified' },
    { val: 'unverified', label: 'Unverified' },
    { val: 'banned', label: 'Banned' },
  ];

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-white">{total} Users</p>
              <p className="text-slate-500 text-sm">Manage all registered users</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {statusFilters.map(f => (
              <button key={f.val} onClick={() => { setStatus(f.val); setPage(1); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${status === f.val ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/60">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-10 bg-slate-800/60 rounded-xl animate-pulse" />
                      </td>
                    </tr>
                  ))
                  : users.map(user => (
                    <tr key={user._id} className={`hover:bg-slate-800/30 transition-colors group ${user.isBanned ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user.name[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell">{user.phone || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {user.isVerified
                            ? <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-full">✓ Verified</span>
                            : <span className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">Unverified</span>}
                          {user.isBanned && <span className="text-xs bg-red-900/40 text-red-400 border border-red-800/40 px-2 py-0.5 rounded-full">Banned</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleBan(user)}
                            disabled={actionLoading === user._id + 'ban'}
                            title={user.isBanned ? 'Unban user' : 'Ban user'}
                            className={`p-2 rounded-lg transition-all ${user.isBanned ? 'text-emerald-400 hover:bg-emerald-900/30' : 'text-orange-400 hover:bg-orange-900/30'} disabled:opacity-40`}>
                            {user.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setDeleteModal(user)} title="Delete user"
                            className="p-2 rounded-lg text-red-400 hover:bg-red-900/30 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {!loading && users.length === 0 && (
            <div className="text-center py-16">
              <UserX className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No users found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-sm disabled:opacity-40 hover:border-slate-700 transition-all">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-slate-400 text-sm">Page <span className="text-white font-semibold">{page}</span> of {pages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === pages}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-sm disabled:opacity-40 hover:border-slate-700 transition-all">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-white text-center mb-1">Delete User?</h3>
            <p className="text-slate-400 text-sm text-center mb-1">
              You're about to permanently delete <span className="text-white font-semibold">{deleteModal.name}</span>.
            </p>
            <p className="text-slate-500 text-xs text-center mb-6">All their reported items will also be deleted. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={!!actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60">
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
