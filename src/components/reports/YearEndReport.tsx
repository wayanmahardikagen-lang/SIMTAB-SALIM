import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndoDate, formatRupiah } from '../../utils/format';
import { calculateChampions } from '../../utils/storage';
import {
  CalendarCheck,
  FileDown,
  Printer,
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const YearEndReport: React.FC = () => {
  const { students, transactions, settings, academicYears } = useApp();

  const [selectedYear, setSelectedYear] = useState<string>(settings.activeAcademicYear);

  // Filter transactions for this academic year
  const yearTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.academicYear === selectedYear && t.status === 'VALID'
    );
  }, [transactions, selectedYear]);

  // Overall KPIs
  const totalStudents = students.length;
  const activeSavers = new Set(
    yearTransactions.filter((t) => t.type === 'SETORAN').map((t) => t.studentId)
  ).size;

  const totalYearDeposit = yearTransactions
    .filter((t) => t.type === 'SETORAN')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalYearWithdrawal = yearTransactions
    .filter((t) => t.type === 'PENARIKAN')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalYearBalance = students.reduce((acc, s) => acc + s.balance, 0);
  const totalYearTransactions = yearTransactions.length;

  // Student year-end list with rankings
  const champions = useMemo(() => {
    return calculateChampions(students, yearTransactions);
  }, [students, yearTransactions]);

  const championRankMap = useMemo(() => {
    const map = new Map<string, number>();
    champions.forEach((c) => map.set(c.studentId, c.rank));
    return map;
  }, [champions]);

  const reportRows = useMemo(() => {
    return students.map((student) => {
      const studentTrx = yearTransactions.filter((t) => t.studentId === student.id);
      const deposits = studentTrx
        .filter((t) => t.type === 'SETORAN')
        .reduce((a, b) => a + b.amount, 0);
      const withdrawals = studentTrx
        .filter((t) => t.type === 'PENARIKAN')
        .reduce((a, b) => a + b.amount, 0);

      // Distinct saving days
      const daysCount = new Set(
        studentTrx.filter((t) => t.type === 'SETORAN').map((t) => t.date)
      ).size;

      const rank = championRankMap.get(student.id) || 0;

      return {
        studentId: student.id,
        nis: student.nis,
        name: student.name,
        class: student.class,
        initialBalanceYear: 0,
        totalDeposit: deposits,
        totalWithdrawal: withdrawals,
        finalBalanceYear: student.balance,
        savingDays: daysCount,
        rank,
      };
    });
  }, [students, yearTransactions, championRankMap]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const rows = [
      [settings.schoolName.toUpperCase()],
      [`LAPORAN PERTANGGUNGJAWABAN AKHIR TAHUN TABUNGAN SISWA`],
      [`Tahun Ajaran: ${selectedYear}`],
      [`Tanggal Cetak: ${formatIndoDate(new Date())}`],
      [],
      [
        'No',
        'NIS',
        'Nama Siswa',
        'Kelas',
        'Saldo Awal Tahun (Rp)',
        'Total Setoran Setahun (Rp)',
        'Total Penarikan Setahun (Rp)',
        'Saldo Akhir Tahun (Rp)',
        'Hari Menabung',
        'Peringkat Menabung'
      ]
    ];

    reportRows.forEach((r, idx) => {
      rows.push([
        (idx + 1).toString(),
        r.nis,
        r.name,
        r.class,
        r.initialBalanceYear as any,
        r.totalDeposit as any,
        r.totalWithdrawal as any,
        r.finalBalanceYear as any,
        r.savingDays as any,
        r.rank ? `#${r.rank}` : '-'
      ]);
    });

    rows.push([]);
    rows.push([
      '',
      'TOTAL KESELURUHAN',
      '',
      '',
      0 as any,
      totalYearDeposit as any,
      totalYearWithdrawal as any,
      totalYearBalance as any,
      '',
      ''
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 25 },
      { wch: 10 },
      { wch: 20 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 16 },
      { wch: 18 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Akhir Tahun');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Akhir_Tahun_${selectedYear.replace(/\//g, '-')}.xlsx`;
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
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Laporan Akhir Tahun Tabungan</h2>
            <p className="text-xs text-slate-500">
              Evaluasi tahunan keuangan tabungan siswa untuk laporan pertanggungjawaban sekolah
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Laporan</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      {/* Year Selector */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
          Tahun Ajaran:
        </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
        >
          {academicYears.map((ay) => (
            <option key={ay.id} value={ay.name}>
              {ay.name} {ay.isActive ? '(Aktif Saat Ini)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Summary Cards (Section 13) */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Jumlah Siswa
          </span>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{totalStudents}</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Siswa Aktif Menabung
          </span>
          <div className="text-lg font-bold font-mono text-indigo-700 mt-0.5">{activeSavers}</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Setoran 1 Tahun
          </span>
          <div className="text-base font-bold font-mono text-emerald-800 mt-0.5 tabular-nums">
            {formatRupiah(totalYearDeposit)}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Penarikan 1 Tahun
          </span>
          <div className="text-base font-bold font-mono text-amber-800 mt-0.5 tabular-nums">
            {formatRupiah(totalYearWithdrawal)}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Saldo Akhir Siswa
          </span>
          <div className="text-base font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
            {formatRupiah(totalYearBalance)}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Transaksi
          </span>
          <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">
            {totalYearTransactions}
          </div>
        </div>
      </div>

      {/* Main Table Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 print:border-none print:p-0">
        {/* Printable Formal Letterhead */}
        <div className="text-center pb-4 mb-4 border-b-2 border-slate-900 hidden print:block">
          <h2 className="text-base font-bold uppercase">{settings.schoolName}</h2>
          <p className="text-xs">{settings.address} · NPSN: {settings.npsn}</p>
          <h3 className="text-sm font-bold uppercase mt-2">
            LAPORAN PERTANGGUNGJAWABAN AKHIR TAHUN TABUNGAN SISWA
          </h3>
          <p className="text-xs">Tahun Ajaran: {selectedYear} | Tanggal Cetak: {formatIndoDate(new Date())}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider print:bg-slate-100">
                <th className="py-2.5 px-3 text-center">No</th>
                <th className="py-2.5 px-3">Nama Siswa</th>
                <th className="py-2.5 px-3 text-center">Kelas</th>
                <th className="py-2.5 px-3 text-right">Saldo Awal Tahun</th>
                <th className="py-2.5 px-3 text-right">Total Setoran</th>
                <th className="py-2.5 px-3 text-right">Total Penarikan</th>
                <th className="py-2.5 px-3 text-right">Saldo Akhir Tahun</th>
                <th className="py-2.5 px-3 text-center">Hari Menabung</th>
                <th className="py-2.5 px-3 text-center">Peringkat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportRows.map((r, idx) => (
                <tr key={r.studentId} className="hover:bg-slate-50 print:border-b print:border-slate-200">
                  <td className="py-2 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-3 font-bold text-slate-900">
                    {r.name}
                    <span className="text-[10px] text-slate-400 font-mono ml-1">({r.nis})</span>
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600">Kelas {r.class}</td>
                  <td className="py-2 px-3 font-mono tabular-nums text-right text-slate-500">
                    {formatRupiah(r.initialBalanceYear)}
                  </td>
                  <td className="py-2 px-3 font-mono tabular-nums text-right text-emerald-800">
                    {formatRupiah(r.totalDeposit)}
                  </td>
                  <td className="py-2 px-3 font-mono tabular-nums text-right text-amber-800">
                    {formatRupiah(r.totalWithdrawal)}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold tabular-nums text-right text-slate-900">
                    {formatRupiah(r.finalBalanceYear)}
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-indigo-700">
                    {r.savingDays} hari
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        r.rank === 1
                          ? 'bg-amber-100 text-amber-900'
                          : r.rank === 2
                          ? 'bg-slate-100 text-slate-800'
                          : r.rank === 3
                          ? 'bg-orange-100 text-orange-900'
                          : 'text-slate-600'
                      }`}
                    >
                      #{r.rank}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-xs text-slate-900">
                <td colSpan={3} className="py-3 px-3 uppercase text-center">
                  TOTAL KESELURUHAN TAHUN AJARAN {selectedYear}
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-right">Rp 0</td>
                <td className="py-3 px-3 font-mono tabular-nums text-right text-emerald-800">
                  {formatRupiah(totalYearDeposit)}
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-right text-amber-800">
                  {formatRupiah(totalYearWithdrawal)}
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-right text-slate-900 text-sm">
                  {formatRupiah(totalYearBalance)}
                </td>
                <td className="py-3 px-3 text-center">-</td>
                <td className="py-3 px-3 text-center">-</td>
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
