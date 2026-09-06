import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Zap, Users, ArrowRight, CheckCircle, TrendingUp, MapPin } from 'lucide-react';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';

export default function Home() {
  const [stats, setStats] = useState({ totalLost: 0, totalFound: 0, totalResolved: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/items/stats').then(({ data }) => {
      setStats(data.stats);
      setRecentItems(data.recentItems || []);
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
  };

  const features = [
    { icon: Zap, title: 'Smart Matching', desc: 'AI-powered algorithm matches lost items with found reports using description, location, and date.', color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { icon: Shield, title: 'Multi-Level Verification', desc: 'Hidden details, proof validation, and dual OTP confirmation prevent fake claims.', color: 'text-primary-600', bg: 'bg-primary-50' },
    { icon: Users, title: 'User-to-User', desc: 'Direct connection between the item reporter and finder — no admin dependency.', color: 'text-accent-600', bg: 'bg-accent-50' },
    { icon: CheckCircle, title: 'Secure Resolution', desc: 'Both parties verify via OTP before an item is marked as returned.', color: 'text-success-700', bg: 'bg-success-50' }
  ];

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="mesh-bg min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium px-4 py-2 rounded-full mb-8 animate-fade-in">
            <TrendingUp className="w-4 h-4" />
            <span>{stats.totalResolved}+ items successfully returned</span>
          </div>

          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-slate-900 leading-tight mb-6 animate-slide-up">
            Lost something?
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">We'll find it.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            FindBack uses intelligent matching to connect people who've lost items with those who've found them — safely, quickly, and without the runaround.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex gap-3 bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search lost or found items..."
                  className="flex-1 outline-none text-slate-800 placeholder-slate-400 bg-transparent font-body"
                />
              </div>
              <button type="submit" className="btn-primary">Search</button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/report" className="btn-primary text-base flex items-center justify-center gap-2 group">
              Report Lost Item <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/browse?type=found" className="btn-secondary text-base flex items-center justify-center gap-2">
              View Found Items
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {[
              { label: 'Items Lost', value: stats.totalLost, color: 'text-danger-600' },
              { label: 'Items Found', value: stats.totalFound, color: 'text-success-700' },
              { label: 'Resolved', value: stats.totalResolved, color: 'text-primary-600' }
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`font-display font-extrabold text-3xl ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">How FindBack Works</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">A 3-step process designed to maximize recovery and prevent fraud.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Report Your Item', desc: 'Submit details about your lost or found item including photos, location, and a secret hidden detail for verification.', icon: '📝' },
              { step: '02', title: 'Smart Matching', desc: 'Our algorithm intelligently matches lost and found reports based on similarity score, category, location, and date.', icon: '🔍' },
              { step: '03', title: 'Verify & Recover', desc: 'Both parties receive OTPs and verify ownership. After dual confirmation, the item is marked as returned.', icon: '✅' }
            ].map(step => (
              <div key={step.step} className="relative text-center p-6">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">{step.icon}</div>
                <div className="absolute top-4 left-6 font-display font-extrabold text-6xl text-slate-100 -z-10">{step.step}</div>
                <h3 className="font-display font-semibold text-lg text-slate-800 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">Built for Trust & Security</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Every feature is designed to prevent fraud and ensure items reach their real owners.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="card p-6">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-display font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Items */}
      {recentItems.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display font-bold text-3xl text-slate-900">Recent Reports</h2>
                <p className="text-slate-500 mt-1">Latest lost and found items in your area</p>
              </div>
              <Link to="/browse" className="btn-secondary text-sm flex items-center gap-1.5">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentItems.map(item => <ItemCard key={item._id} item={item} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">Ready to recover your item?</h2>
          <p className="text-primary-100 text-lg mb-8">Join thousands who've used FindBack to recover their belongings.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-700 font-semibold py-3 px-8 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              Create Free Account
            </Link>
            <Link to="/browse" className="bg-primary-700 text-white font-semibold py-3 px-8 rounded-xl hover:bg-primary-800 transition-all duration-200 border border-primary-500">
              Browse Items
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
