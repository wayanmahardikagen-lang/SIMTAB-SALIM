import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndoDate, formatRupiah, getTodayDateString } from '../../utils/format';
import { exportRecapToExcel } from '../../utils/excel';
import { calculateSavingDays } from '../../utils/storage';
import {
  BarChart3,
  Calendar,
  FileDown,
  Printer,
  Filter,
  Search,
  Wallet
} from 'lucide-react';

export const RecapSavings: React.FC = () => {
  const { students, transactions, settings } = useApp();

  const [periodPreset, setPeriodPreset] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Date range resolution based on periodPreset
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const today = new Date();
    const todayStr = getTodayDateString();

    if (periodPreset === 'today') {
      return { startDate: todayStr, endDate: todayStr, periodLabel: `Hari Ini (${formatIndoDate(todayStr)})` };
    }

    if (periodPreset === 'this_week') {
      const day = today.getDay(); // 0 is Sunday
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(today.setDate(diff));
      const monStr = monday.toISOString().split('T')[0];
      return { startDate: monStr, endDate: todayStr, periodLabel: `Minggu Ini (${formatIndoDate(monStr)} - ${formatIndoDate(todayStr)})` };
    }

    if (periodPreset === 'this_month') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      return { startDate: start, endDate: todayStr, periodLabel: `Bulan Ini (${formatIndoDate(start)} - ${formatIndoDate(todayStr)})` };
    }

    if (periodPreset === 'semester_1') {
      return { startDate: '2026-07-01', endDate: '2026-12-31', periodLabel: 'Semester 1 (Ganjil) 2026' };
    }

    if (periodPreset === 'semester_2') {
      return { startDate: '2027-01-01', endDate: '2027-06-30', periodLabel: 'Semester 2 (Genap) 2027' };
    }

    if (periodPreset === 'custom') {
      return {
        startDate: customStartDate,
        endDate: customEndDate,
        periodLabel: `${formatIndoDate(customStartDate)} s/d ${formatIndoDate(customEndDate)}`,
      };
    }

    // Default 'all' / Tahun Ajaran Aktif
    return {
      startDate: '',
      endDate: '',
      periodLabel: `Tahun Ajaran ${settings.activeAcademicYear}`,
    };
  }, [periodPreset, customStartDate, customEndDate, settings.activeAcademicYear]);

  // Compute student recap rows
  const recapRows = useMemo(() => {
    return students
      .filter((s) => {
        const matchClass = selectedClass === 'all' || s.class === selectedClass;
        const matchSearch =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nis.toLowerCase().includes(searchQuery.toLowerCase());
        return matchClass && matchSearch;
      })
      .map((student) => {
        // Transactions before startDate determine initialBalance
        let initialBalance = 0;
        if (startDate) {
          const priorTrx = transactions.filter(
            (t) => t.studentId === student.id && t.status === 'VALID' && t.date < startDate
          );
          for (const t of priorTrx) {
            if (t.type === 'SETORAN') initialBalance += t.amount;
            else if (t.type === 'PENARIKAN') initialBalance -= t.amount;
          }
        }

        // Stats in this period
        const stats = calculateSavingDays(student.id, transactions, startDate || undefined, endDate || undefined);

        const periodTrxCount = transactions.filter((t) => {
          if (t.studentId !== student.id || t.status !== 'VALID') return false;
          if (startDate && t.date < startDate) return false;
          if (endDate && t.date > endDate) return false;
          return true;
        }).length;

        const finalBalance = initialBalance + stats.totalDeposit - stats.totalWithdrawal;

        return {
          studentId: student.id,
          studentName: student.name,
          nis: student.nis,
          class: student.class,
          initialBalance,
          totalDeposit: stats.totalDeposit,
          totalWithdrawal: stats.totalWithdrawal,
          finalBalance,
          transactionCount: periodTrxCount,
          savingDaysCount: stats.daysCount,
        };
      });
  }, [students, transactions, startDate, endDate, selectedClass, searchQuery]);

  // Grand Totals (Section 9)
  const totals = useMemo(() => {
    return recapRows.reduce(
      (acc, row) => ({
        initialBalance: acc.initialBalance + row.initialBalance,
        totalDeposit: acc.totalDeposit + row.totalDeposit,
        totalWithdrawal: acc.totalWithdrawal + row.totalWithdrawal,
        finalBalance: acc.finalBalance + row.finalBalance,
        transactionCount: acc.transactionCount + row.transactionCount,
      }),
      {
        initialBalance: 0,
        totalDeposit: 0,
        totalWithdrawal: 0,
        finalBalance: 0,
        transactionCount: 0,
      }
    );
  }, [recapRows]);

  const handleExportExcel = () => {
    exportRecapToExcel(recapRows, periodLabel, settings);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Rekapitulasi Tabungan Siswa</h2>
          <p className="text-xs text-slate-500">
            Laporan agregasi setoran, penarikan, saldo akhir, dan hari menabung
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Presets Bar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">
            Periode:
          </span>
          {[
            { id: 'all', label: 'Tahun Ajaran' },
            { id: 'today', label: 'Hari Ini' },
            { id: 'this_week', label: 'Minggu Ini' },
            { id: 'this_month', label: 'Bulan Ini' },
            { id: 'semester_1', label: 'Semester 1' },
            { id: 'semester_2', label: 'Semester 2' },
            { id: 'custom', label: 'Rentang Tanggal' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriodPreset(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                periodPreset === tab.id
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="all">Semua Kelas</option>
              <option value="1">Kelas 1</option>
              <option value="2">Kelas 2</option>
              <option value="3">Kelas 3</option>
              <option value="4">Kelas 4</option>
              <option value="5">Kelas 5</option>
              <option value="6">Kelas 6</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Custom Date Picker */}
          {periodPreset === 'custom' && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-1/2 px-2 py-1.5 text-xs rounded-xl border border-slate-200"
              />
              <span className="text-xs text-slate-400">-</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-1/2 px-2 py-1.5 text-xs rounded-xl border border-slate-200"
              />
            </div>
          )}
        </div>
      </div>

      {/* Printable Sheet Wrapper */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 print:border-none print:p-0">
        {/* School Formal Header for Print */}
        <div className="text-center pb-4 mb-4 border-b-2 border-slate-900 hidden print:block">
          <h2 className="text-base font-bold uppercase">{settings.schoolName}</h2>
          <p className="text-xs">{settings.address} · NPSN: {settings.npsn}</p>
          <h3 className="text-sm font-bold uppercase mt-2">REKAPITULASI TABUNGAN SISWA</h3>
          <p className="text-xs">Periode: {periodLabel} | Tahun Ajaran: {settings.activeAcademicYear}</p>
        </div>

        {/* Screen Period Title */}
        <div className="no-print flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="text-xs font-semibold text-slate-600">
            Periode Aktif: <strong className="text-slate-900">{periodLabel}</strong>
          </div>
          <div className="text-xs text-slate-500">
            Total Siswa Terdaftar: <strong>{recapRows.length}</strong>
          </div>
        </div>

        {/* Recap Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider print:bg-slate-100">
                <th className="py-2.5 px-3 text-center">No</th>
                <th className="py-2.5 px-3">Nama Siswa</th>
                <th className="py-2.5 px-3 text-center">Kelas</th>
                <th className="py-2.5 px-3 text-right">Saldo Awal</th>
                <th className="py-2.5 px-3 text-right">Total Setoran</th>
                <th className="py-2.5 px-3 text-right">Total Penarikan</th>
                <th className="py-2.5 px-3 text-right">Saldo Akhir</th>
                <th className="py-2.5 px-3 text-center">Hari Menabung</th>
                <th className="py-2.5 px-3 text-center">Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recapRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ada data tabungan pada periode ini.
                  </td>
                </tr>
              ) : (
                recapRows.map((row, idx) => (
                  <tr key={row.studentId} className="hover:bg-slate-50 print:border-b print:border-slate-200">
                    <td className="py-2 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      {row.studentName}
                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">({row.nis})</span>
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600">{row.class}</td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-slate-500">
                      {formatRupiah(row.initialBalance)}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right font-medium text-emerald-700">
                      {formatRupiah(row.totalDeposit)}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right font-medium text-amber-700">
                      {formatRupiah(row.totalWithdrawal)}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right font-bold text-slate-900">
                      {formatRupiah(row.finalBalance)}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-indigo-700">
                      {row.savingDaysCount} hari
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600 font-mono">
                      {row.transactionCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Total Footer (Section 9) */}
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-xs text-slate-900">
                <td colSpan={3} className="py-3 px-3 uppercase text-center">
                  TOTAL KESELURUHAN
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-right">
                  {formatRupiah(totals.initialBalance)}
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-right text-emerald-800">
                  {formatRupiah(totals.totalDeposit)}
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-right text-amber-800">
                  {formatRupiah(totals.totalWithdrawal)}
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-right text-slate-900 text-sm">
                  {formatRupiah(totals.finalBalance)}
                </td>
                <td className="py-3 px-3 text-center">-</td>
                <td className="py-3 px-3 text-center font-mono text-slate-800">
                  {totals.transactionCount} trx
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Formal Signature Area for Print */}
        <div className="pt-10 hidden print:grid grid-cols-2 gap-8 text-xs text-center">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold">Kepala Sekolah {settings.schoolName}</p>
            <div className="h-20"></div>
            <p className="font-bold underline">{settings.headmasterName}</p>
            <p className="text-[10px]">NIP. {settings.headmasterNip}</p>
          </div>
          <div>
            <p>Loloan Timur, {formatIndoDate(new Date())}</p>
            <p className="font-semibold">Petugas Tabungan Siswa</p>
            <div className="h-20"></div>
            <p className="font-bold underline">{settings.treasurerName}</p>
            <p className="text-[10px]">NIP. {settings.treasurerNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
