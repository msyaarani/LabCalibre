import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Instrument } from '../types';
import { labAudio } from '../utils/audio';
import { 
  Sliders, 
  Wind, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Volume2,
  VolumeX,
  Play,
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';

interface VirtualLabBenchProps {
  onNavigateTab: (tab: string) => void;
  onOpenInstrumentProfile: (instrument: Instrument) => void;
}

export const VirtualLabBench: React.FC<VirtualLabBenchProps> = ({
  onNavigateTab,
  onOpenInstrumentProfile,
}) => {
  const { instruments, addRecord, currentUser } = useApp();

  // Active instrument selection
  const balances = instruments.filter(
    (i) => i.isActive && (i.category.includes('Balance') || i.category.includes('Weight'))
  );
  const [selectedInstId, setSelectedInstId] = useState<string>(
    balances[0]?.id || 'LGM-B1'
  );

  const instrument = balances.find((b) => b.id === selectedInstId) || balances[0] || instruments[0];

  // Simulator states
  const [chamberOpen, setChamberOpen] = useState(false);
  const [placedMass, setPlacedMass] = useState<number>(instrument?.targetReading || 100);
  const [driftOffset, setDriftOffset] = useState<number>(0.0001);
  const [isTared, setIsTared] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [isStable, setIsStable] = useState<boolean>(true);
  const [soundMuted, setSoundMuted] = useState<boolean>(labAudio.getMuted());
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Environmental simulation factors
  const [ambientTemp] = useState<number>(22.4); // ISO 17025 standard laboratory 22°C
  const [ambientHumidity] = useState<number>(53.8); // 50-60% RH

  // Reset or re-align when instrument changes
  useEffect(() => {
    if (instrument) {
      setPlacedMass(instrument.targetReading);
      setDriftOffset(0.0001);
      setIsTared(false);
    }
  }, [selectedInstId]);

  // Dynamic reading oscillation loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (isCalibrating) return;

      const base = isTared ? 0 : placedMass;
      let noise = 0;

      if (chamberOpen) {
        // Air turbulence causes ±0.0003g jitter
        noise = (Math.random() - 0.5) * 0.0007;
        setIsStable(false);
      } else {
        // Closed chamber: micro-settling within ±0.00002g
        noise = (Math.random() - 0.5) * 0.00004;
        setIsStable(true);
      }

      const calculated = base > 0 ? base + driftOffset + noise : 0;
      setDisplayValue(calculated);
    }, 120);

    return () => clearInterval(interval);
  }, [placedMass, driftOffset, chamberOpen, isTared, isCalibrating]);

  // Audio chime when stabilized
  const prevStable = useRef(isStable);
  useEffect(() => {
    if (!prevStable.current && isStable && displayValue > 0) {
      labAudio.playStable();
    }
    prevStable.current = isStable;
  }, [isStable, displayValue]);

  // Metrology Deviation
  const target = instrument?.targetReading || 100;
  const tolerance = instrument?.toleranceLimit || 0.0002;
  const measured = displayValue;
  const deviation = Math.abs(measured - target);
  const isWithinTolerance = deviation <= tolerance;
  const unit = instrument?.unit || 'g';

  // Precision decimal digits
  const getDecimals = (u: string) => {
    if (instrument?.category === 'Micro Balances') return 5;
    if (instrument?.category === 'Semi-Micro Balances') return 5;
    if (instrument?.category === 'Precision Balances') return 3;
    return 4;
  };
  const decimals = getDecimals(unit);

  // Handlers
  const handleTare = () => {
    labAudio.playTare();
    setIsTared(!isTared);
    setFeedbackNotice(isTared ? 'Balance un-tared' : 'Balance zeroed (>0< TARE)');
    setTimeout(() => setFeedbackNotice(null), 2000);
  };

  const handleToggleChamber = () => {
    labAudio.playClick();
    setChamberOpen(!chamberOpen);
  };

  const handleToggleSound = () => {
    const muted = labAudio.toggleMute();
    setSoundMuted(muted);
  };

  const handleRunCalibrationCycle = () => {
    labAudio.playClick();
    setIsCalibrating(true);
    setFeedbackNotice('⚙️ Motorized Internal IsoCal Calibration in progress...');
    setTimeout(() => {
      setDriftOffset(0.0000);
      setIsCalibrating(false);
      labAudio.playSuccess();
      setFeedbackNotice('✓ Calibration cycle complete. Linearity calibrated to zero offset.');
      setTimeout(() => setFeedbackNotice(null), 3000);
    }, 1800);
  };

  const handlePlaceWeight = (mass: number) => {
    labAudio.playClick();
    setIsTared(false);
    setPlacedMass(mass);
  };

  const handleSimulatePass = () => {
    labAudio.playClick();
    setChamberOpen(false);
    setIsTared(false);
    setPlacedMass(instrument.targetReading);
    setDriftOffset(0.00008); // safely within tolerance
    setFeedbackNotice('🟢 Loaded reference standard mass. Readings stabilized within ISO 17025 tolerance.');
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleSimulateFail = () => {
    labAudio.playClick();
    setChamberOpen(false);
    setIsTared(false);
    setPlacedMass(instrument.targetReading);
    setDriftOffset(tolerance * 2.8); // exceeds tolerance
    labAudio.playAlarm();
    setFeedbackNotice('🚨 Alert: Simulated weight exceeds allowable limits! Auto-quarantine will be invoked if logged.');
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleSubmitVerifiedReading = () => {
    labAudio.playClick();
    if (!instrument) return;

    const recordReading = {
      standardReading: target,
      measuredReading: parseFloat(measured.toFixed(decimals)),
      deviation: parseFloat(deviation.toFixed(decimals)),
      toleranceLimit: tolerance,
      unit,
      notes: `Captured via Interactive Metrology Test Bench by ${currentUser.name}. Ambient: ${ambientTemp}°C, ${ambientHumidity}% RH. Chamber closed: ${!chamberOpen}.`,
    };

    const result = addRecord({
      instrumentId: instrument.id,
      instrumentName: instrument.name,
      serialNo: instrument.serialNo,
      type: 'Internal',
      date: new Date().toISOString().split('T')[0],
      readings: recordReading,
      resultStatus: isWithinTolerance ? 'Pass' : 'Fail',
      approvalStatus: 'Pending',
      createdBy: currentUser.name,
      createdRole: currentUser.role,
    });

    if (result.success) {
      if (isWithinTolerance) {
        labAudio.playSuccess();
        setFeedbackNotice(`✓ Test Record Registered! Forwarded to Supervisor approval queue.`);
      } else {
        labAudio.playAlarm();
        setFeedbackNotice(`🚨 Test Breached Limits! Instrument placed in Auto-Quarantine.`);
      }
      setTimeout(() => setFeedbackNotice(null), 3500);
    } else {
      setFeedbackNotice(`Notice: ${result.message}`);
      setTimeout(() => setFeedbackNotice(null), 3500);
    }
  };

  // Bell Curve SVG Math
  const zScore = tolerance > 0 ? (deviation / tolerance) : 0;
  const needlePercent = Math.min(Math.max(50 + ((measured - target) / (tolerance * 2)) * 50, 5), 95);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <section aria-label="Interactive Virtual Test Bench" className="bg-white rounded-lg border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="text-teal-700 font-bold">VIRTUAL METROLOGY BENCH</span>
              <span>·</span>
              <span>SIMULATED HARDWARE INTERFACE</span>
              <span>·</span>
              <span>ISO/IEC 17025 STANDARD</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Interactive Calibration & Verification Test Bench
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Experiment in real-time with reference masses, draft chamber turbulence, tare controls, and tolerance calculations.
            </p>
          </div>

          {/* Quick Bench Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                soundMuted 
                  ? 'bg-slate-100 text-slate-600 border-slate-300' 
                  : 'bg-teal-50 text-teal-800 border-teal-300'
              }`}
              title="Toggle Acoustic Feedback"
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-teal-700" />}
              <span>{soundMuted ? 'Muted' : 'Acoustics Active'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('instruments')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
            >
              <span>View All 12 Balances</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Instrument Selector Pill Row */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 overflow-x-auto pb-1">
          <span className="text-xs font-mono uppercase text-slate-400 shrink-0">Station Balance:</span>
          {balances.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                labAudio.playClick();
                setSelectedInstId(b.id);
              }}
              className={`px-3 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedInstId === b.id
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span className={selectedInstId === b.id ? 'text-teal-400' : 'text-slate-400'}>
                {b.referenceNo || b.id}
              </span>
              <span>{b.name.split('(')[0].trim()}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Workbench Split: Digital Balance Hardware Console + Metrology Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Simulated Digital Analytical Balance Workstation (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200/90 shadow-2xs p-5 space-y-5">
          {/* Hardware Header Strip */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  {instrument.referenceNo || instrument.id}
                </span>
                <h2 className="text-sm font-bold text-slate-900">{instrument.name}</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                Location: {instrument.location} · Assigned Operator: {instrument.assignedOperator || 'Staff'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Ambient Environment</span>
              <span className="font-mono text-xs font-semibold text-slate-700">
                {ambientTemp}°C · {ambientHumidity}% RH
              </span>
            </div>
          </div>

          {/* VFD Fluorescent Green / Cyan Digital Balance Display */}
          <div className="relative bg-slate-950 rounded-lg p-6 border-2 border-slate-800 shadow-inner flex flex-col justify-between min-h-[170px] overflow-hidden">
            {/* Display Top Status Indicators */}
            <div className="flex items-center justify-between text-cyan-400 font-mono text-xs tracking-wider border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1 transition-opacity ${isStable ? 'opacity-100 font-bold text-emerald-400' : 'opacity-40 text-slate-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${isStable ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                  STABLE
                </span>
                <span className={`transition-opacity ${isTared ? 'opacity-100 text-teal-300 font-bold' : 'opacity-40 text-slate-600'}`}>
                  &gt;0&lt; ZERO
                </span>
                <span className="text-slate-500 text-[10px]">
                  {chamberOpen ? '⚠️ DRAFT CHAMBER OPEN' : '🔒 CHAMBER ISOLATED'}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                RANGE: 0 - 220 {unit}
              </div>
            </div>

            {/* Huge Glowing 7-Segment Value Readout */}
            <div className="py-4 text-center">
              {isCalibrating ? (
                <div className="font-mono text-cyan-300 text-3xl font-bold animate-pulse tracking-widest">
                  -- C A L --
                </div>
              ) : (
                <div className="flex items-baseline justify-center gap-2">
                  <span className="font-mono text-4xl sm:text-5xl font-black text-cyan-300 tracking-tight drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                    {displayValue.toFixed(decimals)}
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-cyan-400/80">
                    {unit}
                  </span>
                </div>
              )}
            </div>

            {/* Display Bottom Information */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
              <span>TARGET (X₀): <strong className="text-slate-200">{target.toFixed(decimals)} {unit}</strong></span>
              <span>TOLERANCE (±δ): <strong className="text-slate-200">±{tolerance} {unit}</strong></span>
              <span className={`font-bold ${isWithinTolerance ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isWithinTolerance ? 'STATUS: PASS' : 'STATUS: BREACH'}
              </span>
            </div>
          </div>

          {/* Feedback Toast Notification Banner */}
          {feedbackNotice && (
            <div className="p-3 bg-teal-50 border border-teal-300 rounded text-xs font-mono text-teal-950 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{feedbackNotice}</span>
              </div>
            </div>
          )}

          {/* Physical Balance Control Keypad */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleTare}
              className={`p-3 rounded border font-mono font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                isTared 
                  ? 'bg-teal-700 text-white border-teal-800 shadow-inner' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>&gt;0&lt; TARE</span>
            </button>

            <button
              type="button"
              onClick={handleToggleChamber}
              className={`p-3 rounded border font-mono font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                chamberOpen
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <Wind className={`w-4 h-4 ${chamberOpen ? 'animate-pulse text-amber-600' : ''}`} />
              <span>{chamberOpen ? 'CLOSE DRAFT' : 'OPEN DRAFT'}</span>
            </button>

            <button
              type="button"
              onClick={handleRunCalibrationCycle}
              disabled={isCalibrating}
              className="p-3 rounded border bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 font-mono font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
            >
              <Sliders className="w-4 h-4 text-teal-700" />
              <span>CALIBRATE</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitVerifiedReading}
              className={`p-3 rounded border font-mono font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-xs active:scale-95 ${
                isWithinTolerance 
                  ? 'bg-teal-800 hover:bg-teal-900 text-white border-teal-900' 
                  : 'bg-rose-700 hover:bg-rose-800 text-white border-rose-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>LOG VERIFICATION</span>
            </button>
          </div>

          {/* Interactive Standard Calibration Masses Tray (Click to load onto pan) */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-700">
                OIML Reference Calibration Masses (Click to Place on Pan):
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Traceable to NMIM</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { label: '100.0 g', value: 100 },
                { label: '50.0 g', value: 50 },
                { label: '20.0 g', value: 20 },
                { label: '10.0 g', value: 10 },
                { label: '1.0 g', value: 1 },
                { label: '0.0 g (Empty)', value: 0 },
              ].map((w) => (
                <button
                  key={w.label}
                  type="button"
                  onClick={() => handlePlaceWeight(w.value)}
                  className={`py-2 px-2.5 rounded text-xs font-mono font-bold transition-all border text-center ${
                    placedMass === w.value
                      ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>

            {/* Micro-Drift Precision Adjustment Slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mb-1">
                <span>Micro-Drift Simulator (Temperature / Pan Offset):</span>
                <span className="font-bold text-teal-800">{driftOffset >= 0 ? `+${driftOffset.toFixed(decimals)}` : driftOffset.toFixed(decimals)} {unit}</span>
              </div>
              <input
                type="range"
                min="-0.002"
                max="0.002"
                step="0.00005"
                value={driftOffset}
                onChange={(e) => setDriftOffset(parseFloat(e.target.value))}
                className="w-full accent-teal-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Interactive Simulation Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-mono text-slate-500 mr-1">One-Click Scenarios:</span>
            <button
              type="button"
              onClick={handleSimulatePass}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulate Pass (In-Tolerance)</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateFail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-semibold transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Simulate Failure & Auto-Quarantine</span>
            </button>
          </div>
        </div>

        {/* Right Column: Metrology Tolerance Analytics & Live Gaussian Bell Curve (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200/90 shadow-2xs p-5 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-700" />
              <span>Tolerance Bell Curve & Gaussian Distribution</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Live probability density analysis for ISO/IEC 17025 conformity evaluation.
            </p>
          </div>

          {/* SVG Gaussian Bell Curve Visualizer */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
              <span>Standard Dev (σ): <strong>0.00008 {unit}</strong></span>
              <span>Z-Score: <strong>{zScore.toFixed(2)}</strong></span>
            </div>

            {/* SVG Visual Chart */}
            <div className="relative h-40 w-full overflow-hidden">
              <svg viewBox="0 0 400 160" className="w-full h-full">
                {/* Background Grid Lines */}
                <line x1="50" y1="130" x2="350" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="200" y1="20" x2="200" y2="130" stroke="#94a3b8" strokeDasharray="3,3" strokeWidth="1" />

                {/* Tolerance Zone Fill (Green Band) */}
                <rect x="130" y="20" width="140" height="110" fill="#d1fae5" fillOpacity="0.4" />
                <line x1="130" y1="20" x2="130" y2="130" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,2" />
                <line x1="270" y1="20" x2="270" y2="130" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,2" />

                {/* Bell Curve Smooth Path */}
                <path
                  d="M 50 130 C 120 130, 150 30, 200 30 C 250 30, 280 130, 350 130"
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="2.5"
                />

                {/* Lower and Upper Bound Labels */}
                <text x="130" y="145" textAnchor="middle" fontSize="9" fill="#047857" fontWeight="bold">-δ Limit</text>
                <text x="200" y="145" textAnchor="middle" fontSize="9" fill="#0f172a" fontWeight="bold">X₀ ({target})</text>
                <text x="270" y="145" textAnchor="middle" fontSize="9" fill="#047857" fontWeight="bold">+δ Limit</text>

                {/* Live Position Pointer Needle */}
                <line
                  x1={50 + (needlePercent / 100) * 300}
                  y1="15"
                  x2={50 + (needlePercent / 100) * 300}
                  y2="130"
                  stroke={isWithinTolerance ? '#059669' : '#dc2626'}
                  strokeWidth="2.5"
                />
                <circle
                  cx={50 + (needlePercent / 100) * 300}
                  cy="15"
                  r="5"
                  fill={isWithinTolerance ? '#059669' : '#dc2626'}
                />
              </svg>
            </div>

            {/* Needle Legend */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-500">Live Measurement:</span>
              <span className={`font-bold ${isWithinTolerance ? 'text-emerald-700' : 'text-rose-700'}`}>
                {measured.toFixed(decimals)} {unit} ({isWithinTolerance ? 'Within Acceptance Zone' : 'Exceeds Permissible Limit'})
              </span>
            </div>
          </div>

          {/* Real-Time Metrology Scorecard */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden font-mono text-xs">
            <div className="p-3 bg-slate-50 flex items-center justify-between">
              <span className="text-slate-500">Benchmark Target (X₀):</span>
              <span className="font-bold text-slate-900">{target.toFixed(decimals)} {unit}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Measured Reading (X_meas):</span>
              <span className="font-bold text-slate-900">{measured.toFixed(decimals)} {unit}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Deviation (Δ = |X - X₀|):</span>
              <span className={`font-bold ${isWithinTolerance ? 'text-emerald-700' : 'text-rose-700'}`}>
                {deviation.toFixed(decimals)} {unit}
              </span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Tolerance Limit (±δ):</span>
              <span className="font-bold text-slate-800">±{tolerance.toFixed(decimals)} {unit}</span>
            </div>
            <div className="p-3 bg-slate-50 flex items-center justify-between">
              <span className="text-slate-600 font-bold">Conformity Evaluation:</span>
              <span
                className={`px-2 py-0.5 rounded font-bold text-xs ${
                  isWithinTolerance
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                }`}
              >
                {isWithinTolerance ? 'CONFORMING (PASS)' : 'NON-CONFORMING (FAIL)'}
              </span>
            </div>
          </div>

          {/* Direct CTA */}
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded text-xs text-teal-950 space-y-2">
            <span className="font-bold block text-teal-900">
              ISO/IEC 17025 Traceability Notice:
            </span>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              When satisfied with the stabilized reading, click <strong>"LOG VERIFICATION"</strong> to formally commit this test to the laboratory ledger. Non-conforming tests automatically trigger quarantine protocol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
