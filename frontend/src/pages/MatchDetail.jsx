import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [initiating, setInitiating] = useState(false);

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      const { data } = await api.get(`/matches/${id}`);
      setMatch(data.match);
    } catch { navigate('/matches'); }
    finally { setLoading(false); }
  };

  const handleInitiate = async () => {
    setInitiating(true);
    try {
      await api.post(`/matches/${id}/initiate`);
      toast.success('Claim initiated! OTP sent to both parties via email.');
      fetchMatch();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to initiate'); }
    finally { setInitiating(false); }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) document.getElementById(`motp-${idx + 1}`)?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) return toast.error('Enter complete OTP');
    setVerifying(true);
    try {
      const { data } = await api.post('/matches/verify-otp', { matchId: id, otp: otpStr });
      toast.success('OTP verified successfully!');
      setMatch(data.match);
      setOtp(['', '', '', '', '', '']);
    } catch (error) { toast.error(error.response?.data?.message || 'Invalid OTP'); }
    finally { setVerifying(false); }
  };

  if (loading) return <div className="pt-24 flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!match) return null;

  const isLostOwner = user?._id === match.lostItem?.reporter?._id;
  const isFoundOwner = user?._id === match.foundItem?.reporter?._id;
  const isParty = isLostOwner || isFoundOwner;
  const vd = match.verificationData;
  const myVerified = isLostOwner ? vd?.lostOwnerVerified : vd?.foundOwnerVerified;

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Matches
        </button>

        {/* Match Score Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-display font-bold flex-shrink-0 ${match.score >= 70 ? 'bg-success-50 text-success-700' : match.score >= 40 ? 'bg-warning-50 text-warning-700' : 'bg-slate-100 text-slate-500'}`}>
              <span className="text-3xl">{match.score}</span>
              <span className="text-xs font-normal">% match</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-slate-900">Match Details</h1>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {match.matchReasons?.map((r, i) => <span key={i} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">{r}</span>)}
              </div>
            </div>
            <div className="ml-auto">
              <span className={`font-semibold px-3 py-1.5 rounded-full text-sm ${match.status === 'resolved' ? 'bg-success-50 text-success-700' : match.status === 'acknowledged' ? 'bg-warning-50 text-warning-700' : 'bg-slate-100 text-slate-600'}`}>
                {match.status === 'resolved' ? '✅ Resolved' : match.status === 'acknowledged' ? '⏳ In Progress' : match.status === 'verified' ? '🔐 Verifying' : '🔍 Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Both Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[{ label: '🔴 Lost Item', item: match.lostItem }, { label: '🟢 Found Item', item: match.foundItem }].map(({ label, item }) => (
            <div key={label} className="card p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{label}</p>
              {item?.images?.[0] && <img src={item.images[0]} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-3" />}
              <p className="font-semibold text-slate-800">{item?.title}</p>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item?.description}</p>
              <div className="mt-2 text-xs text-slate-400">
                <span>📍 {item?.location?.city}</span>
                <span className="mx-2">·</span>
                <span>📅 {item?.date && format(new Date(item.date), 'MMM d, yyyy')}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">{item?.reporter?.name?.[0]}</div>
                <span className="text-xs text-slate-500">{item?.reporter?.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Panel */}
        {match.status === 'resolved' ? (
          <div className="card p-8 text-center">
            <CheckCircle className="w-14 h-14 text-success-500 mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">Successfully Resolved!</h2>
            <p className="text-slate-500">Both parties verified the claim. The item has been returned to its owner.</p>
            <p className="text-sm text-slate-400 mt-2">Resolved on {match.resolvedAt && format(new Date(match.resolvedAt), 'MMM d, yyyy · h:mm a')}</p>
          </div>
        ) : match.status === 'pending' && isParty ? (
          <div className="card p-6 bg-primary-50/50 border-primary-100">
            <div className="flex items-start gap-3 mb-5">
              <ShieldCheck className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display font-semibold text-lg text-slate-900">Initiate Claim Process</h2>
                <p className="text-sm text-slate-600 mt-1">Starting the claim will send a One-Time Password (OTP) to both you and the other party. Both must verify to confirm the item return.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 mb-5 text-sm text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800">What happens next:</p>
              <p>1️⃣ OTP sent to both parties' registered emails</p>
              <p>2️⃣ Both parties enter their OTPs to confirm</p>
              <p>3️⃣ Item marked as resolved automatically</p>
            </div>
            <button onClick={handleInitiate} disabled={initiating} className="btn-primary w-full">
              {initiating ? 'Initiating...' : '🚀 Initiate Claim'}
            </button>
          </div>
        ) : (match.status === 'acknowledged' || match.status === 'verified') && isParty && !myVerified ? (
          <div className="card p-6 bg-warning-50/50 border-warning-100">
            <div className="flex items-start gap-3 mb-5">
              <AlertCircle className="w-6 h-6 text-warning-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display font-semibold text-lg text-slate-900">Enter Your OTP</h2>
                <p className="text-sm text-slate-600 mt-1">An OTP was sent to your registered email. Enter it below to verify your claim.</p>
              </div>
            </div>
            <form onSubmit={handleVerifyOtp}>
              <div className="flex gap-2 justify-center mb-5">
                {otp.map((d, i) => (
                  <input key={i} id={`motp-${i}`} type="text" inputMode="numeric" maxLength={1}
                    value={d} onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && document.getElementById(`motp-${i-1}`)?.focus()}
                    className={`w-11 h-13 text-center text-lg font-bold border-2 rounded-xl outline-none transition-all font-mono
                      ${d ? 'border-warning-400 bg-warning-50 text-warning-700' : 'border-slate-200 bg-white'}
                      focus:border-warning-400 focus:ring-2 focus:ring-warning-100`} />
                ))}
              </div>
              <button type="submit" disabled={verifying || otp.join('').length !== 6} className="btn-primary w-full bg-warning-500 hover:bg-warning-600 shadow-none">
                {verifying ? 'Verifying...' : '✅ Verify OTP'}
              </button>
            </form>
            {/* Status of both */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className={`p-3 rounded-xl text-center ${vd?.lostOwnerVerified ? 'bg-success-50 text-success-700' : 'bg-slate-100 text-slate-500'}`}>
                {vd?.lostOwnerVerified ? '✅' : '⏳'} Lost Owner
              </div>
              <div className={`p-3 rounded-xl text-center ${vd?.foundOwnerVerified ? 'bg-success-50 text-success-700' : 'bg-slate-100 text-slate-500'}`}>
                {vd?.foundOwnerVerified ? '✅' : '⏳'} Found Owner
              </div>
            </div>
          </div>
        ) : (match.status === 'acknowledged' || match.status === 'verified') && myVerified ? (
          <div className="card p-6 text-center bg-success-50/50 border-success-100">
            <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-3" />
            <h2 className="font-semibold text-lg text-slate-800">You've verified! ✅</h2>
            <p className="text-slate-500 text-sm mt-1">Waiting for the other party to verify with their OTP.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
