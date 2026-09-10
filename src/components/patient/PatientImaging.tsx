import React, { useState, useRef } from 'react';
import { PatientRecord, ImagingStudy } from '../../types';
import { compressAndReadFileAsDataUrl } from '../../services/imageUpload';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import {
  Film,
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
  FileText,
  Layers
} from 'lucide-react';

interface PatientImagingProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

const IMAGING_TYPES = [
  'Chest X-ray',
  'CT Chest',
  'CT Brain',
  'CT Abdomen / Pelvis',
  'CT Angiography',
  'Ultrasound / POCUS',
  'Echocardiogram',
  'MRI',
  'Other',
] as const;

export const PatientImaging: React.FC<PatientImagingProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const imagingStudies = patient.imagingStudies || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    timestamp: string;
    type: ImagingStudy['type'];
    indication: string;
    findings: string;
    impression: string;
    notes: string;
    fileUrl?: string;
    fileName?: string;
  }>({
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    type: 'Chest X-ray',
    indication: '',
    findings: '',
    impression: '',
    notes: '',
    fileUrl: undefined,
    fileName: undefined,
  });

  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl, name } = await compressAndReadFileAsDataUrl(file);
      setFormState((prev) => ({
        ...prev,
        fileUrl: dataUrl,
        fileName: name,
      }));
    } catch (err) {
      console.error('Failed to read imaging file:', err);
      alert('Error loading image. Please try again.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.impression.trim()) {
      alert('Please enter an impression / conclusion for this imaging study.');
      return;
    }

    const study: ImagingStudy = {
      id: editingId || `img-${Date.now()}`,
      timestamp: formState.timestamp,
      type: formState.type,
      indication: formState.indication,
      findings: formState.findings,
      impression: formState.impression,
      notes: formState.notes,
      fileUrl: formState.fileUrl,
      fileName: formState.fileName,
    };

    let updatedList: ImagingStudy[];
    if (editingId) {
      updatedList = imagingStudies.map((s) => (s.id === editingId ? study : s));
    } else {
      updatedList = [study, ...imagingStudies];
    }

    onUpdatePatient({
      ...patient,
      imagingStudies: updatedList,
      imagingSummary: formState.impression,
      lastUpdated: new Date().toISOString(),
    });

    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this imaging study?')) {
      const updated = imagingStudies.filter((s) => s.id !== id);
      onUpdatePatient({
        ...patient,
        imagingStudies: updated,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleStartEdit = (study: ImagingStudy) => {
    setEditingId(study.id);
    setFormState({
      timestamp: study.timestamp,
      type: study.type,
      indication: study.indication || '',
      findings: study.findings || '',
      impression: study.impression,
      notes: study.notes || '',
      fileUrl: study.fileUrl,
      fileName: study.fileName,
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Film className="text-emerald-500" size={18} />
            <span>Radiology, CT & Diagnostic Imaging</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Serial chest radiographs, CT angiography, head scans, bedside POCUS and radiological reports
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormState({
              timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
              type: 'Chest X-ray',
              indication: 'Evaluate cardiomegaly & pulmonary edema',
              findings: '',
              impression: '',
              notes: '',
              fileUrl: undefined,
              fileName: undefined,
            });
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus size={14} />
          <span>Add Imaging Study</span>
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
              <span>{editingId ? 'Edit Imaging Study' : 'Record New Imaging Study'}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Study Modality / Type
              </label>
              <select
                value={formState.type}
                onChange={(e) => setFormState({ ...formState, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {IMAGING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Study Date & Time
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
                Clinical Indication
              </label>
              <input
                type="text"
                value={formState.indication}
                onChange={(e) => setFormState({ ...formState, indication: e.target.value })}
                placeholder="e.g. Acute dyspnea, rule out pneumothorax"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Radiological Findings
              </label>
              <textarea
                rows={3}
                value={formState.findings}
                onChange={(e) => setFormState({ ...formState, findings: e.target.value })}
                placeholder="Cardiothoracic ratio, pulmonary vasculature, pleural spaces, consolidations, lines and tubes position..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Overall Impression / Conclusion *
              </label>
              <input
                type="text"
                value={formState.impression}
                onChange={(e) => setFormState({ ...formState, impression: e.target.value })}
                placeholder="e.g. Mild cephalization without frank pulmonary edema. ETT tip 4cm above carina."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            {/* Photo / DICOM Attachment */}
            <div className="sm:col-span-2 md:col-span-3 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Radiograph / Scan Image Attachment
              </span>

              {formState.fileUrl ? (
                <div className="flex flex-wrap items-center gap-3">
                  <img
                    src={formState.fileUrl}
                    alt="Scan Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer shadow-sm bg-black"
                    onClick={() =>
                      setLightboxImage({
                        url: formState.fileUrl!,
                        title: `${formState.type} Image`,
                        subtitle: `${formState.timestamp} • ${formState.impression}`,
                      })
                    }
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxImage({
                          url: formState.fileUrl!,
                          title: `${formState.type} Image`,
                          subtitle: `${formState.timestamp} • ${formState.impression}`,
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
                      onClick={() => setFormState({ ...formState, fileUrl: undefined, fileName: undefined })}
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
                    <span>Upload Radiograph / CT Scan Image</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
            >
              {editingId ? 'Update Study' : 'Save Imaging Study'}
            </button>
          </div>
        </form>
      )}

      {/* Studies List */}
      {imagingStudies.length > 0 ? (
        <div className="space-y-4">
          {imagingStudies.map((study) => (
            <div
              key={study.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Film size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {study.type}: {study.impression}
                    </h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      {study.timestamp} {study.indication ? `• Indication: ${study.indication}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(study)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(study.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {study.findings && (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  <strong className="text-slate-800 dark:text-slate-200">Findings: </strong>
                  {study.findings}
                </p>
              )}

              {study.fileUrl && (
                <div className="pt-1">
                  <button
                    onClick={() =>
                      setLightboxImage({
                        url: study.fileUrl!,
                        title: `${study.type} Image`,
                        subtitle: `${study.timestamp} • ${study.impression}`,
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
                  >
                    <ImageIcon size={14} className="text-emerald-500" />
                    <span>View Radiograph / Image</span>
                    <Maximize2 size={12} className="text-slate-400 ml-0.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Film size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Imaging Studies Recorded
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Record Chest X-rays, CT Angiograms, Ultrasound / POCUS findings and attach radiographs for offline inspection.
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
