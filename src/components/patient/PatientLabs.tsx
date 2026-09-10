import React, { useState } from 'react';
import { PatientRecord, LabPanelRecord, LabItem } from '../../types';
import {
  TestTube2,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Clock,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PatientLabsProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

const PANEL_TEMPLATES: Record<string, Array<{ name: string; unit: string; refRange: string }>> = {
  'Cardiac Markers': [
    { name: 'Troponin I (High Sens)', unit: 'ng/L', refRange: '< 14' },
    { name: 'CK-MB', unit: 'ng/mL', refRange: '0.0 - 5.0' },
    { name: 'Total CK', unit: 'U/L', refRange: '38 - 174' },
    { name: 'BNP / NT-proBNP', unit: 'pg/mL', refRange: '< 125' },
  ],
  'Renal & Electrolytes': [
    { name: 'Sodium (Na+)', unit: 'mmol/L', refRange: '136 - 145' },
    { name: 'Potassium (K+)', unit: 'mmol/L', refRange: '3.5 - 5.1' },
    { name: 'Chloride (Cl-)', unit: 'mmol/L', refRange: '98 - 107' },
    { name: 'Serum Urea', unit: 'mg/dL', refRange: '15 - 45' },
    { name: 'Serum Creatinine', unit: 'mg/dL', refRange: '0.7 - 1.2' },
    { name: 'eGFR', unit: 'mL/min/1.73m²', refRange: '> 60' },
    { name: 'Serum Calcium', unit: 'mg/dL', refRange: '8.5 - 10.2' },
    { name: 'Serum Magnesium', unit: 'mg/dL', refRange: '1.7 - 2.2' },
  ],
  'Complete Blood Count (CBC)': [
    { name: 'Hemoglobin (Hb)', unit: 'g/dL', refRange: '13.5 - 17.5' },
    { name: 'Hematocrit (Hct)', unit: '%', refRange: '41 - 50' },
    { name: 'White Blood Cells (WBC)', unit: 'x10³/µL', refRange: '4.5 - 11.0' },
    { name: 'Platelets (Plt)', unit: 'x10³/µL', refRange: '150 - 450' },
  ],
  'Coagulation Profile': [
    { name: 'Prothrombin Time (PT)', unit: 'sec', refRange: '11.0 - 13.5' },
    { name: 'INR', unit: 'ratio', refRange: '0.8 - 1.2' },
    { name: 'aPTT', unit: 'sec', refRange: '25 - 35' },
    { name: 'D-Dimer', unit: 'ng/mL', refRange: '< 500' },
    { name: 'Fibrinogen', unit: 'mg/dL', refRange: '200 - 400' },
  ],
  'Liver Function (LFT)': [
    { name: 'ALT (SGPT)', unit: 'U/L', refRange: '7 - 56' },
    { name: 'AST (SGOT)', unit: 'U/L', refRange: '10 - 40' },
    { name: 'Total Bilirubin', unit: 'mg/dL', refRange: '0.2 - 1.2' },
    { name: 'Direct Bilirubin', unit: 'mg/dL', refRange: '0.0 - 0.3' },
    { name: 'Albumin', unit: 'g/dL', refRange: '3.5 - 5.0' },
  ],
  'Inflammatory & Glucose': [
    { name: 'Random Blood Glucose', unit: 'mg/dL', refRange: '70 - 140' },
    { name: 'C-Reactive Protein (CRP)', unit: 'mg/L', refRange: '< 5.0' },
    { name: 'Procalcitonin', unit: 'ng/mL', refRange: '< 0.5' },
    { name: 'Serum Lactate', unit: 'mmol/L', refRange: '0.5 - 2.0' },
  ],
  'Lipid Profile': [
    { name: 'Total Cholesterol', unit: 'mg/dL', refRange: '< 200' },
    { name: 'Triglycerides', unit: 'mg/dL', refRange: '< 150' },
    { name: 'HDL Cholesterol', unit: 'mg/dL', refRange: '> 40' },
    { name: 'LDL Cholesterol', unit: 'mg/dL', refRange: '< 70' },
  ],
};

export const PatientLabs: React.FC<PatientLabsProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const labPanels = patient.labPanels || [];

  // Adding Panel Modal/Drawer state
  const [isAddingPanel, setIsAddingPanel] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('Cardiac Markers');
  const [panelTimestamp, setPanelTimestamp] = useState<string>(() =>
    new Date().toISOString().slice(0, 16).replace('T', ' ')
  );
  const [newPanelItems, setNewPanelItems] = useState<LabItem[]>([]);

  // Editing existing panel state
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);

  // Initialize new items when template changes
  const handleTemplateChange = (tmpl: string) => {
    setSelectedTemplate(tmpl);
    if (PANEL_TEMPLATES[tmpl]) {
      setNewPanelItems(
        PANEL_TEMPLATES[tmpl].map((t) => ({
          name: t.name,
          result: '',
          unit: t.unit,
          refRange: t.refRange,
          status: 'normal',
        }))
      );
    } else {
      setNewPanelItems([{ name: 'Custom Test', result: '', unit: '', refRange: '', status: 'normal' }]);
    }
  };

  const handleStartAdd = () => {
    setIsAddingPanel(true);
    handleTemplateChange('Cardiac Markers');
  };

  const handleSaveNewPanel = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = newPanelItems.filter((it) => it.name.trim() && it.result.trim());
    if (validItems.length === 0) {
      alert('Please enter at least one test result value.');
      return;
    }

    const newPanel: LabPanelRecord = {
      id: `lab-${Date.now()}`,
      panelName: selectedTemplate,
      timestamp: panelTimestamp,
      items: validItems,
    };

    const updated = {
      ...patient,
      labPanels: [newPanel, ...labPanels],
      lastUpdated: new Date().toISOString(),
    };
    onUpdatePatient(updated);
    setIsAddingPanel(false);
  };

  const handleDeletePanel = (panelId: string) => {
    if (confirm('Delete this laboratory panel record?')) {
      const updated = {
        ...patient,
        labPanels: labPanels.filter((p) => p.id !== panelId),
        lastUpdated: new Date().toISOString(),
      };
      onUpdatePatient(updated);
    }
  };

  const handleUpdateItemInPanel = (panelId: string, itemIdx: number, field: keyof LabItem, value: any) => {
    const updatedPanels = labPanels.map((p) => {
      if (p.id === panelId) {
        const newItems = [...p.items];
        newItems[itemIdx] = { ...newItems[itemIdx], [field]: value };
        return { ...p, items: newItems };
      }
      return p;
    });

    onUpdatePatient({
      ...patient,
      labPanels: updatedPanels,
      lastUpdated: new Date().toISOString(),
    });
  };

  const getStatusBadge = (status: LabItem['status']) => {
    switch (status) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-600 text-white animate-pulse">
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            High ↑
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
            Low ↓
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TestTube2 className="text-emerald-500" size={18} />
            <span>Structured Laboratory Results</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cardiac biomarkers, chemistry, hematology panels, electrolytes and metabolic profiles
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus size={14} />
          <span>Add Lab Panel</span>
        </button>
      </div>

      {/* Add Panel Drawer / Form */}
      {isAddingPanel && (
        <form
          onSubmit={handleSaveNewPanel}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-lg space-y-4 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus size={16} className="text-emerald-500" />
              <span>Record New Laboratory Panel</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingPanel(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Panel / Category:
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {Object.keys(PANEL_TEMPLATES).map((tmpl) => (
                  <option key={tmpl} value={tmpl}>
                    {tmpl}
                  </option>
                ))}
                <option value="Custom Panel">Custom Panel</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Sample Date & Time:
              </label>
              <input
                type="text"
                value={panelTimestamp}
                onChange={(e) => setPanelTimestamp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Items input list */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Test Values & Interpretations:
            </span>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {newPanelItems.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="col-span-4 sm:col-span-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const copy = [...newPanelItems];
                        copy[idx].name = e.target.value;
                        setNewPanelItems(copy);
                      }}
                      placeholder="Test name"
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-3">
                    <input
                      type="text"
                      value={item.result}
                      onChange={(e) => {
                        const copy = [...newPanelItems];
                        copy[idx].result = e.target.value;
                        setNewPanelItems(copy);
                      }}
                      placeholder="Result value"
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => {
                        const copy = [...newPanelItems];
                        copy[idx].unit = e.target.value;
                        setNewPanelItems(copy);
                      }}
                      placeholder="Unit"
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[11px]"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-3">
                    <select
                      value={item.status}
                      onChange={(e) => {
                        const copy = [...newPanelItems];
                        copy[idx].status = e.target.value as any;
                        setNewPanelItems(copy);
                      }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High ↑</option>
                      <option value="low">Low ↓</option>
                      <option value="critical">Critical ⚠️</option>
                    </select>
                  </div>
                  <div className="col-span-12 sm:hidden flex justify-end">
                    <button
                      type="button"
                      onClick={() => setNewPanelItems(newPanelItems.filter((_, i) => i !== idx))}
                      className="text-rose-500 text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setNewPanelItems([
                  ...newPanelItems,
                  { name: '', result: '', unit: '', refRange: '', status: 'normal' },
                ])
              }
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline pt-1"
            >
              <Plus size={13} />
              <span>Add another test to panel</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddingPanel(false)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
            >
              Save Lab Panel
            </button>
          </div>
        </form>
      )}

      {/* Panels Display */}
      {labPanels.length > 0 ? (
        <div className="space-y-4">
          {labPanels.map((panel) => (
            <div
              key={panel.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <TestTube2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {panel.panelName}
                    </h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      {panel.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDeletePanel(panel.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete panel"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-2 font-medium">Test Name</th>
                      <th className="pb-2 font-medium">Result Value</th>
                      <th className="pb-2 font-medium">Reference Range</th>
                      <th className="pb-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {panel.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-2 font-medium text-slate-800 dark:text-slate-200">
                          {item.name}
                        </td>
                        <td className="py-2 font-bold text-slate-900 dark:text-white">
                          <span
                            className={
                              item.status === 'critical'
                                ? 'text-rose-600 dark:text-rose-400 font-extrabold text-sm'
                                : item.status === 'high'
                                ? 'text-amber-600 dark:text-amber-400'
                                : item.status === 'low'
                                ? 'text-blue-600 dark:text-blue-400'
                                : ''
                            }
                          >
                            {item.result} {item.unit}
                          </span>
                        </td>
                        <td className="py-2 text-slate-400 text-[11px]">
                          {item.refRange ? `${item.refRange} ${item.unit}` : '—'}
                        </td>
                        <td className="py-2 text-right">
                          <select
                            value={item.status}
                            onChange={(e) =>
                              handleUpdateItemInPanel(panel.id, idx, 'status', e.target.value)
                            }
                            className="bg-transparent border-0 text-[10px] font-bold focus:ring-0 cursor-pointer"
                          >
                            <option value="normal" className="dark:bg-slate-900">Normal</option>
                            <option value="high" className="dark:bg-slate-900">High ↑</option>
                            <option value="low" className="dark:bg-slate-900">Low ↓</option>
                            <option value="critical" className="dark:bg-slate-900">Critical ⚠️</option>
                          </select>
                          <span className="ml-1">{getStatusBadge(item.status)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <TestTube2 size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Structured Lab Panels Recorded Yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Click &quot;Add Lab Panel&quot; above to quickly record Cardiac Markers, CBC, Electrolytes, Renal, Coagulation, or custom test sets.
          </p>
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus size={14} />
            <span>Add First Panel</span>
          </button>
        </div>
      )}
    </div>
  );
};
