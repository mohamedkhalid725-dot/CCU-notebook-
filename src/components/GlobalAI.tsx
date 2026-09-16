import React, { useState } from 'react';
import { Brain, KeyRound, Loader2, Send, Settings, Sparkles, X } from 'lucide-react';
import { askClinicalAI, getAiApiKey, setAiApiKey } from '../services/ai';

export const GlobalAI: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(getAiApiKey());
  const [draftKey, setDraftKey] = useState(getAiApiKey());
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const saveKey = () => {
    setAiApiKey(draftKey);
    setKey(draftKey.trim());
    setError('');
  };

  const ask = async () => {
    if (!getAiApiKey()) {
      setError('Please configure your Gemini API key first.');
      return;
    }
    if (!question.trim()) return;
    setLoading(true);
    setError('');
    try {
      setAnswer(await askClinicalAI(question.trim()));
      setQuestion('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Open Clinical AI" title="Clinical AI" className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-xl flex items-center justify-center transition active:scale-95">
        <Brain size={23} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-2 sm:p-5 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center"><Sparkles size={17} /></div><div><div className="font-bold text-sm text-slate-900 dark:text-white">CardioVault Clinical AI</div><div className="text-[11px] text-slate-500 dark:text-slate-400">Gemini clinical documentation assistant</div></div></div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X size={18} /></button>
            </header>

            <div className="p-4 overflow-y-auto space-y-3">
              {!key && <section className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-2"><div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300"><KeyRound size={15} /> Gemini API key required</div><p className="text-[11px] text-amber-700 dark:text-amber-400">The key is stored locally on this device. Do not enter a key you are not authorized to use.</p><input type="password" value={draftKey} onChange={e => setDraftKey(e.target.value)} placeholder="Paste Gemini API key" autoComplete="off" className="w-full h-11 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 px-3 text-sm outline-none" /><button onClick={saveKey} disabled={!draftKey.trim()} className="w-full h-10 rounded-xl bg-amber-600 disabled:opacity-50 text-white text-sm font-bold">Save key</button></section>}

              {key && <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400"><span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> AI ready</span><button onClick={() => { setKey(''); setDraftKey(''); setAiApiKey(''); }} className="inline-flex items-center gap-1 hover:text-violet-600"><Settings size={13} /> Change key</button></div>}

              {answer && <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{answer}</div>}
              {error && <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-700 dark:text-rose-300">{error}</div>}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <textarea value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }} disabled={!key || loading} rows={2} placeholder="Ask a clinical documentation question..." className="flex-1 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none resize-none disabled:opacity-50" />
              <button onClick={ask} disabled={!key || !question.trim() || loading} className="self-end w-11 h-11 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white flex items-center justify-center">{loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
