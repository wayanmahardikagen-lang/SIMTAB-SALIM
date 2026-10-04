import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndoDate, formatRupiah } from '../../utils/format';
import { recalculateStudentBalance } from '../../utils/storage';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  FileDown,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const ReconciliationView: React.FC = () => {
  const { students, transactions, reconcileStudentBalance, reconcileAllBalances, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'mismatch' | 'match'>('all');
  const [selectedStudentToFix, setSelectedStudentToFix] = useState<{ id: string; name: string; stored: number; computed: number } | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Compute theoretical balance for every student
  const reconciliationData = useMemo(() => {
    return students.map((student) => {
      const computedBalance = recalculateStudentBalance(student.id, transactions);
      const difference = student.balance - computedBalance;
      const isMatch = difference === 0;

      return {
        student,
        storedBalance: student.balance,
        computedBalance,
        difference,
        isMatch,
      };
    });
  }, [students, transactions]);

  // Overall Statistics
  const totalStudents = reconciliationData.length;
  const matchCount = reconciliationData.filter((r) => r.isMatch).length;
  const mismatchCount = reconciliationData.filter((r) => !r.isMatch).length;
  const totalDiscrepancyAmount = reconciliationData
    .filter((r) => !r.isMatch)
    .reduce((acc, r) => acc + Math.abs(r.difference), 0);

  // Filtered rows
  const filteredData = useMemo(() => {
    return reconciliationData.filter((item) => {
      const matchSearch =
        item.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.nis.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = classFilter === 'all' || item.student.class === classFilter;

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'match' && item.isMatch) ||
        (statusFilter === 'mismatch' && !item.isMatch);

      return matchSearch && matchClass && matchStatus;
    });
  }, [reconciliationData, searchQuery, classFilter, statusFilter]);

  const handleFixSingle = async () => {
    if (!selectedStudentToFix || isProcessing) return;
    setIsProcessing(true);
    await reconcileStudentBalance(selectedStudentToFix.id);
    setIsProcessing(false);
    setSelectedStudentToFix(null);
  };

  const handleFixAll = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    await reconcileAllBalances();
    setIsProcessing(false);
    setShowBatchModal(false);
  };

  const handleExportExcel = () => {
    const rows = [
      [settings.schoolName.toUpperCase()],
      ['LAPORAN REKONSILIASI & VALIDASI SALDO SISWA'],
      [`Tanggal Pemeriksaan: ${formatIndoDate(new Date())}`],
      [`Tahun Ajaran: ${settings.activeAcademicYear}`],
      [],
      ['No', 'NIS', 'Nama Siswa', 'Kelas', 'Saldo Tersimpan (Rp)', 'Saldo Terhitung Transaksi (Rp)', 'Selisih (Rp)', 'Status Validasi']
    ];

    filteredData.forEach((row, idx) => {
      rows.push([
        (idx + 1).toString(),
        row.student.nis,
        row.student.name,
        row.student.class,
        row.storedBalance as any,
        row.computedBalance as any,
        row.difference as any,
        row.isMatch ? 'SESUAI' : 'PERLU DIPERIKSA'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 28 },
      { wch: 10 },
      { wch: 22 },
      { wch: 24 },
      { wch: 16 },
      { wch: 18 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekonsiliasi Saldo');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekonsiliasi_Saldo_${settings.schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
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
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Rekonsiliasi & Audit Saldo Siswa</h2>
            <p className="text-xs text-slate-500">
              Validasi matematis saldo tersimpan terhadap seluruh riwayat buku besar transaksi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mismatchCount > 0 && (
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sinkronkan Semua Selisih ({mismatchCount})</span>
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Siswa Diperiksa</div>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{totalStudents}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Siswa terdaftar di SIMTAB</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saldo Sesuai 100%</span>
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">{matchCount}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">
            {totalStudents > 0 ? `${Math.round((matchCount / totalStudents) * 100)}% valid terverifikasi` : '0%'}
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs ${mismatchCount > 0 ? 'bg-rose-50/60 border-rose-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-[11px] font-semibold flex items-center gap-1 ${mismatchCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Perlu Diperiksa (Selisih)</span>
          </div>
          <div className={`text-xl font-bold mt-1 font-mono ${mismatchCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {mismatchCount}
          </div>
          <div className={`text-[10px] mt-0.5 ${mismatchCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            {mismatchCount > 0 ? 'Membutuhkan persetujuan Admin' : 'Tidak ada selisih saldo'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Nilai Selisih</div>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {formatRupiah(totalDiscrepancyAmount)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Akumulasi deviasi saldo</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa atau NIS..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">Semua Kelas</option>
            {['1', '2', '3', '4', '5', '6'].map((c) => (
              <option key={c} value={c}>Kelas {c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="mismatch">⚠ Hanya yang Selisih</option>
            <option value="match">✓ Hanya yang Sesuai</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-3.5">NIS</th>
                <th className="py-3 px-3.5">Nama Siswa</th>
                <th className="py-3 px-3.5">Kelas</th>
                <th className="py-3 px-3.5 text-right">Saldo Tersimpan</th>
                <th className="py-3 px-3.5 text-right">Saldo Terhitung</th>
                <th className="py-3 px-3.5 text-right">Selisih</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Tidak ada data rekonsiliasi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr
                    key={row.student.id}
                    className={`transition-colors ${row.isMatch ? 'hover:bg-slate-50' : 'bg-rose-50/30 hover:bg-rose-50/60'}`}
                  >
                    <td className="py-3 px-3.5 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{row.student.nis}</td>
                    <td className="py-3 px-3.5 font-bold text-slate-900">{row.student.name}</td>
                    <td className="py-3 px-3.5 text-slate-600">Kelas {row.student.class}</td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums font-semibold text-slate-800">
                      {formatRupiah(row.storedBalance)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-indigo-700">
                      {formatRupiah(row.computedBalance)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                      {row.difference === 0 ? (
                        <span className="text-slate-400">Rp 0</span>
                      ) : (
                        <span className="font-bold text-rose-600">
                          {row.difference > 0 ? `+${formatRupiah(row.difference)}` : `-${formatRupiah(Math.abs(row.difference))}`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {row.isMatch ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SESUAI</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3" />
                          <span>PERLU DIPERIKSA</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {row.isMatch ? (
                        <span className="text-[11px] text-slate-400">Valid</span>
                      ) : (
                        <button
                          onClick={() => setSelectedStudentToFix({
                            id: row.student.id,
                            name: row.student.name,
                            stored: row.storedBalance,
                            computed: row.computedBalance
                          })}
                          className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Perbaiki Saldo
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Single Student */}
      {selectedStudentToFix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-scale-up">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Scale className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Rekonsiliasi Saldo</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menyinkronkan saldo <strong>{selectedStudentToFix.name}</strong> ke nilai hasil perhitungan transaksi?
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo Tersimpan:</span>
                <span className="font-mono font-bold text-slate-800">{formatRupiah(selectedStudentToFix.stored)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo Terhitung Transaksi:</span>
                <span className="font-mono font-bold text-emerald-700">{formatRupiah(selectedStudentToFix.computed)}</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudentToFix(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleFixSingle}
                className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isProcessing ? 'Menyinkronkan...' : 'Ya, Sesuaikan Saldo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Batch Sync */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-scale-up">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Rekonsiliasi Seluruh Data yang Selisih</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini akan menyinkronkan saldo <strong>{mismatchCount} siswa</strong> yang memiliki selisih menjadi sesuai dengan riwayat transaksi di buku besar. Aktivitas ini akan tercatat dalam audit log.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleFixAll}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isProcessing ? 'Memproses...' : 'Sinkronkan Semua'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
