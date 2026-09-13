import React, { useEffect, useState } from 'react';
import { Lock, Shield, Delete, CheckCircle2, AlertCircle } from 'lucide-react';
import { hashPin } from '../services/crypto';
import { AppSecuritySettings } from '../types';
import { authenticateBiometricAndGetPin, isBiometricAvailable } from '../services/biometric';

interface LockScreenProps {
  securitySettings: AppSecuritySettings;
  onUnlock?: (pin: string) => void;
  onUnlockSuccess?: (pin: string) => void;
  onSetupInitialPin?: (pin: string) => Promise<void>;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  securitySettings,
  onUnlock,
  onUnlockSuccess,
  onSetupInitialPin
}) => {
  const triggerUnlock = onUnlock || onUnlockSuccess || (() => {});
  const isSettingUp = !securitySettings.isPinSet;
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState<'enter' | 'confirm'>('enter');
  const [errorMsg, setErrorMsg] = useState('');

const [biometricAvailable, setBiometricAvailable] = useState(false);
const [biometricBusy, setBiometricBusy] = useState(false);

useEffect(() => {
  let mounted = true;
  if (!isSettingUp && securitySettings.biometricEnabled) {
    isBiometricAvailable().then((available) => {
      if (mounted) setBiometricAvailable(available);
    });
  }
  return () => { mounted = false; };
}, [isSettingUp, securitySettings.biometricEnabled]);

const handleBiometricUnlock = async () => {
  if (!biometricAvailable || biometricBusy) return;
  setBiometricBusy(true);
  setErrorMsg('');
  try {
    const storedPin = await authenticateBiometricAndGetPin();
    if (!storedPin) {
      setErrorMsg('Biometric unlock failed. Enter your PIN.');
      return;
    }
    await triggerUnlock(storedPin);
  } catch {
    setErrorMsg('Biometric unlock failed. Enter your PIN.');
  } finally {
    setBiometricBusy(false);
  }
};

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const next = pin + digit;
      setPin(next);
      setErrorMsg('');

      // Auto-submit only after all 6 digits are entered.
      if (!isSettingUp && next.length === 6) {
        verifyPin(next);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const verifyPin = async (candidatePin: string) => {
    try {
      const testHash = await hashPin(candidatePin, securitySettings.pinSalt);
      if (testHash === securitySettings.hashedPin) {
        triggerUnlock(candidatePin);
      } else {
        if (candidatePin.length === 6) {
          setErrorMsg('Incorrect PIN. Please try again.');
          setPin('');
        }
      }
    } catch {
      setErrorMsg('Verification failed');
      setPin('');
    }
  };

  const handleSetupProceed = async () => {
    if (setupStep === 'enter') {
      if (pin.length !== 6) {
        setErrorMsg('PIN must be exactly 6 digits');
        return;
      }
      setConfirmPin(pin);
      setPin('');
      setSetupStep('confirm');
      setErrorMsg('');
    } else {
      if (pin.length !== 6) {
        setErrorMsg('PIN must be exactly 6 digits');
        return;
      }
      if (pin !== confirmPin) {
        setErrorMsg('PINs do not match. Please re-enter.');
        setPin('');
        setConfirmPin('');
        setSetupStep('enter');
        return;
      }
      if (onSetupInitialPin) {
        await onSetupInitialPin(pin);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] select-none overflow-y-auto transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-sm flex flex-col items-center z-10 my-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-xl shadow-cyan-950/20 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Lock className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-pulse" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight text-center">
          {isSettingUp
            ? setupStep === 'enter'
              ? 'Create Secure PIN'
              : 'Confirm Your PIN'
            : 'ICU & CCU Personal Notebook'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center max-w-xs">
          {isSettingUp
            ? 'Create a secure 6-digit PIN. All medical records will be locally encrypted on this device with AES-GCM 256-bit.'
            : 'Confidential Patient Data — Enter your 6-digit PIN to decrypt session'}
        </p>

        <div className="flex items-center justify-center gap-3 my-6">
          {[0, 1, 2, 3, 4, 5].map(i => {
            const filled = i < pin.length;
            return (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                  filled
                    ? 'bg-cyan-500 border-cyan-400 scale-110 shadow-sm shadow-cyan-400'
                    : 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/40 px-3 py-1.5 rounded-lg mb-4 animate-shake">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSettingUp && pin.length === 6 && (
          <button
            onClick={handleSetupProceed}
            className="w-full mb-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-950/20 transition active:scale-98 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {setupStep === 'enter' ? 'Continue' : 'Set PIN & Encrypt'}
          </button>
        )}

        {!isSettingUp && securitySettings.biometricEnabled && biometricAvailable && (
          <button type="button" onClick={handleBiometricUnlock} disabled={biometricBusy} className="w-full max-w-xs mb-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-sm shadow-lg transition active:scale-98 flex items-center justify-center gap-2">
            <span className="text-lg">☝️</span>
            {biometricBusy ? 'Waiting for fingerprint…' : 'Unlock with Fingerprint'}
          </button>
        )}

        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 text-xl font-semibold text-slate-900 dark:text-white transition active:scale-95 shadow-sm active:bg-cyan-50 dark:active:bg-cyan-950/40 flex items-center justify-center"
            >
              {num}
            </button>
          ))}

          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-white dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 transition active:scale-95 flex items-center justify-center shadow-sm"
          >
            Clear
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xl font-semibold text-slate-900 dark:text-white transition active:scale-95 shadow-sm flex items-center justify-center"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-white dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition active:scale-95 flex items-center justify-center shadow-sm"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2 max-w-xs text-left shadow-sm">
          <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-900 dark:text-slate-200 font-semibold">100% Local-First & Offline</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              Zero cloud transmission. Protected by client-side Web Crypto AES-GCM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};