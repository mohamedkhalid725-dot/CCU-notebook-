import React, { useState } from 'react';
import { AppSecuritySettings, PatientRecord } from '../types';
import { 
  Shield, 
  X, 
  Key, 
  Fingerprint, 
  Clock, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Lock,
  FileCheck
} from 'lucide-react';
import { 
  setupNewPin, 
  saveSecuritySettings, 
  exportEncryptedBackup, 
  importEncryptedBackup,
  wipeAllLocalData
} from '../services/storage';

interface SecuritySettingsModalProps {
  securitySettings: AppSecuritySettings;
  patients: PatientRecord[];
  currentActivePin: string;
  onUpdateSecurity: (newSettings: AppSecuritySettings) => void;
  onRestorePatients: (restoredPatients: PatientRecord[]) => void;
  onClose: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  securitySettings,
  patients,
  currentActivePin,
  onUpdateSecurity,
  onRestorePatients,
  onClose
}) => {
  // Pin Change state
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStatusMsg, setPinStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Auto-lock & Biometric
  const [autoLockMin, setAutoLockMin] = useState<number>(securitySettings.autoLockMinutes);
  const [biometric, setBiometric] = useState<boolean>(securitySettings.biometricEnabled);

  // Backup state
  const [backupPassphrase, setBackupPassphrase] = useState('');
  const [backupStatus, setBackupStatus] = useState<string>('');
  const [importPassphrase, setImportPassphrase] = useState('');
  const [importStatus, setImportStatus] = useState<{ text: string; error?: boolean } | null>(null);

  // Wipe confirmation
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const handleSavePin = async () => {
    if (newPin.length < 4) {
      setPinStatusMsg({ text: 'PIN must be at least 4 digits', error: true });
      return;
    }
    if (newPin !== confirmPin) {
      setPinStatusMsg({ text: 'PINs do not match', error: true });
      return;
    }

    try {
      await setupNewPin(newPin, currentActivePin);
      setPinStatusMsg({ text: 'PIN updated & database re-encrypted successfully!', error: false });
      setNewPin('');
      setConfirmPin('');
      setShowChangePin(false);
      onUpdateSecurity({
        ...securitySettings,
        isPinSet: true
      });
    } catch {
      setPinStatusMsg({ text: 'Failed to update PIN', error: true });
    }
  };

  const handleSavePreferences = () => {
    const updated: AppSecuritySettings = {
      ...securitySettings,
      autoLockMinutes: autoLockMin,
      biometricEnabled: biometric
    };
    saveSecuritySettings(updated);
    onUpdateSecurity(updated);
    setBackupStatus('Security preferences saved');
    setTimeout(() => setBackupStatus(''), 2500);
  };

  const handleExportBackup = async () => {
    if (!backupPassphrase) {
      setBackupStatus('Please enter an encryption passphrase for the backup file');
      return;
    }
    try {
      const backupJson = await exportEncryptedBackup(backupPassphrase, patients);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `ICU_Notebook_Backup_Encrypted_${dateStr}.icubackup`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatus('Encrypted backup downloaded successfully.');
      setBackupPassphrase('');
    } catch (err) {
      console.error(err);
      setBackupStatus('Export failed');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!importPassphrase) {
      setImportStatus({ text: 'Please enter the decryption passphrase first', error: true });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const restored = await importEncryptedBackup(text, importPassphrase);
        onRestorePatients(restored);
        setImportStatus({ text: `Successfully restored ${restored.length} patient records!`, error: false });
        setImportPassphrase('');
      } catch (err) {
        setImportStatus({ text: 'Failed to decrypt backup. Incorrect password or invalid file.', error: true });
      }
    };
    reader.readAsText(file);
  };

  const handleWipeData = () => {
    wipeAllLocalData();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Privacy, Security & Encrypted Backup
              </h3>
              <p className="text-xs text-slate-400">
                100% Local-First — Medical confidentiality protected on device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Section 1: PIN & Biometrics */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                PIN Protection & Biometric
              </div>
              <button
                onClick={() => setShowChangePin(!showChangePin)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium text-xs border border-slate-700 transition"
              >
                {showChangePin ? 'Cancel' : 'Change PIN'}
              </button>
            </div>

            {showChangePin && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 mt-2">
                <div className="text-[11px] text-slate-300 font-semibold">Enter New PIN (4 - 6 digits):</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="New PIN"
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono tracking-widest text-center"
                  />
                  <input
                    type="password"
                    maxLength={6}
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Confirm PIN"
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono tracking-widest text-center"
                  />
                </div>
                <button
                  onClick={handleSavePin}
                  className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
                >
                  Confirm & Re-encrypt Database
                </button>
              </div>
            )}

            {pinStatusMsg && (
              <div className={`p-2 rounded-lg text-xs ${pinStatusMsg.error ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                {pinStatusMsg.text}
              </div>
            )}

            {/* Biometric Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-semibold text-slate-200">Biometric / Fingerprint Unlock</span>
                  <p className="text-[10px] text-slate-400">Unlock quickly using device biometrics</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={biometric}
                onChange={e => setBiometric(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
              />
            </div>

            {/* Auto-lock timer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-semibold text-slate-200">Auto-Lock Timer</span>
                  <p className="text-[10px] text-slate-400">Lock notebook on inactivity or tab change</p>
                </div>
              </div>
              <select
                value={autoLockMin}
                onChange={e => setAutoLockMin(Number(e.target.value))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
              >
                <option value={0}>Immediate (on tab blur / hide)</option>
                <option value={1}>1 Minute</option>
                <option value={5}>5 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={-1}>Disabled (manual only)</option>
              </select>
            </div>

            <button
              onClick={handleSavePreferences}
              className="w-full mt-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition text-xs"
            >
              Save Security Preferences
            </button>
          </div>

          {/* Section 2: Encrypted Backup & Restore */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Encrypted Backup & Migration
            </div>
            <p className="text-[11px] text-slate-400">
              Export your patient records as an encrypted file (.icubackup) protected by a passphrase. You can transfer this file to another phone or tablet securely.
            </p>

            {/* Export */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-200 block">Export Encrypted Backup:</span>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Backup encryption password"
                  value={backupPassphrase}
                  onChange={e => setBackupPassphrase(e.target.value)}
                  className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
                <button
                  onClick={handleExportBackup}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Import */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-200 block">Restore from Backup:</span>
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Passphrase used when creating backup"
                  value={importPassphrase}
                  onChange={e => setImportPassphrase(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
                <label className="flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-900 cursor-pointer text-slate-300 font-medium transition">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select .icubackup file to restore</span>
                  <input
                    type="file"
                    accept=".icubackup,.json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {backupStatus && (
              <div className="p-2 rounded-lg bg-slate-900 text-cyan-300 border border-cyan-800/40 text-xs">
                {backupStatus}
              </div>
            )}
            {importStatus && (
              <div className={`p-2 rounded-lg text-xs ${importStatus.error ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                {importStatus.text}
              </div>
            )}
          </div>

          {/* Section 3: Wipe All Data */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-2">
            <div className="font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Wipe All Local Data (Emergency Purge)
            </div>
            <p className="text-[11px] text-rose-200/80">
              Permanently deletes all patient records, encrypted keys, and notebook settings from this device.
            </p>

            {!showWipeConfirm ? (
              <button
                onClick={() => setShowWipeConfirm(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-800 text-rose-200 border border-rose-700/60 font-medium transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe Database & Reset App</span>
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-rose-950 border border-rose-700 space-y-2">
                <span className="text-white font-bold block text-xs">
                  Are you absolutely certain? This cannot be undone.
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleWipeData}
                    className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold"
                  >
                    Yes, Permanently Wipe Everything
                  </button>
                  <button
                    onClick={() => setShowWipeConfirm(false)}
                    className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
