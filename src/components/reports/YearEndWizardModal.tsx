import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatIndoDate } from '../../utils/format';
import { calculateChampions } from '../../utils/storage';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  CalendarCheck,
  Printer
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface YearEndWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const YearEndWizardModal: React.FC<YearEndWizardModalProps> = ({ isOpen, onClose }) => {
  const { students, transactions, settings, academicYears } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<string>(settings.activeAcademicYear);

  if (!isOpen) return null;

  // Filter transactions for chosen year
  const yearTrx = transactions.filter(
    (t) => t.academicYear === selectedYear && t.status === 'VALID'
  );

  const champions = calculateChampions(students, yearTrx);
  const champMap = new Map(champions.map((c) => [c.studentId, c.rank]));

  const summaryRows = students.map((s) => {
    const sTrx = yearTrx.filter((t) => t.studentId === s.id);
    const dep = sTrx.filter((t) => t.type === 'SETORAN').reduce((a, b) => a + b.amount, 0);
    const wit = sTrx.filter((t) => t.type === 'PENARIKAN').reduce((a, b) => a + b.amount, 0);
    const days = new Set(sTrx.filter((t) => t.type === 'SETORAN').map((t) => t.date)).size;
    const rank = champMap.get(s.id) || '-';

    return {
      studentId: s.id,
      nis: s.nis,
      name: s.name,
      class: s.class,
      initialBalance: 0,
      totalDeposit: dep,
      totalWithdrawal: wit,
      finalBalance: s.balance,
      savingDays: days,
      rank,
    };
  });

  const totalFunds = summaryRows.reduce((a, b) => a + b.finalBalance, 0);

  const handleExportExcel = () => {
    const rows = [
      [settings.schoolName.toUpperCase()],
      [`LAPORAN TUTUP BUKU AKHIR TAHUN AJARAN ${selectedYear}`],
      [`Tanggal Cetak: ${formatIndoDate(new Date())}`],
      [],
      [
        'No',
        'NIS',
        'Nama Siswa',
        'Kelas',
        'Saldo Awal (Rp)',
        'Total Setoran (Rp)',
        'Total Penarikan (Rp)',
        'Saldo Akhir (Rp)',
        'Hari Menabung',
        'Peringkat'
      ]
    ];

    summaryRows.forEach((r, idx) => {
      rows.push([
        (idx + 1).toString(),
        r.nis,
        r.name,
        r.class,
        r.initialBalance as any,
        r.totalDeposit as any,
        r.totalWithdrawal as any,
        r.finalBalance as any,
        r.savingDays as any,
        typeof r.rank === 'number' ? `#${r.rank}` : '-'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 24 },
      { wch: 10 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 16 },
      { wch: 14 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tutup Buku Akhir Tahun');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tutup_Buku_SIMTAB_${selectedYear.replace(/\//g, '-')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Wizard Laporan Akhir Tahun Tabungan Siswa
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Tracker (Requirement 20) */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}
            >
              1
            </span>
            <span className={currentStep === 1 ? 'font-bold text-slate-900' : 'text-slate-500'}>
              Pilih Tahun
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}
            >
              2
            </span>
            <span className={currentStep === 2 ? 'font-bold text-slate-900' : 'text-slate-500'}>
              Kalkulasi Saldo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}
            >
              3
            </span>
            <span className={currentStep === 3 ? 'font-bold text-slate-900' : 'text-slate-500'}>
              Pratinjau Hasil
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep >= 4 ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}
            >
              4
            </span>
            <span className={currentStep === 4 ? 'font-bold text-slate-900' : 'text-slate-500'}>
              Export Excel
            </span>
          </div>
        </div>

        {/* Wizard Steps Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <div className="space-y-4 max-w-md mx-auto text-center py-6">
              <h4 className="text-base font-bold text-slate-900">
                Langkah 1: Pilih Tahun Ajaran yang Akan Ditutup
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilih periode tahun ajaran yang ingin direkapitulasi secara menyeluruh.
              </p>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-white"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.name}>
                    {ay.name} {ay.isActive ? '(Aktif Saat Ini)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 max-w-md mx-auto text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">
                Langkah 2: Sistem Menghitung Saldo Seluruh Siswa
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sistem telah merekap mutasi dari {yearTrx.length} transaksi di Tahun Ajaran {selectedYear} untuk total {students.length} siswa.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total Siswa:</span>
                  <strong>{students.length} Siswa</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Saldo Akhir Seluruh Siswa:</span>
                  <strong className="text-emerald-700 font-mono">{formatRupiah(totalFunds)}</strong>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Langkah 3: Pratinjau Rekapitulasi Akhir Tahun
                </h4>
                <span className="text-xs text-slate-500">Tahun Ajaran: {selectedYear}</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <tr>
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">Nama</th>
                      <th className="py-2 px-3">Kelas</th>
                      <th className="py-2 px-3 text-right">Saldo Akhir</th>
                      <th className="py-2 px-3 text-center">Hari Menabung</th>
                      <th className="py-2 px-3 text-center">Peringkat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summaryRows.map((r, i) => (
                      <tr key={r.studentId} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{r.name}</td>
                        <td className="py-2 px-3 text-slate-600">Kelas {r.class}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-800 text-right">
                          {formatRupiah(r.finalBalance)}
                        </td>
                        <td className="py-2 px-3 text-center text-indigo-700 font-bold">
                          {r.savingDays} hari
                        </td>
                        <td className="py-2 px-3 text-center font-bold">
                          {typeof r.rank === 'number' ? `#${r.rank}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 max-w-md mx-auto text-center py-6">
              <FileSpreadsheet className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">
                Langkah 4: Laporan Siap Diunduh ke Excel
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rekapitulasi tutup buku akhir tahun ajaran {selectedYear} siap dicetak atau diunduh dalam format Excel (.xlsx) resmi.
              </p>
              <button
                type="button"
                onClick={handleExportExcel}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Unduh Laporan Excel (.xlsx)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s + 1)}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Lanjut ke Langkah {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
            >
              Selesai & Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
