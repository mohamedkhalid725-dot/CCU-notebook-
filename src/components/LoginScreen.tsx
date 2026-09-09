import React, { useState } from 'react';
import { 
  HeartPulse, 
  Cloud, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2, 
  Activity,
  KeyRound,
  Eye,
  EyeOff,
  WifiOff,
  Stethoscope
} from 'lucide-react';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle 
} from '../services/firebase';
import { AppSecuritySettings } from '../types';
import { hashPin } from '../services/crypto';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onContinueOffline: (pin?: string) => void;
  securitySettings: AppSecuritySettings;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onContinueOffline,
  securitySettings
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Offline PIN fallback state
  const [showOfflinePin, setShowOfflinePin] = useState(false);
  const [offlinePinInput, setOfflinePinInput] = useState('');
  const [offlinePinError, setOfflinePinError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    if (activeTab === 'signup') {
      if (password.length < 6) {
        setErrorMsg('كلمة المرور يجب أن تتكون من 6 خانات على الأقل');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('كلمات المرور غير متطابقة');
        return;
      }
    }

    setLoading(true);
    try {
      if (activeTab === 'signin') {
        await loginWithEmail(email, password);
        setSuccessMsg('تم تسجيل الدخول بنجاح! جاري تحميل ملفات المرضى...');
      } else {
        await registerWithEmail(email, password, displayName.trim() || undefined);
        setSuccessMsg('تم إنشاء حساب الطبيب بنجاح وربط السحابة!');
      }
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    } catch (err: any) {
      console.error('Authentication error:', err);
      let message = 'تعذر تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مجدداً.';
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/invalid-credential'
      ) {
        message = 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'هذا البريد مسجل مسبقاً. يرجى التبديل لتبويب تسجيل الدخول.';
      } else if (err.code === 'auth/weak-password') {
        message = 'كلمة المرور ضعيفة، يرجى اختيار كلمة مرور أقوى.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'تعذر الاتصال بالشبكة. يمكنك استخدام وضع الدخول المحلي أدناه.';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('تم تسجيل الدخول بنجاح عبر حساب Google!');
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('تعذر تسجيل الدخول عبر Google. يرجى التأكد من تفعيل النوافذ المنبثقة.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleOfflineUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfflinePinError(null);

    if (!securitySettings.isPinSet) {
      // No PIN set yet, allow direct local access
      onContinueOffline(offlinePinInput || '0000');
      return;
    }

    try {
      const testHash = await hashPin(offlinePinInput, securitySettings.pinSalt);
      if (testHash === securitySettings.hashedPin) {
        onContinueOffline(offlinePinInput);
      } else {
        setOfflinePinError('رمز PIN المحلي غير صحيح');
      }
    } catch {
      setOfflinePinError('حدث خطأ أثناء فحص رمز PIN');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Medical Brand Banner */}
        <div className="p-6 sm:p-7 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-950/50 mb-3.5">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <HeartPulse className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            مفكرة العناية المركزة والقلبية
          </h1>
          <p className="text-xs sm:text-sm text-cyan-400 font-medium mt-1">
            ICU & CCU Clinical Notebook
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>تسجيل الدخول والمزامنة السحابية المشفرة</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Notification Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {/* Google Sign In (Primary Fast Option) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-2.5 px-4 rounded-xl text-sm transition shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            )}
            <span>تسجيل الدخول السريع عبر Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              أو بالبريد وكلمة المرور
            </span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Tabs: Sign In vs Sign Up */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition text-center ${
                activeTab === 'signin'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition text-center ${
                activeTab === 'signup'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              حساب طبيب جديد
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  اسم الطبيب / اللقب السريري
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="د. محمد خالد (أخصائي العناية)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition shadow-lg shadow-cyan-950/60 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>
                    {activeTab === 'signin' ? 'دخول العناية المركزة' : 'إنشاء الحساب وبدء العمل'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Emergency Offline / Local PIN Section */}
          <div className="pt-2 border-t border-slate-800/80">
            {!showOfflinePin ? (
              <button
                type="button"
                onClick={() => setShowOfflinePin(true)}
                className="w-full text-center text-xs text-slate-400 hover:text-cyan-400 py-1 flex items-center justify-center gap-1.5 transition"
              >
                <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                <span>العمل بدون إنترنت أو الدخول السريع عبر رمز PIN المحلي</span>
              </button>
            ) : (
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    الدخول المحلي المشفر (Offline PIN)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowOfflinePin(false)}
                    className="text-slate-500 hover:text-slate-300 text-[11px]"
                  >
                    إلغاء
                  </button>
                </div>

                {offlinePinError && (
                  <p className="text-[11px] text-rose-400 font-medium">
                    {offlinePinError}
                  </p>
                )}

                <form onSubmit={handleOfflineUnlock} className="flex gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    value={offlinePinInput}
                    onChange={(e) => setOfflinePinInput(e.target.value)}
                    placeholder="رمز PIN المحلي"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-center tracking-widest"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-medium transition"
                  >
                    دخول محلي
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer Features */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Stethoscope className="w-3 h-3 text-cyan-400" />
            <span>معايير التوثيق السريري ICU/CCU</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Cloud className="w-3 h-3" />
            <span>مزامنة تلقائية حية</span>
          </span>
        </div>
      </div>
    </div>
  );
};
