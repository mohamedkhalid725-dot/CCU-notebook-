import fs from 'node:fs';

const path = 'src/components/patient/PatientClinicalCalculators.tsx';
let source = fs.readFileSync(path, 'utf8');

const oldInput = `    <input type="text" inputMode={inputMode || (step==='1'?'numeric':'decimal')} enterKeyHint="done" value={value===undefined?'':String(value)} onChange={e=>onChange(e.target.value)} autoComplete="off" autoCorrect="off" spellCheck={false} className="block w-full h-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />`;
const newInput = `    <input type="text" inputMode={inputMode || (step==='1'?'numeric':'decimal')} enterKeyHint="done" value={value===undefined?'':String(value)} onChange={e=>onChange(e.target.value)} onPointerDown={e=>e.stopPropagation()} onTouchStart={e=>e.stopPropagation()} onFocus={e=>e.currentTarget.scrollIntoView({block:'nearest'})} readOnly={false} disabled={false} autoComplete="off" autoCorrect="off" spellCheck={false} className="pointer-events-auto touch-manipulation block w-full h-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />`;

if (!source.includes(oldInput)) throw new Error('Expected patient calculator input signature not found; refusing unrelated changes.');
source = source.replace(oldInput, newInput);

const oldRoot = `  return <div className="space-y-4">`;
const newRoot = `  return <div className="space-y-4 pointer-events-auto touch-manipulation">`;
if (!source.includes(oldRoot)) throw new Error('Expected patient calculator root not found; refusing unrelated changes.');
source = source.replace(oldRoot, newRoot);

fs.writeFileSync(path, source);
console.log(`Hardened ${path} without changing calculator definitions or other patient-file tabs.`);
