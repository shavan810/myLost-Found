import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { Mail, Lock } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: otp+new password
  const [email, setEmail] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onEmailSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setEmail(data.email);
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const onResetSubmit = async (data) => {
    try {
      await api.post('/auth/reset-password', { email, otp: data.otp, newPassword: data.newPassword });
      toast.success('Password reset successfully!');
      window.location.href = '/login';
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="pt-16 min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${step === 1 ? 'bg-primary-50' : 'bg-success-50'}`}>
              {step === 1 ? <Mail className="w-6 h-6 text-primary-600" /> : <Lock className="w-6 h-6 text-success-700" />}
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-900">{step === 1 ? 'Forgot Password' : 'Reset Password'}</h1>
            <p className="text-slate-500 text-sm mt-1">{step === 1 ? "Enter your email to receive an OTP" : `OTP sent to ${email}`}</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <input {...register('email', { required: true, pattern: /\S+@\S+\.\S+/ })} type="email" className="input-field" placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Sending...' : 'Send OTP'}</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onResetSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">OTP Code</label>
                <input {...register('otp', { required: true, minLength: 6, maxLength: 6 })} className="input-field text-center text-xl tracking-widest font-mono" placeholder="000000" maxLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input {...register('newPassword', { required: true, minLength: 6 })} type="password" className="input-field" placeholder="New password" />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Resetting...' : 'Reset Password'}</button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-4">
            <Link to="/login" className="text-primary-600 hover:text-primary-700">← Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
