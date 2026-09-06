import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { userId, email } = location.state || {};

  if (!userId) { navigate('/login'); return null; }

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) setOtp(paste.split(''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) return toast.error('Enter complete OTP');
    setLoading(true);
    try {
      await verifyEmail(userId, otpStr);
      toast.success('Email verified! Welcome to FindBack!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally { setLoading(false); }
  };

  const resendOtp = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { userId });
      toast.success('New OTP sent to your email');
    } catch { toast.error('Failed to resend OTP'); }
    finally { setResending(false); }
  };

  return (
    <div className="pt-16 min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Verify Your Email</h1>
          <p className="text-slate-500 text-sm mb-2">We sent a 6-digit OTP to</p>
          <p className="text-primary-600 font-semibold mb-8">{email}</p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all duration-200 font-mono
                    ${digit ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-800'}
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-100`}
                  autoFocus={idx === 0}
                />
              ))}
            </div>
            <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn-primary w-full mb-4">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <button onClick={resendOtp} disabled={resending} className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mx-auto">
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Resending...' : "Didn't receive it? Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
