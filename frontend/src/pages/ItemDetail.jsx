import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Eye, User, Tag, ArrowLeft, Share2, Flag } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ItemDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    api.get(`/items/${id}`).then(({ data }) => { setItem(data.item); }).catch(() => navigate('/browse')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!item) return null;

  const isOwner = user?._id === item.reporter?._id;
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); };

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="card overflow-hidden mb-3">
              {item.images?.[0] ? (
                <img src={item.images[activeImg]} alt={item.title} className="w-full h-72 sm:h-96 object-cover" />
              ) : (
                <div className="w-full h-72 sm:h-96 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <span className="text-7xl opacity-20">📦</span>
                </div>
              )}
            </div>
            {item.images?.length > 1 && (
              <div className="flex gap-2">
                {item.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-500' : 'border-slate-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div>
              <div className="flex items-start gap-3 mb-3">
                <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>
                  {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                </span>
                <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">{item.category}</span>
                {item.status === 'resolved' && <span className="badge-resolved">✅ Resolved</span>}
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">{item.title}</h1>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><MapPin className="w-3.5 h-3.5 text-primary-500" /> Location</div>
                <p className="text-sm font-medium text-slate-800">{item.location?.city}{item.location?.state ? `, ${item.location.state}` : ''}</p>
                <p className="text-xs text-slate-500">{item.location?.address}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Calendar className="w-3.5 h-3.5 text-primary-500" /> Date</div>
                <p className="text-sm font-medium text-slate-800">{format(new Date(item.date), 'MMM d, yyyy')}</p>
              </div>
            </div>

            {(item.color || item.brand) && (
              <div className="flex gap-3">
                {item.color && <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 text-sm"><span className="text-slate-500 text-xs">Color:</span> <span className="font-medium">{item.color}</span></div>}
                {item.brand && <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 text-sm"><span className="text-slate-500 text-xs">Brand:</span> <span className="font-medium">{item.brand}</span></div>}
              </div>
            )}

            <div>
              <h3 className="font-display font-semibold text-slate-800 mb-2 text-sm uppercase tracking-wider">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
            </div>

            {isOwner && item.hiddenDetails && (
              <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-warning-700 mb-1 uppercase tracking-wider">🔒 Hidden Verification Detail (Only You)</p>
                <p className="text-sm text-warning-800">{item.hiddenDetails}</p>
              </div>
            )}

            {item.reward && (
              <div className="bg-success-50 border border-success-200 rounded-xl px-4 py-3">
                <p className="text-sm text-success-700"><span className="font-semibold">🎁 Reward offered:</span> {item.reward}</p>
              </div>
            )}

            {/* Reporter */}
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                {item.reporter?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800">{item.reporter?.name}</p>
                <p className="text-xs text-slate-500">⭐ {item.reporter?.reputation || 100} reputation · {item.reporter?.itemsReturned || 0} items returned</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {!isOwner && isAuthenticated && item.status === 'active' && (
                <Link to="/matches" className="btn-primary flex-1 text-center text-sm">
                  View My Matches
                </Link>
              )}
              {!isAuthenticated && (
                <Link to="/login" className="btn-primary flex-1 text-center text-sm">
                  Sign in to claim
                </Link>
              )}
              <button onClick={handleShare} className="btn-secondary text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Share
              </button>
              {isOwner && (
                <Link to={`/report?edit=${item._id}`} className="btn-secondary text-sm">Edit</Link>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{item.views} views</span>
              <span>·</span>
              <span>Reported {format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
