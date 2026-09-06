import { useState, useEffect } from 'react';
import { Search, Trash2, MapPin, Calendar, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

const CATEGORIES = ['Electronics','Jewelry','Documents','Clothing','Bags','Keys','Wallet','Pet','Vehicle','Other'];

export default function AdminItems({ type }) {
  const { api } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid | table

  const isLost = type === 'lost';
  const title = isLost ? 'Lost Items' : 'Found Items';
  const accent = isLost ? 'red' : 'emerald';

  useEffect(() => { fetchItems(); }, [page, search, category, status, type]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/items', { params: { page, limit: 12, type, search, category, status } });
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load items'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/admin/items/${deleteModal._id}`);
      toast.success('Item deleted successfully');
      setDeleteModal(null);
      fetchItems();
    } catch { toast.error('Delete failed'); }
  };

  const statusColors = {
    active: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
    matched: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/40',
    resolved: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
    closed: 'bg-slate-800 text-slate-500 border-slate-700'
  };

  return (
    <AdminLayout title={title}>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${accent}-500/10 border border-${accent}-500/20 rounded-xl flex items-center justify-center`}>
            {isLost ? <Search className={`w-5 h-5 text-${accent}-400`} /> : <Package className={`w-5 h-5 text-${accent}-400`} />}
          </div>
          <div>
            <p className="font-display font-bold text-xl text-white">{total} {title}</p>
            <p className="text-slate-500 text-sm">View and manage all {type} item reports</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={`Search ${type} items...`}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="matched">Matched</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Grid View */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">{isLost ? '🔍' : '📦'}</div>
            <p className="text-slate-400 font-semibold">No {type} items found</p>
            <p className="text-slate-600 text-sm mt-1">Try changing your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => (
              <div key={item._id} className="group bg-slate-900 border border-slate-800/60 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20">
                {/* Image */}
                <div className="relative h-36 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">{isLost ? '🔴' : '🟢'}</div>}
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${isLost ? 'bg-red-900/70 text-red-300 border-red-700/50' : 'bg-emerald-900/70 text-emerald-300 border-emerald-700/50'}`}>
                      {type}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[item.status] || statusColors.active}`}>
                      {item.status}
                    </span>
                  </div>
                  {/* Delete on hover */}
                  <button onClick={() => setDeleteModal(item)}
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-2 bg-red-600/90 text-white rounded-lg transition-all hover:bg-red-600 shadow-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="font-semibold text-slate-200 text-sm truncate">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3 h-3 text-blue-400" />
                      <span className="truncate">{item.location?.city || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      <span>{format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                        {item.reporter?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-500 truncate max-w-24">{item.reporter?.name}</span>
                    </div>
                    <button onClick={() => setDeleteModal(item)}
                      className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-white text-center mb-1">Delete Item?</h3>
            <p className="text-slate-400 text-sm text-center mb-1">
              Permanently delete <span className="text-white font-semibold">"{deleteModal.title}"</span>?
            </p>
            <p className="text-slate-600 text-xs text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
                Delete
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
