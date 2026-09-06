import { Link } from 'react-router-dom';
import { MapPin, Calendar, Eye, Tag } from 'lucide-react';
import { format } from 'date-fns';

const categoryColors = {
  Electronics: 'bg-blue-50 text-blue-700',
  Jewelry: 'bg-yellow-50 text-yellow-700',
  Documents: 'bg-orange-50 text-orange-700',
  Clothing: 'bg-purple-50 text-purple-700',
  Bags: 'bg-pink-50 text-pink-700',
  Keys: 'bg-cyan-50 text-cyan-700',
  Wallet: 'bg-green-50 text-green-700',
  Pet: 'bg-red-50 text-red-700',
  Vehicle: 'bg-slate-100 text-slate-700',
  Other: 'bg-gray-100 text-gray-600'
};

export default function ItemCard({ item }) {
  return (
    <Link to={`/items/${item._id}`} className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group block">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-30">📦</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>
            {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
          </span>
          {item.status === 'resolved' && <span className="badge-resolved">✅ Resolved</span>}
        </div>
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColors[item.category] || 'bg-gray-100 text-gray-600'}`}>
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-slate-800 truncate group-hover:text-primary-600 transition-colors">{item.title}</h3>
        <p className="text-slate-500 text-sm mt-1 line-clamp-2 leading-relaxed">{item.description}</p>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
            <span className="truncate">{item.location?.city}, {item.location?.state || item.location?.country}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
            <span>{format(new Date(item.date), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
              {item.reporter?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-slate-500">{item.reporter?.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            <span>{item.views || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
