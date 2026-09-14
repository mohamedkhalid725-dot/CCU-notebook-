import fs from 'node:fs';

const path = 'src/components/patient/PatientClinicalCalculators.tsx';
let source = fs.readFileSync(path, 'utf8');

const oldInput = `    <input type="text" inputMode={inputMode || (step==='1'?'numeric':'decimal')} enterKeyHint="done" value={value===undefined?'':String(value)} onChange={e=>onChange(e.target.value)} autoComplete="off" autoCorrect="off" spellCheck={false} className="block w-full h-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />`;
const currentHardenedInput = `    <input type="text" inputMode={inputMode || (step==='1'?'numeric':'decimal')} enterKeyHint="done" value={value===undefined?'':String(value)} onChange={e=>onChange(e.target.value)} onPointerDown={e=>{e.stopPropagation(); e.currentTarget.focus();}} onTouchStart={e=>{e.stopPropagation(); e.currentTarget.focus();}} onInput={e=>onChange(e.currentTarget.value)} onFocus={e=>e.currentTarget.scrollIntoView({block:'nearest'})} readOnly={false} disabled={false} autoComplete="off" autoCorrect="off" spellCheck={false} className="pointer-events-auto touch-manipulation block w-full h-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />`;
const previousHardenedInput = `    <input type="text" inputMode={inputMode || (step==='1'?'numeric':'decimal')} enterKeyHint="done" value={value===undefined?'':String(value)} onChange={e=>onChange(e.target.value)} onPointerDown={e=>e.stopPropagation()} onTouchStart={e=>e.stopPropagation()} onFocus={e=>e.currentTarget.scrollIntoView({block:'nearest'})} readOnly={false} disabled={false} autoComplete="off" autoCorrect="off" spellCheck={false} className="pointer-events-auto touch-manipulation block w-full h-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />`;

if (source.includes(oldInput)) {
  source = source.replace(oldInput, currentHardenedInput);
} else if (source.includes(previousHardenedInput)) {
  source = source.replace(previousHardenedInput, currentHardenedInput);
} else if (!source.includes(currentHardenedInput)) {
  throw new Error('Expected patient calculator input signature not found; refusing unrelated changes.');
}

const oldRoot = `  return <div className="space-y-4" id="clinical-calculators">`;
const newRoot = `  return <div className="space-y-4 pointer-events-auto touch-manipulation" id="clinical-calculators">`;
if (source.includes(oldRoot)) source = source.replace(oldRoot, newRoot);

fs.writeFileSync(path, source);
console.log(`Hardened ${path}: calculator inputs explicitly focus on touch and update on both input/change events.`);
