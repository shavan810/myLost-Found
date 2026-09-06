import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Search, GitMerge, CheckCircle, TrendingUp, Bell } from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      api.get('/items/my'),
      api.get('/matches'),
      api.get('/notifications')
    ]).then(([itemsRes, matchesRes, notifRes]) => {
      setMyItems(itemsRes.data.items);
      setMatches(matchesRes.data.matches);
      setNotifications(notifRes.data.notifications);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Items Reported', value: myItems.length, icon: Package, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Active Matches', value: matches.filter(m => m.status !== 'resolved').length, icon: GitMerge, color: 'text-accent-600', bg: 'bg-accent-50' },
    { label: 'Items Resolved', value: myItems.filter(i => i.status === 'resolved').length, icon: CheckCircle, color: 'text-success-700', bg: 'bg-success-50' },
    { label: 'Reputation', value: user?.reputation || 100, icon: TrendingUp, color: 'text-warning-700', bg: 'bg-warning-50' }
  ];

  const tabs = ['overview', 'my items', 'matches', 'notifications'];

  if (loading) return (
    <div className="pt-24 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
              Good to see you, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-500 mt-1">Manage your lost & found reports and track matches</p>
          </div>
          <Link to="/report" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Report Item
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="card p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-sm mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {tab === 'matches' && matches.filter(m => m.status !== 'resolved').length > 0
                ? `${tab} (${matches.filter(m => m.status !== 'resolved').length})`
                : tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Recent Matches */}
            {matches.slice(0, 3).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-lg text-slate-800">Recent Matches</h2>
                  <button onClick={() => setActiveTab('matches')} className="text-sm text-primary-600 hover:text-primary-700">View all</button>
                </div>
                <div className="space-y-3">
                  {matches.slice(0, 3).map(match => (
                    <Link to={`/matches/${match._id}`} key={match._id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${match.score >= 70 ? 'bg-success-500' : match.score >= 40 ? 'bg-warning-500' : 'bg-slate-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{match.lostItem?.title} ↔ {match.foundItem?.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{match.matchReasons?.slice(0, 2).join(' · ')}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold text-sm ${match.score >= 70 ? 'text-success-700' : match.score >= 40 ? 'text-warning-700' : 'text-slate-500'}`}>{match.score}%</p>
                        <p className="text-xs text-slate-400 capitalize">{match.status}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Items */}
            {myItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-lg text-slate-800">My Recent Items</h2>
                  <button onClick={() => setActiveTab('my items')} className="text-sm text-primary-600 hover:text-primary-700">View all</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myItems.slice(0, 3).map(item => <ItemCard key={item._id} item={item} />)}
                </div>
              </div>
            )}

            {myItems.length === 0 && matches.length === 0 && (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="font-display font-semibold text-xl text-slate-700 mb-2">No activity yet</h3>
                <p className="text-slate-400 mb-6">Start by reporting a lost or found item</p>
                <Link to="/report" className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Report First Item</Link>
              </div>
            )}
          </div>
        )}

        {/* My Items Tab */}
        {activeTab === 'my items' && (
          <div className="animate-fade-in">
            {myItems.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-slate-400 mb-4">You haven't reported any items yet.</p>
                <Link to="/report" className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Report Item</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myItems.map(item => <ItemCard key={item._id} item={item} />)}
              </div>
            )}
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-3 animate-fade-in">
            {matches.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">🎯</div>
                <p className="text-slate-400">No matches yet. Keep checking back as more items are reported.</p>
              </div>
            ) : matches.map(match => (
              <Link to={`/matches/${match._id}`} key={match._id} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-all group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg flex-shrink-0 ${match.score >= 70 ? 'bg-success-50 text-success-700' : match.score >= 40 ? 'bg-warning-50 text-warning-700' : 'bg-slate-100 text-slate-500'}`}>
                  {match.score}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{match.lostItem?.title} ↔ {match.foundItem?.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{match.matchReasons?.join(' · ')}</p>
                  <p className="text-xs text-slate-400 mt-1">Matched {format(new Date(match.createdAt), 'MMM d, yyyy')}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                    match.status === 'resolved' ? 'bg-success-50 text-success-700' :
                    match.status === 'acknowledged' ? 'bg-warning-50 text-warning-700' :
                    match.status === 'verified' ? 'bg-primary-50 text-primary-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{match.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-2 animate-fade-in">
            {notifications.length === 0 ? (
              <div className="card p-12 text-center">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400">No notifications yet.</p>
              </div>
            ) : notifications.map(n => (
              <div key={n._id} className={`card p-4 flex items-start gap-3 ${!n.isRead ? 'bg-primary-50/40 border-primary-100' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                  n.type === 'match_found' ? 'bg-success-50' :
                  n.type === 'otp_sent' ? 'bg-primary-50' :
                  n.type === 'item_resolved' ? 'bg-green-50' : 'bg-slate-100'
                }`}>
                  {n.type === 'match_found' ? '🎯' : n.type === 'otp_sent' ? '📧' : n.type === 'item_resolved' ? '✅' : '🔔'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a')}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
