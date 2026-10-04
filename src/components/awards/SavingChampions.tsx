import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndoDate, formatRupiah, getTodayDateString } from '../../utils/format';
import { calculateChampions } from '../../utils/storage';
import { exportChampionsToExcel } from '../../utils/excel';
import { ChampionRecord } from '../../types';
import { CertificatePrint } from './CertificatePrint';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Medal,
  Calendar,
  FileDown,
  Printer,
  Sparkles,
  Info,
  CalendarDays
} from 'lucide-react';

export const SavingChampions: React.FC = () => {
  const { students, transactions, settings, setSelectedStudentForDetail } = useApp();

  const [periodPreset, setPeriodPreset] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedChampionForCert, setSelectedChampionForCert] = useState<ChampionRecord | null>(null);

  // Trigger confetti once on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback if canvas not available
    }
  }, []);

  // Compute dates based on period
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const today = new Date();
    const todayStr = getTodayDateString();

    if (periodPreset === 'this_month') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      return { startDate: start, endDate: todayStr, periodLabel: `Bulan Ini (${formatIndoDate(start)} s/d sekarang)` };
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

    return {
      startDate: undefined,
      endDate: undefined,
      periodLabel: `Tahun Ajaran ${settings.activeAcademicYear}`,
    };
  }, [periodPreset, customStartDate, customEndDate, settings.activeAcademicYear]);

  // Calculate champions according to Section 12 & 31
  const champions = useMemo(() => {
    return calculateChampions(students, transactions, startDate, endDate);
  }, [students, transactions, startDate, endDate]);

  const top3 = champions.slice(0, 3);

  const handleExport = () => {
    exportChampionsToExcel(champions, periodLabel, settings);
  };

  const handlePrintCertificate = (champ: ChampionRecord) => {
    setSelectedChampionForCert(champ);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Peringkat Juara Menabung Siswa</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <p className="text-xs text-slate-500">
              Penghargaan siswa teladan berdasarkan <strong>konsistensi & jumlah hari menabung</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FileDown className="w-4 h-4 text-emerald-600" />
          <span>Export Ranking Excel</span>
        </button>
      </div>

      {/* Rules Notice Box (Section 12 & 31) */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Kriteria Adil Juara Menabung:</strong> Peringkat ditentukan oleh{' '}
          <strong>Jumlah Hari Menabung</strong> (bukan hanya besar nominal). Jika siswa menabung beberapa kali pada tanggal yang sama, sistem tetap menghitungnya secara adil sebagai <strong>1 hari menabung</strong>. Jika jumlah hari sama, baru dibandingkan dari total setoran dan tanggal setoran pertama.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">
            Periode Penilaian:
          </span>
          {[
            { id: 'all', label: 'Tahun Ajaran Penuh' },
            { id: 'this_month', label: 'Bulan Ini' },
            { id: 'semester_1', label: 'Semester 1' },
            { id: 'semester_2', label: 'Semester 2' },
            { id: 'custom', label: 'Rentang Tanggal' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriodPreset(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                periodPreset === item.id
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {periodPreset === 'custom' && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 max-w-sm">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-1/2 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200"
            />
            <span className="text-xs text-slate-400">-</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-1/2 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200"
            />
          </div>
        )}
      </div>

      {/* Podium Top 3 Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((champ, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            return (
              <div
                key={champ.studentId}
                className={`bg-white rounded-2xl border p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md ${
                  isFirst
                    ? 'border-amber-300 ring-2 ring-amber-400/20 order-1 md:order-2 md:-translate-y-2'
                    : isSecond
                    ? 'border-slate-300 order-2 md:order-1'
                    : 'border-orange-200 order-3 md:order-3'
                }`}
              >
                {/* Ribbon Tag */}
                <div
                  className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[11px] font-black uppercase tracking-wider ${
                    isFirst
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : isSecond
                      ? 'bg-slate-300 text-slate-800'
                      : 'bg-orange-300 text-orange-950'
                  }`}
                >
                  Juara {champ.rank}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                      isFirst
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : isSecond
                        ? 'bg-slate-100 text-slate-700 border border-slate-300'
                        : 'bg-orange-100 text-orange-800 border border-orange-300'
                    }`}
                  >
                    <Trophy className={`w-6 h-6 ${isFirst ? 'text-amber-600' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {champ.studentName}
                    </h3>
                    <p className="text-xs text-slate-500">Kelas {champ.class}</p>
                  </div>
                </div>

                {/* Main Stat */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                      Hari Menabung:
                    </span>
                    <strong className="font-mono text-indigo-700 text-sm">{champ.savingDaysCount} Hari</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Setoran:</span>
                    <strong className="font-mono text-emerald-700">{formatRupiah(champ.totalDeposit)}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Saldo Akhir:</span>
                    <strong className="font-mono text-slate-900">{formatRupiah(champ.finalBalance)}</strong>
                  </div>
                </div>

                {/* Print Certificate Button */}
                <button
                  onClick={() => handlePrintCertificate(champ)}
                  className="w-full py-2 px-3 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Cetak Sertifikat / Piagam</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Rankings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Daftar Lengkap Peringkat Siswa ({champions.length} Siswa)
          </h3>
          <span className="text-xs text-slate-500">Periode: {periodLabel}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 text-center w-14">Rank</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4 text-center">Jumlah Hari Menabung</th>
                <th className="py-3 px-4 text-right">Total Setoran</th>
                <th className="py-3 px-4 text-right">Total Penarikan</th>
                <th className="py-3 px-4 text-right">Saldo Tabungan</th>
                <th className="py-3 px-4">Setoran Pertama</th>
                <th className="py-3 px-4 text-center">Piagam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {champions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Belum ada data setoran tabungan pada periode ini.
                  </td>
                </tr>
              ) : (
                champions.map((champ) => {
                  const isTop3 = champ.rank <= 3;
                  return (
                    <tr
                      key={champ.studentId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        champ.rank === 1
                          ? 'bg-amber-50/20'
                          : champ.rank === 2
                          ? 'bg-slate-50/40'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs font-bold ${
                            champ.rank === 1
                              ? 'bg-amber-400 text-slate-950'
                              : champ.rank === 2
                              ? 'bg-slate-300 text-slate-900'
                              : champ.rank === 3
                              ? 'bg-orange-300 text-orange-950'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {champ.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {champ.studentName}
                        {isTop3 && (
                          <Medal className="w-3.5 h-3.5 inline ml-1.5 text-amber-500" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">Kelas {champ.class}</td>
                      <td className="py-3 px-4 text-center font-bold font-mono text-indigo-700 text-sm">
                        {champ.savingDaysCount} <span className="text-[11px] font-normal text-slate-400">Hari</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold tabular-nums text-right text-emerald-800">
                        {formatRupiah(champ.totalDeposit)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-500">
                        {formatRupiah(champ.totalWithdrawal)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold tabular-nums text-right text-slate-900">
                        {formatRupiah(champ.finalBalance)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {champ.firstDepositDate ? formatIndoDate(champ.firstDepositDate) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handlePrintCertificate(champ)}
                          title="Cetak Piagam Juara"
                          className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Piagam</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificatePrint
        champion={selectedChampionForCert}
        periodLabel={periodLabel}
        settings={settings}
        onClose={() => setSelectedChampionForCert(null)}
      />
    </div>
  );
};
