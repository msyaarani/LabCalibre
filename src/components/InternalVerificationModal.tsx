import React, { useState, useEffect } from 'react';
import { Instrument } from '../types';
import { useApp } from '../context/AppContext';
import { labAudio } from '../utils/audio';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Send,
  Lock,
  Compass
} from 'lucide-react';

interface InternalVerificationModalProps {
  initialInstrument?: Instrument | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InternalVerificationModal: React.FC<InternalVerificationModalProps> = ({
  initialInstrument,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { instruments, addRecord, currentUser } = useApp();

  const activeInstruments = instruments.filter((i) => i.isActive);
  const [selectedInstId, setSelectedInstId] = useState<string>('');
  const [measuredValueStr, setMeasuredValueStr] = useState<string>('');
  const [testNotes, setTestNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: 'success' | 'quarantine';
    message: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    if (initialInstrument) {
      setSelectedInstId(initialInstrument.id);
    } else if (activeInstruments.length > 0 && !selectedInstId) {
      setSelectedInstId(activeInstruments[0].id);
    }
  }, [initialInstrument, activeInstruments, selectedInstId]);

  const currentInstrument = instruments.find((i) => i.id === selectedInstId);

  // Auto Pass/Fail Calculation logic
  const target = currentInstrument?.targetReading ?? 0;
  const tolerance = currentInstrument?.toleranceLimit ?? 0;
  const unit = currentInstrument?.unit ?? '';

  const measuredNum = parseFloat(measuredValueStr);
  const hasValidInput = !isNaN(measuredNum) && measuredValueStr.trim() !== '';

  const deviation = hasValidInput ? Math.abs(measuredNum - target) : 0;
  const isPass = hasValidInput ? deviation <= tolerance + 0.0000001 : null;
  const deviationFormatted = deviation.toFixed(4);

  // Bounds for tolerance bar visual
  const minToleranceBound = target - tolerance;
  const maxToleranceBound = target + tolerance;
  
  // Calculate relative position for the tolerance range gauge
  const rangeSpan = tolerance > 0 ? tolerance * 2.5 : 1;
  const lowerGauge = target - rangeSpan;
  const upperGauge = target + rangeSpan;
  
  let pointerPercentage = 50;
  if (hasValidInput && rangeSpan > 0) {
    const rawPct = ((measuredNum - lowerGauge) / (upperGauge - lowerGauge)) * 100;
    pointerPercentage = Math.max(3, Math.min(97, rawPct));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!currentInstrument) {
      setFormError('Please select a laboratory instrument first.');
      return;
    }

    if (!hasValidInput) {
      setFormError('Please enter a valid numeric measured reading (decimal format).');
      return;
    }

    const resultStatus = isPass ? 'Pass' : 'Fail';

    const result = addRecord({
      instrumentId: currentInstrument.id,
      instrumentName: currentInstrument.name,
      serialNo: currentInstrument.serialNo,
      type: 'Internal',
      date: new Date().toISOString().split('T')[0],
      readings: {
        standardReading: target,
        measuredReading: measuredNum,
        deviation: parseFloat(deviationFormatted),
        toleranceLimit: tolerance,
        unit,
        notes: testNotes || 'Daily routine operator verification.',
      },
      resultStatus,
      approvalStatus: resultStatus === 'Pass' ? 'Pending' : 'Rejected',
      createdBy: currentUser.name,
      createdRole: currentUser.role,
    });

    if (!result.success) {
      setFormError(result.message || 'Error occurred while saving test record.');
      return;
    }

    if (resultStatus === 'Fail') {
      labAudio.playAlarm();
      setSubmitFeedback({
        type: 'quarantine',
        message: 'AUTO-QUARANTINE ACTIVATED: Reading Exceeds Tolerance Limit',
        details: `Instrument ${currentInstrument.name} (${currentInstrument.id}) status automatically changed to "Out of Service". Emergency alert dispatched to Quality Supervisors for corrective service.`,
      });
    } else {
      labAudio.playSuccess();
      setSubmitFeedback({
        type: 'success',
        message: 'VERIFICATION PASSED: Reading Within Permissible Tolerance',
        details: `Deviation of ${deviationFormatted} ${unit} is within allowed tolerance limits (±${tolerance} ${unit}). Record forwarded to Supervisor approval queue.`,
      });
    }

    if (onSuccess) {
      onSuccess();
    }
  };

  const handleResetForm = () => {
    setMeasuredValueStr('');
    setTestNotes('');
    setSubmitFeedback(null);
    setFormError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs no-print">
      <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header - Clinical Metrology Bench Sheet */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-teal-800 text-teal-100 flex items-center justify-center font-bold text-xs">
              <Compass className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Internal Verification Test Sheet (Auto-Calc)
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                DAILY METROLOGY QUALITY CONTROL · ISO/IEC 17025
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleResetForm();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {submitFeedback ? (
            <div
              className={`p-4 rounded border ${
                submitFeedback.type === 'quarantine'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              } space-y-3`}
            >
              <div className="flex items-start gap-3">
                {submitFeedback.type === 'quarantine' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider">{submitFeedback.message}</h3>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">{submitFeedback.details}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-1.5 bg-white text-xs font-semibold rounded border border-slate-300 hover:bg-slate-50"
                >
                  Test Another Reading
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleResetForm();
                    onClose();
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Instrument Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  1. Select Laboratory Instrument:
                </label>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono bg-white"
                >
                  {activeInstruments.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      [{inst.id}] {inst.name} ({inst.serialNo}) {inst.status === 'out_of_service' ? '⚠️ QUARANTINED' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Technical Baseline Card */}
              {currentInstrument && (
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Category:</span>
                    <span className="font-semibold text-slate-800 truncate block">{currentInstrument.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Location:</span>
                    <span className="font-semibold text-slate-800 truncate block">{currentInstrument.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Benchmark Target (X₀):</span>
                    <span className="font-bold text-teal-800 block">{currentInstrument.targetReading} {currentInstrument.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Allowed Limit (±δ):</span>
                    <span className="font-bold text-slate-900 block">±{currentInstrument.toleranceLimit} {currentInstrument.unit}</span>
                  </div>
                </div>
              )}

              {/* Measured Value Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    2. Actual Measured Reading (X_meas) [{unit}]:
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Enter precision decimal format
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder={`e.g. ${target}`}
                    value={measuredValueStr}
                    onChange={(e) => setMeasuredValueStr(e.target.value)}
                    className="w-full px-3 py-2.5 text-base font-mono font-bold border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-900 bg-white"
                    autoFocus
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-mono font-semibold text-slate-400 pointer-events-none">
                    {unit}
                  </span>
                </div>
              </div>

              {/* Interactive Tolerance Range Bar & Scientific Indicator */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    METROLOGY TOLERANCE RANGE GAUGE:
                  </span>
                  {hasValidInput && (
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        isPass
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {isPass ? '✓ PASS (WITHIN LIMIT)' : '✗ FAIL (OUT OF LIMIT)'}
                    </span>
                  )}
                </div>

                {/* Graphical Gauge Track */}
                <div className="pt-2 pb-1">
                  <div className="relative h-4 bg-rose-100 border border-slate-300 rounded overflow-hidden">
                    {/* Centered Safe Green Zone */}
                    <div
                      className="absolute top-0 bottom-0 bg-emerald-200 border-x border-emerald-500"
                      style={{
                        left: '25%',
                        width: '50%',
                      }}
                      title="Permissible Tolerance Zone"
                    />

                    {/* Target Center Line Marker */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-800 z-10" />

                    {/* Measured Value Pointer Needle */}
                    {hasValidInput && (
                      <div
                        className="absolute top-0 bottom-0 w-1.5 bg-slate-900 ring-2 ring-white z-20 transition-all duration-150"
                        style={{
                          left: `${pointerPercentage}%`,
                          transform: 'translateX(-50%)',
                        }}
                      />
                    )}
                  </div>

                  {/* Gauge Tick Labels */}
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>Min: {minToleranceBound.toFixed(4)}</span>
                    <span className="font-bold text-slate-800">Target: {target.toFixed(4)}</span>
                    <span>Max: {maxToleranceBound.toFixed(4)}</span>
                  </div>
                </div>

                {/* Mathematical Evaluation Box */}
                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Deviation (Δ = |X-X₀|):</span>
                    <span className="font-bold text-slate-800">
                      {hasValidInput ? `${deviationFormatted} ${unit}` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Allowed Limit:</span>
                    <span className="text-slate-700">±{tolerance} {unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Automated Action:</span>
                    <span className={`font-semibold ${!hasValidInput ? 'text-slate-400' : isPass ? 'text-emerald-700' : 'text-rose-700 font-bold'}`}>
                      {!hasValidInput ? 'Awaiting input' : isPass ? 'Forward to Approval Queue' : 'Auto-Quarantine'}
                    </span>
                  </div>
                </div>

                {hasValidInput && !isPass && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-900 text-[11px] flex items-center gap-1.5 font-mono">
                    <Lock className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                    <span>
                      <strong>ISO 17025 Compliance:</strong> Measured deviation exceeds permissible tolerance limit. Strictly FAIL. Manual override is prohibited.
                    </span>
                  </div>
                )}
              </div>

              {/* Environmental & Test Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Ambient & Test Notes (Optional):
                </label>
                <textarea
                  rows={2}
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  placeholder="e.g., Room temp 22.4°C, 54% RH. OIML Class E2 certified test weights."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:text-slate-900 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!hasValidInput}
                  className={`flex items-center gap-1.5 px-4 py-2 font-bold rounded text-xs text-white transition-colors ${
                    !hasValidInput
                      ? 'bg-slate-300 cursor-not-allowed'
                      : isPass
                      ? 'bg-teal-750 hover:bg-teal-850'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isPass === false ? 'Confirm Failure (Enforce Quarantine)' : 'Submit Verification for Approval'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
