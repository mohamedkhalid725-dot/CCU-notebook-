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
  Stethoscope,
  Copy,
  ExternalLink,
  Check,
  Globe,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle,
  loginWithGoogleRedirect,
  checkRedirectAuth
} from '../services/firebase';
import { AppSecuritySettings } from '../types';
import { hashPin } from '../services/crypto';
import { useI18n } from '../services/i18n';
import firebaseConfig from '../../firebase-applet-config.json';

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
  const { lang, setLang, t } = useI18n();
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

  // Unauthorized domain specific state
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Popup blocked state
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [redirectLoading, setRedirectLoading] = useState(false);

  // Offline PIN fallback state
  const [showOfflinePin, setShowOfflinePin] = useState(false);
  const [offlinePinInput, setOfflinePinInput] = useState('');
  const [offlinePinError, setOfflinePinError] = useState<string | null>(null);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

  // Check if user just returned from a redirect sign-in
  React.useEffect(() => {
    checkRedirectAuth()
      .then((user) => {
        if (user) {
          onLoginSuccess();
        }
      })
      .catch((err) => {
        console.warn('Check redirect auth:', err);
      });
  }, [onLoginSuccess]);

  const handleCopyDomain = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleDutyDoctorAccess = () => {
    if (!securitySettings.isPinSet) {
      onContinueOffline('0000');
    } else {
      setShowOfflinePin(true);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setUnauthorizedDomain(null);

    if (!email || !password) {
      setErrorMsg(lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }

    if (activeTab === 'signup') {
      if (password.length < 6) {
        setErrorMsg(lang === 'ar' ? 'كلمة المرور يجب أن تتكون من 6 خانات على الأقل' : 'Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg(lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      if (activeTab === 'signin') {
        await loginWithEmail(email, password);
        setSuccessMsg(lang === 'ar' ? 'تم تسجيل الدخول بنجاح! جاري تحميل ملفات المرضى...' : 'Signed in successfully! Loading patient records...');
      } else {
        await registerWithEmail(email, password, displayName.trim() || undefined);
        setSuccessMsg(lang === 'ar' ? 'تم إنشاء حساب الطبيب بنجاح وربط السحابة!' : 'Doctor account created and connected to cloud!');
      }
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    } catch (err: any) {
      console.error('Authentication error:', err);
      let message = lang === 'ar' 
        ? 'تعذر تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مجدداً.' 
        : 'Sign in failed. Please check your credentials and try again.';
        
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/invalid-credential'
      ) {
        message = lang === 'ar' 
          ? 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.' 
          : 'Invalid login credentials. Please check your email and password.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = lang === 'ar' 
          ? 'هذا البريد مسجل مسبقاً. يرجى التبديل لتبويب تسجيل الدخول.' 
          : 'Email already in use. Please switch to the Sign In tab.';
      } else if (err.code === 'auth/weak-password') {
        message = lang === 'ar' 
          ? 'كلمة المرور ضعيفة، يرجى اختيار كلمة مرور أقوى.' 
          : 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/network-request-failed') {
        message = lang === 'ar' 
          ? 'تعذر الاتصال بالشبكة. يمكنك استخدام وضع الدخول المحلي أدناه.' 
          : 'Network error. You can continue using Offline Mode below.';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setUnauthorizedDomain(null);
    setPopupBlocked(false);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg(lang === 'ar' ? 'تم تسجيل الدخول بنجاح عبر حساب Google!' : 'Signed in successfully with Google!');
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setUnauthorizedDomain(currentHostname || 'ais-dev-*.run.app');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg(lang === 'ar' ? 'تم إغلاق نافذة تسجيل الدخول عبر Google قبل إتمام العملية.' : 'Google sign-in popup was closed before completing.');
      } else if (err.code === 'auth/popup-blocked' || err.message?.includes('popup-blocked')) {
        setPopupBlocked(true);
        setErrorMsg(null);
      } else {
        setErrorMsg(err.message || (lang === 'ar' ? 'تعذر تسجيل الدخول عبر Google. يرجى التحقق من الشبكة والمحاولة مجدداً.' : 'Google sign-in failed. Please check network and retry.'));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    if (isInIframe) {
      // In an iframe, redirection to accounts.google.com will be blocked by X-Frame-Options: DENY
      // So open top-level app in a new tab
      window.open(window.location.href, '_blank');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setRedirectLoading(true);
    try {
      await loginWithGoogleRedirect();
    } catch (err: any) {
      console.error('Google redirect error:', err);
      setErrorMsg(err.message || 'Failed to initiate redirect sign in.');
      setRedirectLoading(false);
    }
  };

  const handleOfflineUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfflinePinError(null);

    if (!securitySettings.isPinSet) {
      onContinueOffline(offlinePinInput || '0000');
      return;
    }

    try {
      const testHash = await hashPin(offlinePinInput, securitySettings.pinSalt);
      if (testHash === securitySettings.hashedPin) {
        onContinueOffline(offlinePinInput);
      } else {
        setOfflinePinError(lang === 'ar' ? 'رمز PIN المحلي غير صحيح' : 'Incorrect local PIN');
      }
    } catch {
      setOfflinePinError(lang === 'ar' ? 'حدث خطأ أثناء فحص رمز PIN' : 'Error verifying PIN');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10">
        
        {/* Language Switcher Bar */}
        <div className="px-6 pt-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
            <span>v1.1.0</span>
            <span>•</span>
            <span>ICU/CCU</span>
          </div>
          <button
            type="button"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-slate-700 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-semibold">{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        {/* Medical Brand Banner */}
        <div className="px-6 pb-6 pt-2 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-950/50 mb-3.5">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <HeartPulse className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            CardioVault
          </h1>
          <p className="text-xs sm:text-sm text-cyan-400 font-medium mt-1">
            {lang === 'ar' ? 'مفكرة العناية المركزة والقلبية السريرية' : 'Personal ICU & CCU Clinical Notebook'}
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'ar' ? 'مصادقة الطبيب والمزامنة السحابية المشفرة' : 'Physician Auth & Secure Cloud Sync'}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Unauthorized Domain Explanatory Card */}
          {unauthorizedDomain && (
            <div className="p-4 bg-amber-950/50 border border-amber-800/70 rounded-2xl text-xs text-amber-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-300 text-sm">
                    {lang === 'ar' ? 'تنبيه نطاق Firebase: مطلوب تصريح النطاق' : 'Firebase Auth: Domain Not Authorized'}
                  </h4>
                  <p className="text-amber-200/90 text-[11px] mt-1 leading-relaxed">
                    {lang === 'ar'
                      ? 'لتفعيل تسجيل الدخول بحساب Google على هذا الرابط، يجب إضافة النطاق إلى قائمة النطاقات المصرح بها في إعدادات Firebase.'
                      : 'Google Sign-In requires this preview domain to be added to Authorized Domains in your Firebase Authentication Console.'}
                  </p>
                </div>
              </div>

              {/* Current Domain Box & Copy Button */}
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-amber-900/60 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-amber-300 truncate select-all">
                  {unauthorizedDomain}
                </span>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-700/60 text-[11px] font-semibold transition shrink-0"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{lang === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{lang === 'ar' ? 'نسخ النطاق' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons: Firebase Console & Instant Clinical Access */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={firebaseSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'فتح لوحة Firebase' : 'Firebase Console'}</span>
                </a>
                
                <button
                  type="button"
                  onClick={handleDutyDoctorAccess}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'المتابعة كطبيب مناوب الآن' : 'Continue as Duty Doctor'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Popup Blocked Assistance Card */}
          {popupBlocked && (
            <div className="p-4 bg-sky-950/60 border border-sky-800/80 rounded-2xl text-xs text-sky-200 space-y-3 animate-in fade-in duration-200 shadow-xl">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sky-300 text-sm">
                    {lang === 'ar' ? 'تم حظر النافذة المنبثقة بواسطة المتصفح' : 'Google Sign-In Popup Blocked'}
                  </h4>
                  <p className="text-sky-200/90 text-[11px] mt-1 leading-relaxed">
                    {lang === 'ar'
                      ? 'يحظر المتصفح أو إطار المعاينة فتح نوافذ تسجيل الدخول المنبثقة. يمكنك فتح التطبيق في تبويب كامل للمتابعة بحساب Google، أو تسجيل الدخول بالبريد الإلكتروني، أو المتابعة الفورية كطبيب مناوب.'
                      : 'Your browser or the preview frame blocked the sign-in popup. Open CardioVault in a full browser tab to complete Google Sign-In, or use Email / Duty Doctor access.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'فتح بتبويب جديد والدخول' : 'Open in New Tab & Sign In'}</span>
                </a>

                <button
                  type="button"
                  onClick={handleGoogleRedirectSignIn}
                  disabled={redirectLoading}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  {redirectLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>{lang === 'ar' ? 'إعادة المحاولة عبر الرابط' : 'Retry via Direct Navigation'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-sky-900/50 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setPopupBlocked(false);
                    setActiveTab('signin');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer"
                >
                  {lang === 'ar' ? 'استخدام البريد الإلكتروني' : 'Sign in with Email instead'}
                </button>

                <button
                  type="button"
                  onClick={handleDutyDoctorAccess}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  {lang === 'ar' ? 'متابعة كطبيب مناوب (Offline)' : 'Continue as Duty Doctor'}
                </button>
              </div>
            </div>
          )}

          {/* General Notification Messages */}
          {errorMsg && !unauthorizedDomain && (
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

          {/* Primary Quick Duty Physician Access Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleDutyDoctorAccess}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-cyan-950/60 active:scale-[0.99] cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>
                {lang === 'ar' ? 'الدخول المباشر كطبيب مناوب (Clinical Duty Access)' : 'Instant Clinical Duty Access'}
              </span>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              {lang === 'ar' 
                ? 'وصول سريري كامل وتوثيق فوري مع حفظ محلي مشفر دون اشتراط ربط حساب' 
                : 'Immediate full ICU/CCU access with local encrypted storage, no setup required'}
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {lang === 'ar' ? 'أو عبر الحساب السحابي' : 'Or via Cloud Account'}
            </span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Google Sign In Option */}
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
            <span>{lang === 'ar' ? 'تسجيل الدخول عبر Google' : 'Sign in with Google'}</span>
          </button>

          {isInIframe && (
            <p className="text-[11px] text-center text-slate-400 leading-normal -mt-2">
              {lang === 'ar' 
                ? 'ملاحظة: إذا حظر المتصفح النافذة في إطار المعاينة، يمكنك استخدام البريد الإلكتروني أو فتح التطبيق في تبويب مستقل' 
                : 'Note: If preview frame blocks the popup, you can sign in with Email or open in a new tab'}
            </p>
          )}

          {/* Tabs: Sign In vs Sign Up with Email */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg(null);
                setUnauthorizedDomain(null);
              }}
              className={`py-2 rounded-lg transition text-center ${
                activeTab === 'signin'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'ar' ? 'البريد الإلكتروني' : 'Sign In with Email'}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
                setUnauthorizedDomain(null);
              }}
              className={`py-2 rounded-lg transition text-center ${
                activeTab === 'signup'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'ar' ? 'حساب طبيب جديد' : 'New Doctor Account'}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {lang === 'ar' ? 'اسم الطبيب / اللقب السريري' : 'Physician Name & Title'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={lang === 'ar' ? 'د. محمد خالد (أخصائي العناية)' : 'Dr. Mohamed Khalid (ICU Specialist)'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
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
                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
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
                  {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
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
              className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/50 font-semibold py-2.5 px-4 rounded-xl text-sm transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>
                    {activeTab === 'signin' 
                      ? (lang === 'ar' ? 'تسجيل الدخول بالبريد' : 'Sign In with Email') 
                      : (lang === 'ar' ? 'إنشاء حساب الطبيب' : 'Register Doctor Account')}
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
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>{lang === 'ar' ? 'إدخال رمز PIN المحلي المخصص' : 'Enter Custom Local PIN'}</span>
              </button>
            ) : (
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    {lang === 'ar' ? 'الدخول برمز PIN المحلي' : 'Custom Local PIN Unlock'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowOfflinePin(false)}
                    className="text-slate-500 hover:text-slate-300 text-[11px]"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
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
                    placeholder="PIN"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-center tracking-widest"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-medium transition"
                  >
                    {lang === 'ar' ? 'دخول' : 'Unlock'}
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
            <span>{lang === 'ar' ? 'معايير التوثيق السريري ICU/CCU' : 'ICU/CCU Clinical Standards'}</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Cloud className="w-3 h-3" />
            <span>{lang === 'ar' ? 'مزامنة تلقائية حية' : 'Encrypted Storage'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
