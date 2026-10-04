import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndoDateTime, formatIndoDate } from '../../utils/format';
import {
  ShieldAlert,
  Search,
  Filter,
  FileDown,
  Clock,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const AuditLogView: React.FC = () => {
  const { auditLogs, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchAction = filterAction === 'all' || log.action === filterAction;

      return matchSearch && matchAction;
    });
  }, [auditLogs, searchQuery, filterAction]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.action)));
  }, [auditLogs]);

  const handleExportExcel = () => {
    const rows = [
      [settings.schoolName.toUpperCase()],
      ['LOG AUDIT AKTIVITAS SISTEM TABUNGAN'],
      [`Tanggal Cetak: ${formatIndoDate(new Date())}`],
      [],
      ['No', 'Waktu & Tanggal', 'Nama Pengguna', 'Peran (Role)', 'Jenis Aktivitas', 'Detail Aktivitas']
    ];

    filteredLogs.forEach((l, idx) => {
      rows.push([
        (idx + 1).toString(),
        formatIndoDateTime(l.timestamp),
        l.userName,
        l.role,
        l.action,
        l.details
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 24 },
      { wch: 12 },
      { wch: 22 },
      { wch: 45 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Log');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Log_${settings.schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Audit Log Keamanan & Aktivitas</h2>
            <p className="text-xs text-slate-500">
              Rekam jejak setiap aksi pengguna (setoran, penarikan, koreksi, edit siswa, dan export)
            </p>
          </div>
        </div>

        <button
          onClick={handleExportExcel}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FileDown className="w-4 h-4 text-emerald-600" />
          <span>Export Log Excel</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dalam catatan audit log..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
          />
        </div>

        <div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 bg-white"
          >
            <option value="all">Semua Jenis Aktivitas</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4 w-44">Waktu & Tanggal</th>
                <th className="py-3 px-4 w-40">Pengguna</th>
                <th className="py-3 px-4 w-24">Role</th>
                <th className="py-3 px-4 w-44">Aktivitas</th>
                <th className="py-3 px-4">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada aktivitas yang tercatat sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-600 font-mono">
                      {formatIndoDateTime(log.timestamp)}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{log.userName}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          log.role === 'ADMIN' ? 'text-indigo-700' : 'text-emerald-700'
                        }`}
                      >
                        {log.role === 'ADMIN' ? (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                        <span>{log.role}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 leading-relaxed">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
