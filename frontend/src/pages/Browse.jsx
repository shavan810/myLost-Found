import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';

const CATEGORIES = ['Electronics', 'Jewelry', 'Documents', 'Clothing', 'Bags', 'Keys', 'Wallet', 'Pet', 'Vehicle', 'Other'];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    search: searchParams.get('search') || '',
    page: 1,
    sort: '-createdAt'
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await api.get('/items', { params });
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const setFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val, page: 1 }));
    setSearchParams(prev => { val ? prev.set(key, val) : prev.delete(key); return prev; });
  };

  const clearFilters = () => {
    setFilters({ type: '', category: '', city: '', search: '', page: 1, sort: '-createdAt' });
    setSearchParams({});
  };

  const hasActiveFilters = filters.type || filters.category || filters.city || filters.search;

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                placeholder="Search items..."
                className="input-field pl-9 py-2.5 text-sm"
              />
            </div>

            {/* Type Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {[{ val: '', label: 'All' }, { val: 'lost', label: '🔴 Lost' }, { val: 'found', label: '🟢 Found' }].map(t => (
                <button key={t.val} onClick={() => setFilter('type', t.val)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filters.type === t.val ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary text-sm flex items-center gap-2 ${hasActiveFilters ? 'border-primary-300 text-primary-600' : ''}`}>
              <Filter className="w-4 h-4" />
              Filters {hasActiveFilters && <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center">!</span>}
            </button>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-slate-400 hover:text-danger-500 flex items-center gap-1 transition-colors">
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3 animate-fade-in">
              <div className="flex-1 min-w-40">
                <select value={filters.category} onChange={e => setFilter('category', e.target.value)} className="input-field text-sm py-2">
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-40">
                <input value={filters.city} onChange={e => setFilter('city', e.target.value)} placeholder="Filter by city..." className="input-field text-sm py-2" />
              </div>
              <div className="flex-1 min-w-40">
                <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)} className="input-field text-sm py-2">
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="-views">Most Viewed</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {loading ? 'Loading...' : `${total} item${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-64 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display font-semibold text-xl text-slate-700 mb-2">No items found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn-secondary text-sm">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))} disabled={filters.page === 1} className="btn-secondary p-2 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i} onClick={() => setFilters(p => ({ ...p, page: i + 1 }))}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${filters.page === i + 1 ? 'bg-primary-600 text-white shadow-glow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))} disabled={filters.page === pages} className="btn-secondary p-2 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
