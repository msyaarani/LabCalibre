import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, Camera, Search, X, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInstrument: (instrumentId: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectInstrument,
}) => {
  const { instruments } = useApp();
  const [activeTab, setActiveTab] = useState<'camera' | 'search'>('camera');
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessId, setScanSuccessId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Filter instruments for manual search
  const filteredInstruments = instruments.filter(
    (inst) =>
      inst.isActive &&
      (inst.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.serialNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.qrCodeRef.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Camera could not be accessed (no device detected or permission denied). You can use Manual Search or the Instant Test buttons below.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handlePickInstrument = (id: string) => {
    setScanSuccessId(id);
    stopCamera();
    setTimeout(() => {
      onSelectInstrument(id);
      onClose();
      setScanSuccessId(null);
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs no-print">
      <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-teal-800 text-white flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                Instrument QR Code Scanner (FR-002)
              </h2>
              <p className="text-[11px] text-slate-500">Scan physical tag or enter instrument ID (&lt; 3s)</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1 m-3 rounded font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-1.5 font-semibold rounded flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-white text-teal-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Scanner</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-1.5 font-semibold rounded flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'search'
                ? 'bg-white text-teal-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Manual Search</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 text-xs">
          {scanSuccessId && (
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2 animate-bounce font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>QR Code detected! Opening instrument <strong>{scanSuccessId}</strong>...</span>
            </div>
          )}

          {activeTab === 'camera' ? (
            <div className="space-y-3">
              {/* Video Scanner Box */}
              <div className="relative aspect-video sm:aspect-square max-h-60 bg-slate-950 rounded overflow-hidden flex items-center justify-center border-2 border-teal-600/40">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {/* Visual Target Reticle */}
                <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-teal-400 rounded pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-teal-400 shadow-[0_0_8px_#2dd4bf] animate-pulse"></div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 p-4 flex flex-col items-center justify-center text-center text-xs text-slate-300">
                    <AlertCircle className="w-7 h-7 text-amber-400 mb-2" />
                    <p className="max-w-xs">{cameraError}</p>
                  </div>
                )}
              </div>

              <div className="text-center text-[11px] text-slate-500 font-mono">
                Aim device camera at the instrument QR tag label.
              </div>

              {/* Instant Simulator Picker */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                    Instant Test Tag Selector (Rapid Validation &lt; 3s):
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono">
                  {instruments.slice(0, 4).map((inst) => (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => handlePickInstrument(inst.id)}
                      className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded transition-colors group"
                    >
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-teal-900 truncate">
                        {inst.id} - {inst.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Ref: {inst.qrCodeRef}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 font-mono">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter instrument ID, name, or serial number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700"
                  autoFocus
                />
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded max-h-60 overflow-y-auto">
                {filteredInstruments.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 font-sans">
                    No instruments matching "{searchQuery}".
                  </div>
                ) : (
                  filteredInstruments.map((inst) => (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => handlePickInstrument(inst.id)}
                      className="w-full text-left p-2.5 hover:bg-teal-50 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-teal-900 font-sans">
                          {inst.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          ID: <span className="font-semibold text-slate-700">{inst.id}</span> · SN: {inst.serialNo}
                        </div>
                      </div>
                      <span className="text-xs text-teal-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                        Open &rarr;
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-3.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
