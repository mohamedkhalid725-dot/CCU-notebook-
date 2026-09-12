import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Mail, 
  User as UserIcon, 
  LogOut, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud,
  ShieldCheck,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  logoutUser 
} from '../services/firebase';
import { PatientRecord } from '../types';

interface CloudAccountModalProps {
  currentUser: User | null;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  patients: PatientRecord[];
  onManualSync: () => Promise<void>;
  onPullCloudData: () => Promise<void>;
  onClose: () => void;
}

export const CloudAccountModal: React.FC<CloudAccountModalProps> = ({
  currentUser,
  cloudSyncStatus,
  patients,
  onManualSync,
  onPullCloudData,
  onClose
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (authMode === 'signin') {
        await loginWithEmail(email, password);
        setSuccessMsg('تم تسجيل الدخول بنجاح، جاري مزامنة السجلات السحابية...');
      } else {
        await registerWithEmail(email, password, displayName);
        setSuccessMsg('تم إنشاء الحساب بنجاح وتفعيل التخزين السحابي!');
      }
      setTimeout(() => {
        setSuccessMsg(null);
      }, 2500);
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = 'تعذر إتمام العملية. يرجى التأكد من البريد وكلمة المرور.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.';
      } else if (err.code === 'auth/weak-password') {
        message = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPopupBlocked(false);
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('تم تسجيل الدخول بنجاح عبر حساب Google!');
    } catch (err: any) {
      console.error('Google Auth error:', err);
      if (err.code === 'auth/popup-blocked' || err.message?.includes('popup-blocked')) {
        setPopupBlocked(true);
        setErrorMsg(null);
      } else {
        setErrorMsg('تعذر تسجيل الدخول عبر Google. تحقق من النوافذ المنبثقة.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setSuccessMsg('تم تسجيل الخروج. البيانات الحالية تظل محفوظة محلياً.');
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>الربط السحابي ومزامنة الحساب</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                  Cloud Sync
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                حفظ بيانات المرضى والجداول والـ Timeline على السحابة الآمنة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Status Banners */}
          {popupBlocked && (
            <div className="p-3.5 rounded-xl bg-sky-950/60 border border-sky-800/80 text-sky-200 text-xs space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sky-300">حظر المتصفح النافذة المنبثقة لحساب Google</h4>
                  <p className="text-[11px] text-sky-200/90 leading-relaxed mt-0.5">
                    حظر المتصفح أو إطار المعاينة النافذة. يمكنك فتح التطبيق في تبويب كامل أو استخدام البريد الإلكتروني وكلمة المرور.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح في تبويب مستقل</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPopupBlocked(false)}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {currentUser ? (
            /* Logged In View */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : (currentUser.email?.[0].toUpperCase() || 'Dr')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        {currentUser.displayName || 'الطبيب المعالج'}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 border border-emerald-800 text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>سحابي متصل</span>
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">الملفات المحفوظة:</span>
                    <strong className="text-white text-sm">{patients.length} مريض</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">حالة المزامنة:</span>
                    <strong className="text-cyan-300 text-sm">
                      {cloudSyncStatus === 'syncing' ? 'جاري المزامنة...' : 'محدثة تلقائياً'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Cloud sync actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onManualSync}
                  disabled={loading || cloudSyncStatus === 'syncing'}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-xs disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>رفع وتحديث السحابة</span>
                </button>
                <button
                  onClick={onPullCloudData}
                  disabled={loading || cloudSyncStatus === 'syncing'}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition disabled:opacity-50"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>جلب التحديثات</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ميزة المزامنة السحابية الفورية (Live Cloud Sync)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  أي تعديل في سرير، ملاحظة timeline، فحص مخبري، أو خروج مريض يتم رفعه فوراً إلى سحابة Firestore المشفرة الخاصة بحسابك، ويمكنك فتح نفس الحساب من التابلت أو هاتف أندرويد لتجد البيانات كاملة.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل الخروج من الحساب</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out / Auth Form View */
            <div className="space-y-4">
              {/* Tab Selector: Sign In / Sign Up */}
              <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                    authMode === 'signin'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  تسجيل الدخول (Sign In)
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                    authMode === 'signup'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  حساب طبيب جديد (Register)
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3 text-xs">
                {authMode === 'signup' && (
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">اسم الطبيب المعالج / اللقب</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="د. أحمد الشناوي"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-slate-400 font-medium block mb-1">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="doctor@hospital.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">كلمة المرور (Password)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : authMode === 'signin' ? (
                    'تسجيل الدخول ومزامنة الداتا'
                  ) : (
                    'إنشاء الحساب وحفظ البيانات سحابياً'
                  )}
                </button>
              </form>

              {/* Alternative Google Sign In */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500 font-semibold">أو عبر حساب جوجل</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>متابعة باستخدام Google Account</span>
              </button>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-900/50 text-[11px] text-slate-300 space-y-1">
                <span className="font-semibold text-cyan-300 block">🔒 أمان تام وتشفير سحابي:</span>
                <p className="text-slate-400 leading-relaxed">
                  عند ربط حسابك، يتم تشفير بيانات المرضى وتخزينها تحت مجلدك الخاص في Cloud Firestore مع حماية تامة بقواعد الأمان (Firestore Security Rules).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
