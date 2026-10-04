import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndoDate, formatRupiah } from '../../utils/format';
import { exportClassRecapToExcel } from '../../utils/excel';
import { calculateClassRecaps } from '../../utils/storage';
import { ClassRecapItem } from '../../types';
import {
  School,
  FileDown,
  Printer,
  TrendingUp,
  Award,
  Users
} from 'lucide-react';

export const RecapClass: React.FC = () => {
  const { students, transactions, settings } = useApp();

  const classDataList: ClassRecapItem[] = useMemo(() => {
    const rawMap = calculateClassRecaps(students, transactions);
    const classes = ['1', '2', '3', '4', '5', '6'];

    return classes.map((cls) => {
      const data = rawMap[cls] || {
        studentCount: 0,
        activeCount: 0,
        totalBalance: 0,
        totalDeposit: 0,
        totalWithdraw: 0,
        transactionCount: 0,
      };

      return {
        class: cls,
        studentCount: data.studentCount,
        activeStudentCount: data.activeCount,
        totalBalance: data.totalBalance,
        totalDeposit: data.totalDeposit,
        totalWithdrawal: data.totalWithdraw,
        totalTransactions: data.transactionCount,
        avgBalance: data.studentCount > 0 ? Math.round(data.totalBalance / data.studentCount) : 0,
      };
    });
  }, [students, transactions]);

  // Ranking classes by highest total balance
  const rankedByBalance = [...classDataList].sort((a, b) => b.totalBalance - a.totalBalance);

  const grandTotals = useMemo(() => {
    return classDataList.reduce(
      (acc, c) => ({
        studentCount: acc.studentCount + c.studentCount,
        activeCount: acc.activeCount + c.activeStudentCount,
        totalBalance: acc.totalBalance + c.totalBalance,
        totalDeposit: acc.totalDeposit + c.totalDeposit,
        totalWithdrawal: acc.totalWithdrawal + c.totalWithdrawal,
        totalTransactions: acc.totalTransactions + c.totalTransactions,
      }),
      {
        studentCount: 0,
        activeCount: 0,
        totalBalance: 0,
        totalDeposit: 0,
        totalWithdrawal: 0,
        totalTransactions: 0,
      }
    );
  }, [classDataList]);

  const handleExport = () => {
    exportClassRecapToExcel(classDataList, settings);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Rekap Tabungan per Kelas</h2>
          <p className="text-xs text-slate-500">
            Perbandingan saldo, keaktifan menabung, dan transaksi antar rombongan belajar
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
            onClick={handleExport}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Class Ranking Highlights Cards */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4">
        {rankedByBalance.slice(0, 3).map((item, idx) => (
          <div
            key={item.class}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                  idx === 0
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : idx === 1
                    ? 'bg-slate-100 text-slate-700 border border-slate-300'
                    : 'bg-orange-100 text-orange-800 border border-orange-300'
                }`}
              >
                #{idx + 1}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Kelas {item.class}</h4>
                <p className="text-[11px] text-slate-500">{item.studentCount} Siswa ({item.activeStudentCount} Aktif)</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Saldo</span>
              <span className="text-sm font-bold font-mono text-emerald-800 tabular-nums">
                {formatRupiah(item.totalBalance)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 print:border-none print:p-0">
        {/* Printable Formal Header */}
        <div className="text-center pb-4 mb-4 border-b-2 border-slate-900 hidden print:block">
          <h2 className="text-base font-bold uppercase">{settings.schoolName}</h2>
          <p className="text-xs">{settings.address} · NPSN: {settings.npsn}</p>
          <h3 className="text-sm font-bold uppercase mt-2">REKAPITULASI TABUNGAN PER KELAS</h3>
          <p className="text-xs">Tahun Ajaran: {settings.activeAcademicYear} | Tanggal: {formatIndoDate(new Date())}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider print:bg-slate-100">
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4 text-center">Jumlah Siswa</th>
                <th className="py-3 px-4 text-center">Siswa Aktif</th>
                <th className="py-3 px-4 text-right">Total Saldo (Rp)</th>
                <th className="py-3 px-4 text-right">Total Setoran (Rp)</th>
                <th className="py-3 px-4 text-right">Total Penarikan (Rp)</th>
                <th className="py-3 px-4 text-center">Total Transaksi</th>
                <th className="py-3 px-4 text-right">Rata-rata/Siswa (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classDataList.map((c) => (
                <tr key={c.class} className="hover:bg-slate-50 print:border-b print:border-slate-200">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center text-xs font-bold font-mono">
                      {c.class}
                    </span>
                    <span>Kelas {c.class}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-800">{c.studentCount}</td>
                  <td className="py-3 px-4 text-center font-mono text-emerald-700 font-semibold">{c.activeStudentCount}</td>
                  <td className="py-3 px-4 font-mono font-bold tabular-nums text-right text-emerald-800 text-sm">
                    {formatRupiah(c.totalBalance)}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600">
                    {formatRupiah(c.totalDeposit)}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600">
                    {formatRupiah(c.totalWithdrawal)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-800">{c.totalTransactions}</td>
                  <td className="py-3 px-4 font-mono tabular-nums text-right font-medium text-slate-700">
                    {formatRupiah(c.avgBalance)}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-xs text-slate-900">
                <td className="py-3.5 px-4 uppercase">TOTAL KESELURUHAN</td>
                <td className="py-3.5 px-4 text-center font-mono">{grandTotals.studentCount}</td>
                <td className="py-3.5 px-4 text-center font-mono text-emerald-800">{grandTotals.activeCount}</td>
                <td className="py-3.5 px-4 font-mono tabular-nums text-right text-sm text-emerald-900">
                  {formatRupiah(grandTotals.totalBalance)}
                </td>
                <td className="py-3.5 px-4 font-mono tabular-nums text-right text-emerald-800">
                  {formatRupiah(grandTotals.totalDeposit)}
                </td>
                <td className="py-3.5 px-4 font-mono tabular-nums text-right text-amber-800">
                  {formatRupiah(grandTotals.totalWithdrawal)}
                </td>
                <td className="py-3.5 px-4 text-center font-mono">{grandTotals.totalTransactions}</td>
                <td className="py-3.5 px-4 font-mono tabular-nums text-right">
                  {formatRupiah(
                    grandTotals.studentCount > 0
                      ? Math.round(grandTotals.totalBalance / grandTotals.studentCount)
                      : 0
                  )}
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
