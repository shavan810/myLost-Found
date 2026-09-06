import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Star, Package, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone }
  });

  const onSubmit = async (data) => {
    try {
      const { data: res } = await api.put('/auth/profile', data);
      updateUser(res.user);
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display font-bold text-3xl text-slate-900 mb-8">My Profile</h1>

        {/* Avatar & Stats */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-glow">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">{user?.name}</h2>
              <p className="text-slate-500 text-sm">{user?.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-success-500 rounded-full" />
                <span className="text-xs text-success-700 font-medium">Verified</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Reputation', value: user?.reputation || 100, icon: Star, color: 'text-warning-600', bg: 'bg-warning-50' },
              { label: 'Items Reported', value: user?.itemsReported || 0, icon: Package, color: 'text-primary-600', bg: 'bg-primary-50' },
              { label: 'Items Returned', value: user?.itemsReturned || 0, icon: CheckCircle, color: 'text-success-700', bg: 'bg-success-50' }
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg text-slate-800">Personal Information</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">Edit Profile</button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input {...register('name', { required: true })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <input {...register('phone')} className="input-field" type="tel" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email', value: user?.email },
                { label: 'Phone', value: user?.phone },
                { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '—' }
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{f.label}</span>
                  <span className="text-sm font-medium text-slate-800">{f.value || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
