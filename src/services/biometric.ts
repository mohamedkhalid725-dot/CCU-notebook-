import { Capacitor } from '@capacitor/core';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

const BIOMETRIC_PIN_KEY = 'cardiovault_biometric_pin';

export async function isBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const result = await BiometricAuth.checkBiometry();
    return result.isAvailable;
  } catch {
    return false;
  }
}

export async function enableBiometricUnlock(pin: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || !pin) return false;
  if (!(await isBiometricAvailable())) return false;
  await BiometricAuth.authenticate({
    reason: 'Verify your identity to enable fingerprint unlock for CardioVault',
    cancelTitle: 'Cancel',
    allowDeviceCredential: false,
    androidTitle: 'Enable Fingerprint Unlock',
    androidSubtitle: 'Authenticate to protect your clinical notebook',
    androidConfirmationRequired: false,
  });
  await SecureStorage.set(BIOMETRIC_PIN_KEY, pin);
  return true;
}

export async function disableBiometricUnlock(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try { await SecureStorage.remove(BIOMETRIC_PIN_KEY); } catch {}
}

export async function authenticateBiometricAndGetPin(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;
  if (!(await isBiometricAvailable())) return null;
  try {
    await BiometricAuth.authenticate({
      reason: 'Unlock your confidential ICU & CCU clinical notebook',
      cancelTitle: 'Use PIN',
      allowDeviceCredential: false,
      androidTitle: 'Unlock CardioVault',
      androidSubtitle: 'Use your fingerprint to unlock clinical data',
      androidConfirmationRequired: false,
    });
    const stored = await SecureStorage.get(BIOMETRIC_PIN_KEY);
    return typeof stored === 'string' && stored.length > 0 ? stored : null;
  } catch {
    return null;
  }
}
