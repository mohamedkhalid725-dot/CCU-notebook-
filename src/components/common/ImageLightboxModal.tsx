import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, RotateCw } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imageUrl,
  title,
  subtitle,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cardiovault.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 text-white shrink-0">
        <div className="min-w-0 pr-4">
          <h3 className="text-sm font-semibold truncate">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
            title="Rotate"
          >
            <RotateCw size={16} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
            title="Download"
          >
            <Download size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 transition ml-2"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Image Viewer Stage */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {imageUrl.startsWith('data:application/pdf') ? (
          <iframe src={imageUrl} className="w-full h-full rounded-lg bg-white" title={title} />
        ) : (
          <img
            src={imageUrl}
            alt={title}
            referrerPolicy="no-referrer"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-grab active:cursor-grabbing select-none"
          />
        )}
      </div>

      {/* Bottom Hint */}
      <div className="py-2 text-center text-[11px] text-slate-500 bg-slate-950/80 shrink-0">
        Zoom: {Math.round(zoom * 100)}% • Rotation: {rotation}° • Click & drag or pinch to inspect clinical details
      </div>
    </div>
  );
};
