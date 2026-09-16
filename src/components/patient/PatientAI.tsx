import React, { useMemo, useState } from 'react';
import { AlertTriangle, Brain, CheckCircle2, KeyRound, Loader2, Send, Sparkles, Trash2 } from 'lucide-react';
import { PatientRecord } from '../../types';
import { analyzePatientWithAI, askClinicalAI, clearAiApiKey, getAiApiKey, setAiApiKey } from '../../services/ai';

interface Props {
  patient: PatientRecord;
}

const buildDeidentifiedContext = (patient: PatientRecord) => {
  const clone = JSON.parse(JSON.stringify(patient));
  delete clone.name;
  delete clone.mrn;
  delete clone.id;
  return clone;
};

export const PatientAI: React.FC<Props> = ({ patient }) => {
  const [apiKey, setApiKey] = useState(getAiApiKey());
  const [draftKey, setDraftKey] = useState(getAiApiKey());
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const context = useMemo(() => buildDeidentifiedContext(patient), [patient]);

  const saveKey = () => {
    setAiApiKey(draftKey);
    setApiKey(draftKey.trim());
    setError('');
  };

  const removeKey = () => {
    clearAiApiKey();
    setDraftKey('');
    setApiKey('');
    setAnswer('');
  };

  const run = async (mode: 'analyze' | 'ask') => {
    if (!getAiApiKey()) {
      setError('Add your Gemini API key first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = mode === 'analyze'
        ? await analyzePatientWithAI(context)
        : await askClinicalAI(question.trim(), context);
      setAnswer(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI request failed. Check your API key and internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-slate-900 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Brain size={22} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Sparkles size={15} className="text-violet-500" /> Clinical AI Assistant</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Gemini-powered clinical documentation support. The patient name, MRN and local record ID are removed before the request is sent.</p>
          </div>
        </div>
      </section>

      {!apiKey ? (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><KeyRound size={16} className="text-amber-500" /> Configure Gemini</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Enter your Gemini API key. It is stored locally on this device and is not uploaded to CardioVault/Firebase.</p>
          <input value={draftKey} onChange={e => setDraftKey(e.target.value)} type="password" autoComplete="off" placeholder="Gemini API key" className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500" />
          <button onClick={saveKey} disabled={!draftKey.trim()} className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-sm">Save AI Key</button>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><CheckCircle2 size={16} className="text-emerald-500" /> AI is configured</div>
            <button onClick={removeKey} className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-500"><Trash2 size={14} /> Remove key</button>
          </div>
          <button onClick={() => run('analyze')} disabled={loading} className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-bold text-sm inline-flex items-center justify-center gap-2">
            {loading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
            Analyze Current Patient
          </button>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="text-sm font-bold text-slate-900 dark:text-white">Ask about this record</div>
        <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={4} placeholder="e.g. What important trends should I review on the next round?" className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 resize-none" />
        <button onClick={() => run('ask')} disabled={loading || !question.trim() || !apiKey} className="w-full h-11 rounded-xl border border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 disabled:opacity-50 font-semibold text-sm inline-flex items-center justify-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Ask AI
        </button>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-4 text-sm text-rose-700 dark:text-rose-300 flex gap-2"><AlertTriangle size={17} className="shrink-0 mt-0.5" /> <span>{error}</span></div>}

      {answer && <section className="rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-white dark:bg-slate-900 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-violet-700 dark:text-violet-300 mb-3"><Sparkles size={16} /> AI Response</div>
        <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{answer}</div>
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">AI output is decision support only. Verify findings against the original chart, bedside assessment and local protocols.</div>
      </section>}
    </div>
  );
};
