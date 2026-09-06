import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { GitMerge, ArrowRight } from 'lucide-react';
import api from '../utils/api';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600' },
  acknowledged: { label: 'OTP Sent', color: 'bg-warning-50 text-warning-700' },
  verified: { label: 'Verifying', color: 'bg-primary-50 text-primary-700' },
  resolved: { label: 'Resolved ✅', color: 'bg-success-50 text-success-700' },
  rejected: { label: 'Rejected', color: 'bg-danger-50 text-danger-600' }
};

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/matches').then(({ data }) => setMatches(data.matches)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? matches : matches.filter(m => m.status === filter);

  if (loading) return <div className="pt-24 min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-slate-900">My Matches</h1>
          <p className="text-slate-500 mt-1">Potential matches found for your reported items</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {['all', 'pending', 'acknowledged', 'verified', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all capitalize ${filter === f ? 'bg-primary-600 text-white shadow-glow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <GitMerge className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-xl text-slate-700 mb-2">No matches found</h3>
            <p className="text-slate-400 mb-6">Our system continuously looks for matches as new items are reported.</p>
            <Link to="/report" className="btn-primary inline-flex items-center gap-2">Report an Item</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(match => (
              <Link to={`/matches/${match._id}`} key={match._id} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:shadow-lg transition-all group">
                {/* Score */}
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-display font-bold ${match.score >= 70 ? 'bg-success-50 text-success-700' : match.score >= 40 ? 'bg-warning-50 text-warning-700' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="text-xl">{match.score}</span>
                  <span className="text-xs">%</span>
                </div>

                {/* Items */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="badge-lost text-xs">Lost</span>
                      <span className="font-semibold text-slate-800 truncate">{match.lostItem?.title}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block flex-shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="badge-found text-xs">Found</span>
                      <span className="font-semibold text-slate-800 truncate">{match.foundItem?.title}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {match.matchReasons?.slice(0, 3).map((r, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">Matched on {format(new Date(match.createdAt), 'MMM d, yyyy')}</p>
                </div>

                {/* Status */}
                <div className="flex-shrink-0 flex flex-row sm:flex-col items-center sm:items-end gap-3">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusConfig[match.status]?.color}`}>
                    {statusConfig[match.status]?.label}
                  </span>
                  <span className="text-xs text-primary-600 font-medium group-hover:underline">View details →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
