import React, { useState, useRef } from 'react';
import { PatientRecord, ECGRecord } from '../../types';
import { compressAndReadFileAsDataUrl } from '../../services/imageUpload';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import {
  Activity,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Image as ImageIcon,
  Upload,
  Eye,
  Check,
  X,
  Maximize2,
  FileText
} from 'lucide-react';

interface PatientECGProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

export const PatientECG: React.FC<PatientECGProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const ecgRecords = patient.ecgRecords || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Form State
  const [formState, setFormState] = useState<{
    timestamp: string;
    rhythm: string;
    rate: string;
    axis: string;
    prInterval: string;
    qrsDuration: string;
    qtc: string;
    stTChanges: string;
    interpretation: string;
    notes: string;
    imageUrl?: string;
  }>({
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    rhythm: 'Normal Sinus Rhythm',
    rate: '75',
    axis: 'Normal Axis',
    prInterval: '160',
    qrsDuration: '88',
    qtc: '420',
    stTChanges: '',
    interpretation: '',
    notes: '',
    imageUrl: undefined,
  });

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl } = await compressAndReadFileAsDataUrl(file);
      setFormState((prev) => ({ ...prev, imageUrl: dataUrl }));
    } catch (err) {
      console.error('Failed to load image:', err);
      alert('Error loading image file. Please try a different image.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.interpretation.trim()) {
      alert('Please provide an overall ECG interpretation.');
      return;
    }

    const record: ECGRecord = {
      id: editingRecordId || `ecg-${Date.now()}`,
      timestamp: formState.timestamp,
      rhythm: formState.rhythm,
      rate: formState.rate,
      axis: formState.axis,
      prInterval: formState.prInterval,
      qrsDuration: formState.qrsDuration,
      qtc: formState.qtc,
      stTChanges: formState.stTChanges,
      interpretation: formState.interpretation,
      notes: formState.notes,
      imageUrl: formState.imageUrl,
    };

    let updatedRecords: ECGRecord[];
    if (editingRecordId) {
      updatedRecords = ecgRecords.map((r) => (r.id === editingRecordId ? record : r));
    } else {
      updatedRecords = [record, ...ecgRecords];
    }

    onUpdatePatient({
      ...patient,
      ecgRecords: updatedRecords,
      lastUpdated: new Date().toISOString(),
    });

    setIsAdding(false);
    setEditingRecordId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this ECG tracing record?')) {
      const updated = ecgRecords.filter((r) => r.id !== id);
      onUpdatePatient({
        ...patient,
        ecgRecords: updated,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleStartEdit = (rec: ECGRecord) => {
    setEditingRecordId(rec.id);
    setFormState({
      timestamp: rec.timestamp,
      rhythm: rec.rhythm,
      rate: String(rec.rate || '75'),
      axis: rec.axis || 'Normal Axis',
      prInterval: rec.prInterval || '160',
      qrsDuration: rec.qrsDuration || '90',
      qtc: rec.qtc || '420',
      stTChanges: rec.stTChanges || '',
      interpretation: rec.interpretation,
      notes: rec.notes || '',
      imageUrl: rec.imageUrl,
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-emerald-500" size={18} />
            <span>Serial Electrocardiography (ECG / EKG)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            12-lead interpretations, rhythm disturbances, interval measurements, ST-T evolution & strip photo attachments
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRecordId(null);
            setFormState({
              timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
              rhythm: 'Sinus Rhythm',
              rate: '72',
              axis: 'Normal Axis',
              prInterval: '160',
              qrsDuration: '88',
              qtc: '420',
              stTChanges: '',
              interpretation: '',
              notes: '',
              imageUrl: undefined,
            });
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus size={14} />
          <span>Record New ECG</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-lg space-y-4 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus size={16} className="text-emerald-500" />
              <span>{editingRecordId ? 'Edit ECG Record' : 'Record New 12-Lead ECG'}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingRecordId(null);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Date & Time of Tracing
              </label>
              <input
                type="text"
                value={formState.timestamp}
                onChange={(e) => setFormState({ ...formState, timestamp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Cardiac Rhythm
              </label>
              <input
                type="text"
                value={formState.rhythm}
                onChange={(e) => setFormState({ ...formState, rhythm: e.target.value })}
                placeholder="e.g. Sinus Rhythm, Atrial Fibrillation, VT"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Ventricular Rate (bpm)
              </label>
              <input
                type="text"
                value={formState.rate}
                onChange={(e) => setFormState({ ...formState, rate: e.target.value })}
                placeholder="bpm"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                QRS Axis
              </label>
              <select
                value={formState.axis}
                onChange={(e) => setFormState({ ...formState, axis: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Normal Axis">Normal Axis (-30° to +90°)</option>
                <option value="Left Axis Deviation (LAD)">Left Axis Deviation (LAD)</option>
                <option value="Right Axis Deviation (RAD)">Right Axis Deviation (RAD)</option>
                <option value="Extreme Axis Deviation">Extreme Axis Deviation</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                PR Interval (ms)
              </label>
              <input
                type="text"
                value={formState.prInterval}
                onChange={(e) => setFormState({ ...formState, prInterval: e.target.value })}
                placeholder="120-200 ms"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                QRS Duration (ms)
              </label>
              <input
                type="text"
                value={formState.qrsDuration}
                onChange={(e) => setFormState({ ...formState, qrsDuration: e.target.value })}
                placeholder="< 120 ms"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                QTc (ms)
              </label>
              <input
                type="text"
                value={formState.qtc}
                onChange={(e) => setFormState({ ...formState, qtc: e.target.value })}
                placeholder="< 450 ms (M), < 460 ms (F)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                ST-T Changes / Leads
              </label>
              <input
                type="text"
                value={formState.stTChanges}
                onChange={(e) => setFormState({ ...formState, stTChanges: e.target.value })}
                placeholder="e.g. ST elevation V1-V4, T wave inversion II, III, aVF"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Overall ECG Interpretation *
              </label>
              <input
                type="text"
                value={formState.interpretation}
                onChange={(e) => setFormState({ ...formState, interpretation: e.target.value })}
                placeholder="e.g. Acute extensive anterior STEMI with reciprocal inferior ST depression"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Clinical Notes / Comparison
              </label>
              <textarea
                rows={2}
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                placeholder="Comparison with previous ECG, reperfusion signs, evolution..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Photo / Image Attachment */}
            <div className="sm:col-span-2 md:col-span-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                ECG Tracing Attachment (Photo / Document)
              </span>

              {formState.imageUrl ? (
                <div className="flex flex-wrap items-center gap-3">
                  <img
                    src={formState.imageUrl}
                    alt="ECG Preview"
                    className="w-24 h-16 object-cover rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer shadow-sm"
                    onClick={() =>
                      setLightboxImage({
                        url: formState.imageUrl!,
                        title: 'ECG Tracing Preview',
                        subtitle: formState.timestamp,
                      })
                    }
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxImage({
                          url: formState.imageUrl!,
                          title: 'ECG Tracing Preview',
                          subtitle: formState.timestamp,
                        })
                      }
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, imageUrl: undefined })}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <Upload size={14} />
                    <span>Upload / Snap 12-Lead ECG Strip</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingRecordId(null);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
            >
              {editingRecordId ? 'Update ECG Record' : 'Save ECG Record'}
            </button>
          </div>
        </form>
      )}

      {/* Serial ECG Records List */}
      {ecgRecords.length > 0 ? (
        <div className="space-y-3">
          {ecgRecords.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {rec.interpretation}
                    </h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      {rec.timestamp} • Rhythm: {rec.rhythm} ({rec.rate} bpm)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(rec)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Intervals & Findings Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Axis</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.axis || 'Normal'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">PR Interval</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.prInterval ? `${rec.prInterval} ms` : '—'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">QRS Duration</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.qrsDuration ? `${rec.qrsDuration} ms` : '—'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">QTc Interval</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.qtc ? `${rec.qtc} ms` : '—'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px] block">ST-T Changes</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 truncate block">
                    {rec.stTChanges || 'None'}
                  </span>
                </div>
              </div>

              {/* Notes & Attached Image Thumbnail */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {rec.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 flex-1 min-w-[200px]">
                    <FileText size={13} className="text-slate-400 shrink-0" />
                    <span>{rec.notes}</span>
                  </p>
                )}

                {rec.imageUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setLightboxImage({
                          url: rec.imageUrl!,
                          title: rec.interpretation,
                          subtitle: `${rec.timestamp} • ${rec.rhythm}`,
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
                    >
                      <ImageIcon size={14} className="text-emerald-500" />
                      <span>View ECG Image</span>
                      <Maximize2 size={12} className="text-slate-400 ml-0.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Activity size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No 12-Lead ECG Records Stored
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Record serial electrocardiograms, note ischemic ST segment changes, measure intervals, and attach camera photos of paper rhythm strips.
          </p>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <ImageLightboxModal
          isOpen={!!lightboxImage}
          imageUrl={lightboxImage.url}
          title={lightboxImage.title}
          subtitle={lightboxImage.subtitle}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
};
