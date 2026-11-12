import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  CheckCircle, 
  XCircle, 
  ShieldCheck 
} from 'lucide-react';

export const AuditReportView: React.FC = () => {
  const { records } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [filterApproval, setFilterApproval] = useState<string>('all');

  const activeRecords = records.filter((r) => r.isActive);

  const filteredRecords = activeRecords.filter((rec) => {
    const matchesSearch =
      rec.instrumentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.instrumentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.serialNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.certificateNumber && rec.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rec.createdBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || rec.type === filterType;
    const matchesResult = filterResult === 'all' || 
      (filterResult === 'Pass' ? (rec.resultStatus === 'Pass' || rec.resultStatus === 'Lulus') : (rec.resultStatus === 'Fail' || rec.resultStatus === 'Gagal'));
    const matchesApproval = filterApproval === 'all' || rec.approvalStatus === filterApproval;

    return matchesSearch && matchesType && matchesResult && matchesApproval;
  });

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    // Build CSV content with BOM for Excel UTF-8
    const headers = [
      'Record ID',
      'Instrument ID',
      'Instrument Name',
      'Serial Number',
      'Calibration Type',
      'Date',
      'Standard Reading',
      'Measured Reading',
      'Deviation',
      'Tolerance Limit',
      'Unit',
      'Result',
      'Approval Status',
      'Certificate Number',
      'Calibration Body',
      'Created By',
      'Creator Role',
      'Evaluated By',
      'Evaluator Role',
      'Evaluation Date',
      'Audit Notes',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.id}"`,
      `"${r.instrumentId}"`,
      `"${r.instrumentName.replace(/"/g, '""')}"`,
      `"${r.serialNo}"`,
      `"${r.type}"`,
      `"${r.date}"`,
      r.readings?.standardReading ?? '',
      r.readings?.measuredReading ?? '',
      r.readings?.deviation ?? '',
      r.readings?.toleranceLimit ?? '',
      `"${r.readings?.unit || ''}"`,
      `"${r.resultStatus === 'Lulus' ? 'Pass' : r.resultStatus === 'Gagal' ? 'Fail' : r.resultStatus}"`,
      `"${r.approvalStatus}"`,
      `"${r.certificateNumber || '-'}"`,
      `"${(r.calibrationBody || '-').replace(/"/g, '""')}"`,
      `"${r.createdBy}"`,
      `"${r.createdRole}"`,
      `"${r.evaluatedBy || '-'}"`,
      `"${r.evaluatedRole || '-'}"`,
      `"${r.evaluatedAt ? new Date(r.evaluatedAt).toLocaleDateString('en-US') : '-'}"`,
      `"${(r.evaluationNotes || r.readings?.notes || '-').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LabCalibre_Calibration_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Area */}
      <div className="bg-white rounded-lg border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Laboratory Calibration Audit Trail & History
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-teal-100 text-teal-800 border border-teal-200">
                ISO/IEC 17025
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Comprehensive historical records of daily operator verifications and external metrology certifications.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 no-print">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold transition-colors"
              title="Export complete audit trail to CSV format"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors"
              title="Print official laboratory audit report"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-100 text-xs no-print">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by record ID, serial number, instrument, cert, or technician..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
            >
              <option value="all">All Types</option>
              <option value="Internal">Internal Verification</option>
              <option value="External">External Cert</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
            >
              <option value="all">All Results</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail (Quarantine)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterApproval}
              onChange={(e) => setFilterApproval(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
            >
              <option value="all">All Approval Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Audit Record Log ({filteredRecords.length} Entries)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Official Metrology ISO/IEC 17025 Log
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No audit records match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px] font-mono">
                <tr>
                  <th className="py-2.5 px-4">Record ID</th>
                  <th className="py-2.5 px-4">Instrument & Serial</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Reading / Deviation</th>
                  <th className="py-2.5 px-4">Result</th>
                  <th className="py-2.5 px-4">Approval</th>
                  <th className="py-2.5 px-4">Audit Trail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const isPass = rec.resultStatus === 'Pass' || rec.resultStatus === 'Lulus';
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {rec.id}
                        {rec.certificateNumber && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            Cert: {rec.certificateNumber}
                          </span>
                        )}
                      </td>

                      {/* Instrument */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">{rec.instrumentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          ID: {rec.instrumentId} · SN: {rec.serialNo}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                            rec.type === 'Internal'
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {rec.type === 'Internal' ? 'Internal' : 'External'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {rec.date}
                      </td>

                      {/* Readings */}
                      <td className="py-3 px-4 font-mono">
                        <div>
                          Std: {rec.readings?.standardReading} | Meas: {rec.readings?.measuredReading} {rec.readings?.unit}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Δ: {rec.readings?.deviation} (Limit: ±{rec.readings?.toleranceLimit})
                        </div>
                      </td>

                      {/* Result */}
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                            isPass
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isPass ? (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          {isPass ? 'Pass' : 'Fail'}
                        </span>
                      </td>

                      {/* Approval Status */}
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            rec.approvalStatus === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rec.approvalStatus === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {rec.approvalStatus}
                        </span>
                      </td>

                      {/* Audit trail */}
                      <td className="py-3 px-4 text-[11px] text-slate-600 font-mono">
                        <div>
                          Created: <span className="font-semibold text-slate-800">{rec.createdBy}</span> ({rec.createdRole})
                        </div>
                        {rec.evaluatedBy ? (
                          <div className="text-slate-500 mt-0.5">
                            Approved: <span className="font-semibold text-slate-800">{rec.evaluatedBy}</span> ({rec.evaluatedRole})
                            {rec.evaluatedAt && (
                              <span className="ml-1">
                                · {new Date(rec.evaluatedAt).toLocaleDateString('en-US')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-amber-600 text-[10px]">Awaiting supervisor review</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
