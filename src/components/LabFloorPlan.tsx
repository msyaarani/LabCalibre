import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Instrument } from '../types';
import { labAudio } from '../utils/audio';
import { 
  Building2, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  ArrowRight, 
  Sparkles, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Layers,
  Search
} from 'lucide-react';

interface LabFloorPlanProps {
  onOpenInstrumentProfile: (instrument: Instrument) => void;
  onStartVerification: (instrument: Instrument) => void;
  onNavigateTab: (tab: string) => void;
}

interface LabRoom {
  id: string;
  code: string;
  name: string;
  wing: string;
  temp: number;
  humidity: number;
  leadOperator: string;
  instrumentIds: string[];
}

export const LabFloorPlan: React.FC<LabFloorPlanProps> = ({
  onOpenInstrumentProfile,
  onStartVerification,
  onNavigateTab,
}) => {
  const { instruments } = useApp();

  const [selectedRoomId, setSelectedRoomId] = useState<string>('B159');
  const [filterQuery, setFilterQuery] = useState<string>('');

  // 8 Official Laboratory Rooms from LGM Master List
  const rooms: LabRoom[] = [
    {
      id: 'B159',
      code: 'UPKS LAB (B159)',
      name: 'Central Quality & Metrology Testing Lab',
      wing: 'Level 1 West Wing',
      temp: 22.2,
      humidity: 53.4,
      leadOperator: 'Abid',
      instrumentIds: ['LGM-B1', 'LGM-B2', 'INST-004'],
    },
    {
      id: 'B033',
      code: 'UPKS CHROMA LAB (B033)',
      name: 'Chromatography & Separation Sciences',
      wing: 'Basement Instrumental Wing',
      temp: 21.9,
      humidity: 51.8,
      leadOperator: 'Hisyam',
      instrumentIds: ['LGM-B3', 'INST-002'],
    },
    {
      id: 'B042',
      code: 'THERMAL LAB (B042)',
      name: 'Thermal Analysis & DSC Calorimetry',
      wing: 'Basement Analytical Wing',
      temp: 22.5,
      humidity: 54.1,
      leadOperator: 'Nuar',
      instrumentIds: ['LGM-B4'],
    },
    {
      id: 'B048',
      code: 'NITROSAMINE LAB (B048)',
      name: 'Trace Nitrosamine & Organic Impurities',
      wing: 'Clean Isolation Zone',
      temp: 22.0,
      humidity: 52.6,
      leadOperator: 'Nuar',
      instrumentIds: ['LGM-B5', 'LGM-B6'],
    },
    {
      id: 'B039',
      code: 'SPECTROSCOPY LAB (B039)',
      name: 'Optical Spectroscopy & UV-Vis Suite',
      wing: 'Basement Instrumental Wing',
      temp: 22.1,
      humidity: 53.0,
      leadOperator: 'Hisyam',
      instrumentIds: ['LGM-B7', 'INST-003'],
    },
    {
      id: 'B055',
      code: 'SMR LAB 2 (B055)',
      name: 'Standard Malaysian Rubber Testing Lab 2',
      wing: 'Polymer Testing Facility',
      temp: 23.0,
      humidity: 55.4,
      leadOperator: 'Nuar',
      instrumentIds: ['LGM-B8'],
    },
    {
      id: 'B035',
      code: 'SUNGAI BULOH LAB (B035 & GF/R001)',
      name: 'Micro-Weighing & Precision Research Suite',
      wing: 'Sungai Buloh Research Complex',
      temp: 21.8,
      humidity: 50.2,
      leadOperator: 'Mahfuzah & Zaidi',
      instrumentIds: ['LGM-B9', 'LGM-B10', 'LGM-B11'],
    },
    {
      id: 'B123',
      code: 'UPKS STAFF ROOM (B123)',
      name: 'Metrology Reference Standards Vault',
      wing: 'Level 1 Standards Vault',
      temp: 20.5,
      humidity: 48.0,
      leadOperator: 'Mohd Fandi (fendy)',
      instrumentIds: ['LGM-SW1'],
    },
  ];

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Instruments in current selected room
  const roomInstruments = instruments.filter((inst) =>
    selectedRoom.instrumentIds.includes(inst.id) ||
    inst.location.toLowerCase().includes(selectedRoom.id.toLowerCase())
  );

  const filteredRooms = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.leadOperator.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <section aria-label="Interactive Laboratory Floor Plan" className="bg-white rounded-lg border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="text-teal-700 font-bold">LGM PHYSICAL FACILITY MAP</span>
              <span>·</span>
              <span>UPKS TESTING COMPLEX</span>
              <span>·</span>
              <span>8 CERTIFIED LAB ROOMS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Interactive Laboratory Facility Floor Plan
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Click any laboratory room to inspect active analytical balances, ambient environmental telemetry, and operator assignments.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('virtual-bench')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded text-xs font-bold transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Virtual Test Bench</span>
            </button>
          </div>
        </div>

        {/* Search Filter Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search rooms by code (B159), name, or operator..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
            />
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Showing {filteredRooms.length} of {rooms.length} facilities
          </span>
        </div>
      </section>

      {/* Main Floorplan Matrix: Visual Architectural Grid + Selected Room Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Architectural Room Grid Visualizer */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                <span>UPKS Laboratory Architectural Map (Level 1 & Basement)</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                Click a room pod to focus sensors and instruments
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Nominal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Due Soon
              </span>
            </div>
          </div>

          {/* Interactive Room Grid Pods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredRooms.map((r) => {
              const isSelected = r.id === selectedRoom.id;
              const roomInsts = instruments.filter((i) => r.instrumentIds.includes(i.id));
              const hasAlert = roomInsts.some((i) => i.status === 'out_of_service' || i.status === 'due_soon');

              return (
                <div
                  key={r.id}
                  onClick={() => {
                    labAudio.playClick();
                    setSelectedRoomId(r.id);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer relative flex flex-col justify-between min-h-[140px] group ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-teal-800">
                        {r.code}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${hasAlert ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    </div>
                    <h3 className="text-xs font-semibold text-slate-700 mt-1 leading-snug line-clamp-1">
                      {r.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {r.wing} · Lead: <strong className="text-slate-600">{r.leadOperator}</strong>
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-slate-400" />
                      {r.temp}°C
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-slate-400" />
                      {r.humidity}%
                    </span>
                    <span className="font-bold text-teal-800">
                      {roomInsts.length} Units
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Selected Room Detail & Equipment Console */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                ROOM POD {selectedRoom.id}
              </span>
              <span className="text-xs font-mono text-slate-400">{selectedRoom.wing}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">{selectedRoom.name}</h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Assigned Metrology Staff: <strong className="text-slate-700">{selectedRoom.leadOperator}</strong>
            </p>
          </div>

          {/* Environmental Telemetry Sensors */}
          <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Temperature</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 flex items-center justify-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-teal-600" />
                {selectedRoom.temp}°C
              </span>
              <span className="text-[9px] text-emerald-700 font-sans block mt-0.5">Nominal (±1°C)</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Humidity</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 flex items-center justify-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                {selectedRoom.humidity}%
              </span>
              <span className="text-[9px] text-emerald-700 font-sans block mt-0.5">ISO 17025 OK</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Airflow</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 flex items-center justify-center gap-1">
                <Wind className="w-3.5 h-3.5 text-slate-600" />
                16 ACH
              </span>
              <span className="text-[9px] text-emerald-700 font-sans block mt-0.5">Laminar Draft</span>
            </div>
          </div>

          {/* Instruments Stationed in this Room */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
              <span>Stationed Instruments ({roomInstruments.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">Click to Inspect</span>
            </div>

            {roomInstruments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded">
                No active instruments stationed in this chamber.
              </div>
            ) : (
              <div className="space-y-2.5">
                {roomInstruments.map((inst) => (
                  <div
                    key={inst.id}
                    className="p-3 rounded-lg border border-slate-200 hover:border-teal-600 transition-colors bg-white shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {inst.referenceNo ? (
                            <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                              {inst.referenceNo}
                            </span>
                          ) : (
                            <span className="font-mono text-[11px] font-bold text-slate-700">
                              {inst.id}
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-900">{inst.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                          Tolerance: ±{inst.toleranceLimit} {inst.unit} · SN: {inst.serialNo}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          inst.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : inst.status === 'out_of_service'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200 animate-pulse'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {inst.status === 'active' ? 'Active' : inst.status === 'out_of_service' ? 'Quarantined' : 'Due Soon'}
                      </span>
                    </div>

                    {/* Quick Room Instrument Triggers */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => onOpenInstrumentProfile(inst)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-[11px]"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>Profile & QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onStartVerification(inst)}
                        className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1 text-[11px]"
                      >
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        <span>Verify Reading</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
