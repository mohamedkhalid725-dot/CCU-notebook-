import React, { useState } from 'react';
import { PatientRecord, LabPanelRecord, LabItem } from '../../types';
import { TestTube2, Plus, Trash2, X, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface PatientLabsProps { patient: PatientRecord; onUpdatePatient: (updated: PatientRecord) => void; }

const PANEL_TEMPLATES: Record<string, Array<{ name: string; unit: string; refRange: string }>> = {
  'Cardiac Markers': [
    { name: 'Troponin I (High Sens)', unit: 'ng/L', refRange: '< 14' }, { name: 'CK-MB', unit: 'ng/mL', refRange: '0.0 - 5.0' }, { name: 'Total CK', unit: 'U/L', refRange: '38 - 174' }, { name: 'BNP / NT-proBNP', unit: 'pg/mL', refRange: '< 125' }
  ],
  'Renal & Electrolytes': [
    { name: 'Sodium (Na+)', unit: 'mmol/L', refRange: '136 - 145' }, { name: 'Potassium (K+)', unit: 'mmol/L', refRange: '3.5 - 5.1' }, { name: 'Chloride (Cl-)', unit: 'mmol/L', refRange: '98 - 107' }, { name: 'Serum Urea', unit: 'mg/dL', refRange: '15 - 45' }, { name: 'Serum Creatinine', unit: 'mg/dL', refRange: '0.7 - 1.2' }, { name: 'eGFR', unit: 'mL/min/1.73m²', refRange: '> 60' }, { name: 'Serum Calcium', unit: 'mg/dL', refRange: '8.5 - 10.2' }, { name: 'Serum Magnesium', unit: 'mg/dL', refRange: '1.7 - 2.2' }
  ],
  'Complete Blood Count (CBC)': [
    { name: 'Hemoglobin (Hb)', unit: 'g/dL', refRange: '13.5 - 17.5' }, { name: 'Hematocrit (Hct)', unit: '%', refRange: '41 - 50' }, { name: 'White Blood Cells (WBC)', unit: 'x10³/µL', refRange: '4.5 - 11.0' }, { name: 'Platelets (Plt)', unit: 'x10³/µL', refRange: '150 - 450' }
  ],
  'Coagulation Profile': [
    { name: 'Prothrombin Time (PT)', unit: 'sec', refRange: '11.0 - 13.5' }, { name: 'INR', unit: 'ratio', refRange: '0.8 - 1.2' }, { name: 'aPTT', unit: 'sec', refRange: '25 - 35' }, { name: 'D-Dimer', unit: 'ng/mL', refRange: '< 500' }, { name: 'Fibrinogen', unit: 'mg/dL', refRange: '200 - 400' }
  ],
  'Liver Function (LFT)': [
    { name: 'ALT (SGPT)', unit: 'U/L', refRange: '7 - 56' }, { name: 'AST (SGOT)', unit: 'U/L', refRange: '10 - 40' }, { name: 'Total Bilirubin', unit: 'mg/dL', refRange: '0.2 - 1.2' }, { name: 'Direct Bilirubin', unit: 'mg/dL', refRange: '0.0 - 0.3' }, { name: 'Albumin', unit: 'g/dL', refRange: '3.5 - 5.0' }
  ],
  'Inflammatory & Glucose': [
    { name: 'Random Blood Glucose', unit: 'mg/dL', refRange: '70 - 140' }, { name: 'C-Reactive Protein (CRP)', unit: 'mg/L', refRange: '< 5.0' }, { name: 'Procalcitonin', unit: 'ng/mL', refRange: '< 0.5' }, { name: 'Serum Lactate', unit: 'mmol/L', refRange: '0.5 - 2.0' }
  ],
  'Lipid Profile': [
    { name: 'Total Cholesterol', unit: 'mg/dL', refRange: '< 200' }, { name: 'Triglycerides', unit: 'mg/dL', refRange: '< 150' }, { name: 'HDL Cholesterol', unit: 'mg/dL', refRange: '> 40' }, { name: 'LDL Cholesterol', unit: 'mg/dL', refRange: '< 70' }
  ]
};

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/[\s_-]+/g, ' ');

export const PatientLabs: React.FC<PatientLabsProps> = ({ patient, onUpdatePatient }) => {
  const labPanels = patient.labPanels || [];
  const [isAddingPanel, setIsAddingPanel] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('Cardiac Markers');
  const [panelTimestamp, setPanelTimestamp] = useState(() => new Date().toISOString().slice(0, 16).replace('T', ' '));
  const [newPanelItems, setNewPanelItems] = useState<LabItem[]>([]);
  const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({});

  const handleTemplateChange = (tmpl: string) => {
    setSelectedTemplate(tmpl);
    setNewPanelItems(PANEL_TEMPLATES[tmpl]
      ? PANEL_TEMPLATES[tmpl].map(t => ({ name: t.name, result: '', unit: t.unit, refRange: t.refRange, status: 'normal' }))
      : [{ name: 'Custom Test', result: '', unit: '', refRange: '', status: 'normal' }]);
  };

  const handleStartAdd = () => { setIsAddingPanel(true); handleTemplateChange('Cardiac Markers'); };

  // A lab test is now a single logical row. New measurements are appended to its history.
  const handleSaveNewPanel = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = newPanelItems.filter(it => it.name.trim() && it.result.trim());
    if (!validItems.length) { alert('Please enter at least one test result value.'); return; }

    const timestamp = panelTimestamp;
    const nextPanels = labPanels.map(panel => ({ ...panel, items: [...panel.items] }));
    const panelName = selectedTemplate;
    let targetPanel = nextPanels.find(p => p.panelName === panelName);

    if (!targetPanel) {
      targetPanel = { id: `lab-${Date.now()}`, panelName, timestamp, items: [] } as LabPanelRecord;
      nextPanels.unshift(targetPanel);
    }

    validItems.forEach(incoming => {
      const existing = targetPanel!.items.find(item => normalizeName(item.name) === normalizeName(incoming.name));
      if (existing) {
        // Backward-compatible history stored on the LabItem without breaking existing records.
        const history = Array.isArray((existing as any).history) ? [...(existing as any).history] : [{ timestamp: targetPanel!.timestamp, result: existing.result, status: existing.status }];
        history.push({ timestamp, result: incoming.result, status: incoming.status });
        (existing as any).history = history;
        existing.result = incoming.result;
        existing.status = incoming.status;
        existing.unit = incoming.unit || existing.unit;
        existing.refRange = incoming.refRange || existing.refRange;
      } else {
        (targetPanel!.items as any).push({ ...incoming, history: [{ timestamp, result: incoming.result, status: incoming.status }] });
      }
    });

    targetPanel.timestamp = timestamp;
    onUpdatePatient({ ...patient, labPanels: nextPanels, lastUpdated: new Date().toISOString() });
    setIsAddingPanel(false);
  };

  const handleDeletePanel = (panelId: string) => {
    if (!confirm('Delete this laboratory panel record?')) return;
    onUpdatePatient({ ...patient, labPanels: labPanels.filter(p => p.id !== panelId), lastUpdated: new Date().toISOString() });
  };

  const getHistory = (item: LabItem): Array<{ timestamp: string; result: string; status?: string }> => {
    const history = (item as any).history;
    if (Array.isArray(history) && history.length) return history;
    return [{ timestamp: '', result: item.result, status: item.status }];
  };

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div><h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"><TestTube2 className="text-emerald-500" size={18}/>Structured Laboratory Results</h3><p className="text-xs text-slate-500 dark:text-slate-400">Repeated tests stay in the same row with a complete result history.</p></div>
      <button onClick={handleStartAdd} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"><Plus size={14}/>Add Lab Panel</button>
    </div>

    {isAddingPanel && <form onSubmit={handleSaveNewPanel} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"><h4 className="text-sm font-bold text-slate-900 dark:text-white">Record New Laboratory Results</h4><button type="button" onClick={() => setIsAddingPanel(false)}><X size={16}/></button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div><label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Panel / Category:</label><select value={selectedTemplate} onChange={e => handleTemplateChange(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">{Object.keys(PANEL_TEMPLATES).map(t => <option key={t}>{t}</option>)}<option>Custom Panel</option></select></div>
        <div><label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Sample Date & Time:</label><input type="text" value={panelTimestamp} onChange={e => setPanelTimestamp(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"/></div>
      </div>
      <div className="space-y-2"><span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Test Values:</span><div className="space-y-2 max-h-72 overflow-y-auto pr-1">{newPanelItems.map((item, idx) => <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
        <input className="col-span-4 sm:col-span-3 px-2 py-1 rounded-lg border bg-white dark:bg-slate-900" value={item.name} onChange={e => { const c=[...newPanelItems]; c[idx]={...c[idx],name:e.target.value}; setNewPanelItems(c); }}/>
        <input className="col-span-3 px-2 py-1 rounded-lg border bg-white dark:bg-slate-900 font-bold" placeholder="Result value" value={item.result} onChange={e => { const c=[...newPanelItems]; c[idx]={...c[idx],result:e.target.value}; setNewPanelItems(c); }}/>
        <input className="col-span-2 px-2 py-1 rounded-lg border bg-white dark:bg-slate-900" placeholder="Unit" value={item.unit} onChange={e => { const c=[...newPanelItems]; c[idx]={...c[idx],unit:e.target.value}; setNewPanelItems(c); }}/>
        <select className="col-span-3 px-2 py-1 rounded-lg border bg-white dark:bg-slate-900" value={item.status} onChange={e => { const c=[...newPanelItems]; c[idx]={...c[idx],status:e.target.value as any}; setNewPanelItems(c); }}><option value="normal">Normal</option><option value="high">High ↑</option><option value="low">Low ↓</option><option value="critical">Critical ⚠️</option></select>
      </div>)}</div>
      <button type="button" onClick={() => setNewPanelItems([...newPanelItems,{name:'',result:'',unit:'',refRange:'',status:'normal'}])} className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><Plus size={13}/>Add another test</button></div>
      <div className="flex justify-end gap-2 border-t pt-3"><button type="button" onClick={() => setIsAddingPanel(false)} className="px-3.5 py-1.5 rounded-xl border text-xs">Cancel</button><button type="submit" className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold">Save Results</button></div>
    </form>}

    {labPanels.length ? <div className="space-y-4">{labPanels.map(panel => <div key={panel.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b pb-2.5"><div className="flex items-center gap-2"><TestTube2 size={16} className="text-emerald-500"/><div><h4 className="text-sm font-bold text-slate-900 dark:text-white">{panel.panelName}</h4><span className="text-[11px] text-slate-400 flex items-center gap-1"><Clock size={11}/>{panel.timestamp}</span></div></div><button onClick={() => handleDeletePanel(panel.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={14}/></button></div>
      <div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead><tr className="text-[11px] font-semibold text-slate-400 border-b"><th className="pb-2">Test Name</th><th className="pb-2">Latest Result</th><th className="pb-2">Reference Range</th><th className="pb-2 text-right">History</th></tr></thead><tbody className="divide-y">{panel.items.map((item,idx) => { const history=getHistory(item); const key=`${panel.id}-${idx}`; const expanded=!!expandedTests[key]; return <React.Fragment key={idx}><tr><td className="py-2 font-medium text-slate-800 dark:text-slate-200">{item.name}</td><td className="py-2 font-bold text-slate-900 dark:text-white">{item.result} {item.unit}</td><td className="py-2 text-slate-400">{item.refRange ? `${item.refRange} ${item.unit}` : '—'}</td><td className="py-2 text-right"><button onClick={() => setExpandedTests(v=>({...v,[key]:!v[key]}))} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">{history.length > 1 ? `${history.length} readings` : 'History'}{expanded?<ChevronUp size={13}/>:<ChevronDown size={13}/>}</button></td></tr>{expanded && <tr><td colSpan={4} className="pb-3"><div className="ml-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3"><div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Previous & Current Measurements</div><div className="space-y-1.5">{[...history].reverse().map((h,i)=><div key={i} className="flex justify-between gap-3 text-xs"><span className="text-slate-500">{h.timestamp || 'Recorded result'}</span><span className="font-bold text-slate-900 dark:text-white">{h.result} {item.unit}</span></div>)}</div></div></td></tr>}</React.Fragment>})}</tbody></table></div>
    </div>)}</div> : <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border text-center text-sm font-bold text-slate-700 dark:text-slate-300">No Structured Lab Panels Recorded Yet</div>}
  </div>;
};
