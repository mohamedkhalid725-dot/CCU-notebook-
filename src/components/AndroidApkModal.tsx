import React from 'react';
import { 
  Smartphone, 
  X, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { usePWAInstall } from '../services/pwa';

interface AndroidApkModalProps {
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Android APK & Offline Installation
              </h3>
              <p className="text-xs text-slate-400">Run as a native Android App on your mobile/tablet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {/* Option 1: Native WebAPK Install (Instant & Recommended) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-950 border border-cyan-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Method 1: Direct Android Installation (WebAPK)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-900 text-cyan-200">
                Recommended
              </span>
            </div>
            <p className="text-slate-300">
              On Android, Google Chrome automatically compiles this application into an official <strong>WebAPK</strong> when installed:
            </p>
            <ul className="space-y-1.5 text-slate-400 pl-4 list-disc">
              <li>Appears directly in your <strong className="text-white">Android App Drawer</strong> with the medical app icon.</li>
              <li>Runs in full-screen standalone mode with no browser URL bar or controls.</li>
              <li><strong className="text-emerald-400">100% Offline:</strong> Local database encrypted with AES-GCM on your device storage.</li>
              <li>Fingerprint & PIN lock security enabled natively.</li>
            </ul>

            {isInstallable ? (
              <button
                onClick={async () => {
                  await install();
                  onClose();
                }}
                className="w-full mt-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition active:scale-95 text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Install on this Android Device Now</span>
              </button>
            ) : isInstalled ? (
              <div className="p-2 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-center font-medium">
                ✓ Already installed as a native app on this device!
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <strong>To install in Chrome on Android:</strong><br />
                Tap Chrome menu <span className="text-cyan-400">(⋮ 3 dots)</span> &rarr; select <strong className="text-white">"Install App"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
              </div>
            )}
          </div>

          {/* Option 2: Standalone .APK File Generation */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <span className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              Method 2: Standalone .APK / Google Play Package
            </span>
            <p className="text-slate-400">
              If you require an actual <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">.apk</code> installer file to distribute or install via USB:
            </p>
            <ol className="space-y-1.5 text-slate-300 pl-4 list-decimal">
              <li>
                Visit <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-semibold">PWABuilder.com</a> (Free by Microsoft).
              </li>
              <li>Enter your app URL and click <strong className="text-white">Start</strong>.</li>
              <li>Choose <strong className="text-white">Android Package</strong> &rarr; click <strong className="text-white">Generate APK</strong>.</li>
              <li>Download the signed <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">.apk</code> file directly to your phone.</li>
            </ol>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-300">Personal ICU Notebook Architecture:</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All patient records remain encrypted locally on the device (SQLite / IndexedDB / WebCrypto). Nothing ever touches external servers.
              </p>
            </div>
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
