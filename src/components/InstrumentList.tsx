import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Instrument, InstrumentStatus } from '../types';
import { LGM_MASTERLIST_METADATA } from '../data/mockData';
import { 
  Search, 
  Plus, 
  QrCode, 
  Sparkles, 
  FileText, 
  Eye, 
  X, 
  Layers, 
  RotateCcw, 
  AlertTriangle,
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  User,
  Building2,
  Table
} from 'lucide-react';

const ATTACHED_MASTERLIST_CSV = `,MASTER LIST OF BALANCE CALIBRATION,,,,,,,,,
,,,,,,,,,,
,UPKS,NO,NO RUJUKAN LGM,INSTRUMENT,OPERATOR,LOCATION,CALIBRATION DATE,NEXT CALIBRATION DATE,COMPANY,STATUS
,,,,,,,,,,
,,1,LGM/SW1,STANDARD WEIGHT (METTLER TOLEDO),FENDY,UPKS STAFF ROOM (B123),7/3/2024,22/9/2026,METCAL,GOOD
,,,,,,,,,,
,,2,LGM/B1,ANALYTICAL BALANCE (METTLER TOLEDO) ,ABID,UPKS LAB (B159),7/1/2024,30/6/2026,METCAL,GOOD
,,,,,,,,,,
,,3,LGM/B2,ANALYTICAL BALANCE (SARTORIUS),ABID,UPKS LAB (B159),7/1/2024,30/6/2026,METCAL,GOOD
,,,,,,,,,,
,,4,LGM/B3,ANALYTICAL BALANCE (METTLER TOLEDO),HISYAM,UPKS CHROMA LAB (B033),24/9/2025,30/6/2026,METCAL,GOOD
,,,,,,,,,,
,,5,LGM/B4,ANALYTICAL BALANCE (METTLER TOLEDO),NUAR,THERMAL LAB (B042),24/9/2025,30/6/2026,METCAL,GOOD
,,,,,,,,,,
,,6,LGM/B5,ANALYTICAL BALANCE (SARTORIUS),NUAR,NITROSAMINE LAB (B048),24/9/2025,30/6/2026,METCAL,GOOD
,,,,,,,,,,
,,7,LGM/B6,ANALYTICAL BALANCE (SARTORIUS),NUAR,NITROSAMINE LAB (B048),24/9/2025,30/6/2026,METCAL,GOOD
,,,,,,,,,,
,,8,LGM/B7,ANALYTICAL BALANCE (METTLER TOLEDO),HISYAM,SPECTROSCOPY LAB (B039),24/9/2025,30/6/2026,METCAL,GOOD
,,,,,,,,,,
,,9,LGM/B8,ANALYTICAL BALANCE (SARTORIUS),NUAR,SMR LAB 2 (B055),,,,
,,,,,,,,,,
,,10,LGM/B9,MICRO BALANCE (METTLER TOLEDO),MAHFUZAH,SUNGAI BULOH LAB (B035),24/9/2025,24/9/2026,METCAL,GOOD
,,,,,,,,,,
,,11,LGM/B10,ANALYTICAL BALANCE (SARTORIUS)-Cubis II Semi-Micro Balance,ZAIDI,SUNGAI BULOH LAB (GF/R001),9/10/2025,9/10/2026,METCAL,GOOD
,,,,,,,,,,
,,12,LGM/B11,ANALYTICAL BALANCE (SARTORIUS)-Entris II Essential Line Precision Balance,MAHFUZAH,SUNGAI BULOH LAB (B035),24/9/2025,24/9/2026,METCAL,GOOD
,,,,,,,,,,
,PREPARED BY : MOHD FANDI BIN MOHD SUKRI,,,,,,,,,
,SIGN                 :     fendy,,,,,,,,,`;

interface InstrumentListProps {
  onOpenInstrumentProfile: (instrument: Instrument) => void;
  onStartVerification: (instrument: Instrument) => void;
  onStartExternalCert: (instrument: Instrument) => void;
}

export const InstrumentList: React.FC<InstrumentListProps> = ({
  onOpenInstrumentProfile,
  onStartVerification,
  onStartExternalCert,
}) => {
  const { 
    instruments, 
    addInstrument, 
    currentUser, 
    quarantineInstrument, 
    activateInstrument,
    syncLgmMasterlist,
    importMasterlistFromCsv
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMasterlistModalOpen, setIsMasterlistModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form for New Instrument
  const [newName, setNewName] = useState('');
  const [newSerialNo, setNewSerialNo] = useState('');
  const [newCategory, setNewCategory] = useState('Analytical Balances');
  const [newLocation, setNewLocation] = useState('UPKS Lab (B159)');
  const [newTarget, setNewTarget] = useState('100.0000');
  const [newTolerance, setNewTolerance] = useState('0.0002');
  const [newUnit, setNewUnit] = useState('g');
  const [newLastDate, setNewLastDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState('');
  const [newOperator, setNewOperator] = useState('Abid');
  const [newReferenceNo, setNewReferenceNo] = useState('LGM/B12');
  const [newCompany, setNewCompany] = useState('METCAL');

  // Categories list
  const categories = [
    'all',
    'Analytical Balances',
    'Standard Weights',
    'Micro Balances',
    'Semi-Micro Balances',
    'Precision Balances',
    'Chromatography',
    'Spectroscopy',
    'Liquid Handling',
    'Electrochemistry',
    'Thermal Systems',
  ];

  // Filter instruments
  const activeInstruments = instruments.filter((i) => i.isActive);

  const filtered = activeInstruments.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.serialNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || inst.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || inst.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: InstrumentStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active (Pass)
          </span>
        );
      case 'out_of_service':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-50 text-rose-800 border border-rose-300 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Out of Service (Quarantined)
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Due Soon (Reminder)
          </span>
        );
    }
  };

  const handleCreateInstrument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSerialNo) return;

    let dueDate = newDueDate;
    if (!dueDate) {
      const d = new Date(newLastDate);
      d.setFullYear(d.getFullYear() + 1);
      dueDate = d.toISOString().split('T')[0];
    }

    const created = addInstrument({
      name: newName,
      serialNo: newSerialNo,
      category: newCategory,
      location: newLocation,
      targetReading: parseFloat(newTarget) || 100,
      toleranceLimit: parseFloat(newTolerance) || 0.001,
      unit: newUnit,
      status: 'active',
      lastCalibrationDate: newLastDate,
      nextDueDate: dueDate,
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewSerialNo('');
    onOpenInstrumentProfile(created);
  };

  const handleApplyCsv = () => {
    if (!csvText.trim()) return;
    const res = importMasterlistFromCsv(csvText);
    setImportFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setIsCsvModalOpen(false);
        setCsvText('');
        setImportFeedback(null);
      }, 1500);
    }
  };

  const handleDownloadOriginalCsv = () => {
    const blob = new Blob([ATTACHED_MASTERLIST_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '2026_Masterlist_Balance_UPKS_LGM.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Official LGM UPKS Master List Information Strip */}
      <section aria-label="Official LGM Masterlist Information" className="bg-slate-900 text-white rounded-lg p-4 sm:p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-400 mt-0.5">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-teal-900/60 text-teal-300 border border-teal-700/60 px-2 py-0.5 rounded">
                Official LGM UPKS Master List (2026)
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {LGM_MASTERLIST_METADATA.totalItems} Balance Units Loaded
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-100 tracking-tight mt-1">
              Master List of Balance Calibration — Lembaga Getah Malaysia (LGM)
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
              <span>Prepared by: <strong className="text-slate-200">{LGM_MASTERLIST_METADATA.preparedBy} (fendy)</strong></span>
              <span>·</span>
              <span>Unit: <strong className="text-slate-200">UPKS</strong></span>
              <span>·</span>
              <span>Calibration Agency: <strong className="text-slate-200">METCAL</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsMasterlistModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Table className="w-3.5 h-3.5 text-teal-400" />
            <span>View Master List Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsCsvModalOpen(true);
              setImportFeedback(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
            <span>Import / Sync CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSyncing(true);
              syncLgmMasterlist();
              setTimeout(() => setIsSyncing(false), 500);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition-colors"
            title="Reload official LGM master list balances"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Master List</span>
          </button>
        </div>
      </section>

      {/* Top Banner & Header */}
      <div className="bg-white rounded-lg border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Laboratory Instrument Database & Inventory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Scientific apparatus inventory, tolerance limit parameters, compliance status, and QR tags.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded text-xs font-semibold transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Instrument</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-100">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by instrument name, ID, reference (LGM/B1), operator, serial number, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
            >
              <option value="all">All Categories</option>
              {categories.filter((c) => c !== 'all').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Pass)</option>
              <option value="due_soon">Due Soon / Pending Cal</option>
              <option value="out_of_service">Out of Service (Quarantined)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table with Horizontal Scroll */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-700" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Instrument Records ({filtered.length} Found)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Tabular density optimized for clinical lab workstation
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-semibold">No instruments match your criteria</p>
            <p className="text-xs">Adjust your search query or filter selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px] font-mono">
                <tr>
                  <th className="py-2.5 px-4">Ref & QR Tag</th>
                  <th className="py-2.5 px-4">Instrument & Assigned Operator</th>
                  <th className="py-2.5 px-4">Category & Lab Room</th>
                  <th className="py-2.5 px-4">Specs & Tolerance</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Calibration & Due Date</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* ID & QR button */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenInstrumentProfile(inst)}
                          className="p-1.5 rounded bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 transition-colors"
                          title="View QR Code & Lab Tag"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          {inst.referenceNo ? (
                            <span className="font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded text-[11px] block w-fit">
                              {inst.referenceNo}
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-slate-900 block">
                              {inst.id}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            {inst.serialNo}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Name & Operator */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onOpenInstrumentProfile(inst)}
                        className="font-semibold text-slate-900 hover:text-teal-800 hover:underline text-left block"
                      >
                        {inst.name}
                      </button>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Operator: <strong className="text-slate-700">{inst.assignedOperator || 'Unassigned'}</strong></span>
                      </div>
                    </td>

                    {/* Category & Location */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block">{inst.category}</span>
                      <span className="text-[11px] text-slate-500 font-mono block mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{inst.location}</span>
                      </span>
                    </td>

                    {/* Target & Tolerance */}
                    <td className="py-3 px-4 font-mono">
                      <span className="text-slate-900 font-semibold">
                        Target: {inst.targetReading} {inst.unit}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Limit: ±{inst.toleranceLimit} {inst.unit}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">{getStatusBadge(inst.status)}</td>

                    {/* Due Date & Company */}
                    <td className="py-3 px-4 font-mono">
                      <span className="text-slate-900 font-medium block">
                        Due: {inst.nextDueDate}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Last: {inst.lastCalibrationDate} · <span className="font-semibold text-teal-800">{inst.calibrationCompany || 'METCAL'}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenInstrumentProfile(inst)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                          title="View Instrument Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onStartVerification(inst)}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                          title="Daily Verification (Auto-Calc)"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          <span>Verify</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onStartExternalCert(inst)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                          title="Upload External Certificate (AI)"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-600" />
                          <span className="hidden sm:inline">Cert</span>
                        </button>

                        {/* Supervisor Quarantine Toggle */}
                        {currentUser.role === 'supervisor' && (
                          inst.status === 'out_of_service' ? (
                            <button
                              type="button"
                              onClick={() => activateInstrument(inst.id)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-semibold"
                              title="Reactivate Instrument"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                quarantineInstrument(inst.id, 'Manual quarantine enforced by Quality Supervisor.')
                              }
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-semibold"
                              title="Change to Out of Service (Quarantine)"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Instrument Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs no-print">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-teal-800 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Register New Laboratory Instrument
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInstrument} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Instrument Name *:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Analytical Balance Sartorius Cubis II"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Manufacturer Serial Number *:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., SN-8829-01"
                    value={newSerialNo}
                    onChange={(e) => setNewSerialNo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Instrument Category:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
                  >
                    {categories.filter((c) => c !== 'all').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Physical Laboratory Location:
                </label>
                <input
                  type="text"
                  placeholder="e.g., Balance Room Lab A"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                    Target Benchmark (X₀):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                    Tolerance Limit (±δ):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newTolerance}
                    onChange={(e) => setNewTolerance(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                    Unit:
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Last Calibration Date:
                  </label>
                  <input
                    type="date"
                    value={newLastDate}
                    onChange={(e) => setNewLastDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Next Due Date:
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    placeholder="Leave blank for +1 year"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white rounded shadow-xs"
                >
                  Save & Generate QR Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Master List Sheet Document Viewer Modal */}
      {isMasterlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs no-print">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-100">
                    MASTER LIST OF BALANCE CALIBRATION — UPKS (2026)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Extracted from official document · Lembaga Getah Malaysia (LGM)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMasterlistModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              {/* Document Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Division / Unit:</span>
                  <span className="font-bold text-slate-900">UPKS (Unit Pengujian Kualiti Saintifik)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Organisation:</span>
                  <span className="font-bold text-slate-900">Lembaga Getah Malaysia (LGM)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Primary Calibrator:</span>
                  <span className="font-bold text-teal-800">METCAL Calibration Services</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Total Balance Units:</span>
                  <span className="font-bold text-slate-900">12 Verified Units</span>
                </div>
              </div>

              {/* Exact Tabular Representation of Master List */}
              <div className="border border-slate-200 rounded overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">No Rujukan LGM</th>
                      <th className="py-2 px-3">Instrument</th>
                      <th className="py-2 px-3">Operator</th>
                      <th className="py-2 px-3">Location</th>
                      <th className="py-2 px-3">Calibration Date</th>
                      <th className="py-2 px-3">Next Due Date</th>
                      <th className="py-2 px-3">Company</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {[
                      { no: 1, ref: 'LGM/SW1', name: 'STANDARD WEIGHT (METTLER TOLEDO)', opr: 'FENDY', loc: 'UPKS STAFF ROOM (B123)', cal: '7/3/2024', next: '22/9/2026', co: 'METCAL', status: 'GOOD' },
                      { no: 2, ref: 'LGM/B1', name: 'ANALYTICAL BALANCE (METTLER TOLEDO)', opr: 'ABID', loc: 'UPKS LAB (B159)', cal: '7/1/2024', next: '30/6/2026', co: 'METCAL', status: 'GOOD' },
                      { no: 3, ref: 'LGM/B2', name: 'ANALYTICAL BALANCE (SARTORIUS)', opr: 'ABID', loc: 'UPKS LAB (B159)', cal: '7/1/2024', next: '30/6/2026', co: 'METCAL', status: 'GOOD' },
                      { no: 4, ref: 'LGM/B3', name: 'ANALYTICAL BALANCE (METTLER TOLEDO)', opr: 'HISYAM', loc: 'UPKS CHROMA LAB (B033)', cal: '24/9/2025', next: '30/6/2026', co: 'METCAL', status: 'GOOD' },
                      { no: 5, ref: 'LGM/B4', name: 'ANALYTICAL BALANCE (METTLER TOLEDO)', opr: 'NUAR', loc: 'THERMAL LAB (B042)', cal: '24/9/2025', next: '30/6/2026', co: 'METCAL', status: 'GOOD' },
                      { no: 6, ref: 'LGM/B5', name: 'ANALYTICAL BALANCE (SARTORIUS)', opr: 'NUAR', loc: 'NITROSAMINE LAB (B048)', cal: '24/9/2025', next: '30/6/2026', co: 'METCAL', status: 'GOOD' },
                      { no: 7, ref: 'LGM/B6', name: 'ANALYTICAL BALANCE (SARTORIUS)', opr: 'NUAR', loc: 'NITROSAMINE LAB (B048)', cal: '24/9/2025', next: '30/6/2026', co: 'METCAL', status: 'GOOD' },
                      { no: 8, ref: 'LGM/B7', name: 'ANALYTICAL BALANCE (METTLER TOLEDO)', opr: 'HISYAM', loc: 'SPECTROSCOPY LAB (B039)', cal: '24/9/2025', next: '30/6/2026', co: 'METCAL', status: 'GOOD' },
                      { no: 9, ref: 'LGM/B8', name: 'ANALYTICAL BALANCE (SARTORIUS)', opr: 'NUAR', loc: 'SMR LAB 2 (B055)', cal: '—', next: 'Immediate Action', co: 'Pending', status: 'UNSCHEDULED' },
                      { no: 10, ref: 'LGM/B9', name: 'MICRO BALANCE (METTLER TOLEDO)', opr: 'MAHFUZAH', loc: 'SUNGAI BULOH LAB (B035)', cal: '24/9/2025', next: '24/9/2026', co: 'METCAL', status: 'GOOD' },
                      { no: 11, ref: 'LGM/B10', name: 'ANALYTICAL BALANCE (SARTORIUS)-Cubis II Semi-Micro Balance', opr: 'ZAIDI', loc: 'SUNGAI BULOH LAB (GF/R001)', cal: '9/10/2025', next: '9/10/2026', co: 'METCAL', status: 'GOOD' },
                      { no: 12, ref: 'LGM/B11', name: 'ANALYTICAL BALANCE (SARTORIUS)-Entris II Essential Line Precision Balance', opr: 'MAHFUZAH', loc: 'SUNGAI BULOH LAB (B035)', cal: '24/9/2025', next: '24/9/2026', co: 'METCAL', status: 'GOOD' },
                    ].map((row) => (
                      <tr key={row.no} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-500">{row.no}</td>
                        <td className="py-2 px-3 font-bold text-teal-800">{row.ref}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{row.name}</td>
                        <td className="py-2 px-3 text-slate-700">{row.opr}</td>
                        <td className="py-2 px-3 text-slate-600">{row.loc}</td>
                        <td className="py-2 px-3 text-slate-700">{row.cal}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{row.next}</td>
                        <td className="py-2 px-3 text-teal-700">{row.co}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            row.status === 'GOOD'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-300'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Official Sign-off Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Document Validation & Sign-off:</span>
                  <span className="font-bold text-slate-900">PREPARED BY: MOHD FANDI BIN MOHD SUKRI</span>
                  <span className="block text-slate-500 text-[10px]">SIGNATURE / INITIAL: <strong className="text-teal-800">fendy</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Synchronized in System Inventory</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleDownloadOriginalCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded bg-white hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Master List CSV</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    syncLgmMasterlist();
                    setIsMasterlistModalOpen(false);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white rounded transition-colors"
                >
                  Re-sync All to Inventory
                </button>
                <button
                  type="button"
                  onClick={() => setIsMasterlistModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Master List Importer Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs no-print">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-amber-500 text-white flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Extract & Synchronize Master List CSV
                  </h3>
                  <span className="text-[10px] text-slate-500 block">
                    Parse balance calibration schedules from LGM master lists
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="bg-teal-50 border border-teal-200 rounded p-3 text-teal-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-teal-800">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>One-Click Preset Available</span>
                </span>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  Click the button below to instantly populate and extract the attached <strong>2026 Masterlist Balance - Periodic Verification</strong> file into the laboratory system.
                </p>
                <button
                  type="button"
                  onClick={() => setCsvText(ATTACHED_MASTERLIST_CSV)}
                  className="mt-1 px-3 py-1 bg-teal-800 hover:bg-teal-900 text-white font-bold text-[11px] rounded transition-colors shadow-2xs"
                >
                  Load Attached 2026 LGM Master List File
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Or Paste Master List CSV Data:
                </label>
                <textarea
                  rows={8}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Paste CSV rows here (e.g. ,1,LGM/SW1,STANDARD WEIGHT,FENDY,...)"
                  className="w-full p-2.5 border border-slate-300 rounded font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-teal-700 bg-slate-50"
                />
              </div>

              {importFeedback && (
                <div
                  className={`p-3 rounded text-xs font-mono ${
                    importFeedback.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border border-rose-300'
                  }`}
                >
                  {importFeedback.message}
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!csvText.trim()}
                onClick={handleApplyCsv}
                className="px-4 py-1.5 text-xs font-bold bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded transition-colors shadow-xs"
              >
                Extract & Update Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
