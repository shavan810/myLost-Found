import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield, Eye, EyeOff, ArrowLeft, Mail, Lock, KeyRound, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../context/AdminAuthContext';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | forgot | reset
  const [showPass, setShowPass] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  const onLogin = async (data) => {
    try {
      await login(data);
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    }
  };

  const onForgot = async (data) => {
    try {
      await api.post('/admin/forgot-password', { email: data.email });
      setForgotEmail(data.email);
      toast.success('OTP sent to your admin email');
      setMode('reset');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'No admin found with this email');
    }
  };

  const onReset = async (data) => {
    try {
      await api.post('/admin/reset-password', { email: forgotEmail, otp: data.otp, newPassword: data.newPassword });
      toast.success('Password reset! Please login.');
      setMode('login');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">
            Find<span className="text-blue-400">Back</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Admin Control Panel</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <>
              <div className="mb-6">
                <h2 className="font-display font-bold text-xl text-white">Sign In</h2>
                <p className="text-slate-400 text-sm mt-1">Access your admin dashboard</p>
              </div>
              <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                      type="email" placeholder="admin@findback.com"
                      className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input {...register('password', { required: 'Password is required' })}
                      type={showPass ? 'text' : 'password'} placeholder="••••••••"
                      className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div className="flex justify-end">
                  <button type="button" onClick={() => { setMode('forgot'); reset(); }} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Signing in...' : 'Sign In to Admin Panel'}
                </button>
              </form>
            </>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <>
              <button onClick={() => { setMode('login'); reset(); }} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </button>
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="font-display font-bold text-xl text-white">Forgot Password</h2>
                <p className="text-slate-400 text-sm mt-1">Enter your admin email to receive an OTP</p>
              </div>
              <form onSubmit={handleSubmit(onForgot)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input {...register('email', { required: 'Email is required' })}
                      type="email" placeholder="admin@findback.com"
                      className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-60">
                  {isSubmitting ? 'Sending OTP...' : 'Send Reset OTP'}
                </button>
              </form>
            </>
          )}

          {/* RESET PASSWORD MODE */}
          {mode === 'reset' && (
            <>
              <button onClick={() => { setMode('forgot'); reset(); }} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-6">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="mb-6">
                <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-violet-400" />
                </div>
                <h2 className="font-display font-bold text-xl text-white">Reset Password</h2>
                <p className="text-slate-400 text-sm mt-1">OTP sent to <span className="text-blue-400">{forgotEmail}</span></p>
              </div>
              <form onSubmit={handleSubmit(onReset)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">6-Digit OTP</label>
                  <input {...register('otp', { required: true, minLength: 6, maxLength: 6 })}
                    type="text" inputMode="numeric" maxLength={6} placeholder="000000"
                    className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-xl text-center font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" />
                  {errors.otp && <p className="text-red-400 text-xs mt-1">Enter valid 6-digit OTP</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input {...register('newPassword', { required: true, minLength: { value: 6, message: 'Min 6 characters' } })}
                      type={showPass ? 'text' : 'password'} placeholder="New secure password"
                      className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg active:scale-95 disabled:opacity-60">
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          FindBack Admin Panel · Restricted Access Only
        </p>
      </div>
    </div>
  );
}
