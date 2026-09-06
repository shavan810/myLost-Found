import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await login(data);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message;
      if (error.response?.data?.userId) {
        toast.error('Please verify your email first');
        navigate('/verify-email', { state: { userId: error.response.data.userId } });
      } else {
        toast.error(msg || 'Login failed');
      }
    }
  };

  return (
    <div className="pt-16 min-h-screen mesh-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Search className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-1">Sign in to your FindBack account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                type="email" className="input-field" placeholder="you@example.com" />
              {errors.email && <p className="text-danger-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700">Forgot password?</Link>
              </div>
              <div className="relative">
                <input {...register('password', { required: 'Password is required' })}
                  type={showPass ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-danger-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account? <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">Create one</Link>
          </p>
                    <p className="text-center text-sm text-slate-500 mt-6">
            <Link to="/admin" className="text-primary-600 font-medium hover:text-primary-700">Sign in to Admin Panel</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
