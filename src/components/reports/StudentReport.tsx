import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { formatIndoDate, formatRupiah } from '../../utils/format';
import { calculateSavingDays } from '../../utils/storage';
import { exportSingleStudentToExcel } from '../../utils/excel';
import {
  FileSpreadsheet,
  Printer,
  FileDown,
  Search,
  User
} from 'lucide-react';

export const StudentReport: React.FC = () => {
  const { students, transactions, settings } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.length > 0 ? students[0].id : ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0] || null;
  }, [students, selectedStudentId]);

  const studentTransactions = useMemo(() => {
    if (!selectedStudent) return [];
    return transactions
      .filter((t) => t.studentId === selectedStudent.id && t.status === 'VALID')
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [transactions, selectedStudent]);

  const stats = useMemo(() => {
    if (!selectedStudent) {
      return {
        initialBalance: 0,
        totalDeposit: 0,
        totalWithdrawal: 0,
        finalBalance: 0,
        savingDaysCount: 0,
      };
    }
    const daysStats = calculateSavingDays(selectedStudent.id, transactions);
    return {
      initialBalance: 0,
      totalDeposit: daysStats.totalDeposit,
      totalWithdrawal: daysStats.totalWithdrawal,
      finalBalance: selectedStudent.balance,
      savingDaysCount: daysStats.daysCount,
    };
  }, [selectedStudent, transactions]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!selectedStudent) return;
    exportSingleStudentToExcel(selectedStudent, studentTransactions, settings, stats);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Laporan Rekening Tabungan Siswa</h2>
          <p className="text-xs text-slate-500">
            Cetak rekapitulasi mutasi dan saldo perorangan siswa dengan kop resmi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Dokumen</span>
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

      {/* Student Selector Card */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
          Pilih Siswa:
        </label>
        <select
          value={selectedStudent?.id || ''}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full sm:max-w-md px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-medium"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (NIS: {s.nis}) - Kelas {s.class}
            </option>
          ))}
        </select>
      </div>

      {/* Formal Printable Document Sheet */}
      {selectedStudent && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 sm:p-12 print:border-none print:p-0 max-w-4xl mx-auto">
          {/* Formal School Letterhead (Kop Surat Sekolah) */}
          <div className="pb-4 mb-6 border-b-2 border-slate-900 flex items-center gap-4">
            <div className="w-20 h-20 shrink-0">
              <img
                src={settings.logoUrl}
                alt="Logo Sekolah"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                PEMERINTAH KABUPATEN JEMBRANA · DINAS PENDIDIKAN
              </p>
              <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                {settings.schoolName}
              </h1>
              <p className="text-xs text-slate-600">{settings.address}</p>
              <p className="text-[11px] text-slate-500">NPSN: {settings.npsn} | Email: sdn1loloantimur@sekolah.id</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 underline">
              LAPORAN MUTASI TABUNGAN SISWA
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Tahun Ajaran: {settings.activeAcademicYear}</p>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-xs mb-6 print:bg-white print:border-slate-300">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-32 text-slate-500">Nama Siswa</span>
                <span className="font-bold text-slate-900">: {selectedStudent.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500">NIS / NISN</span>
                <span className="font-mono text-slate-800">
                  : {selectedStudent.nis} / {selectedStudent.nisn || '-'}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500">Tingkat Kelas</span>
                <span className="text-slate-800">: Kelas {selectedStudent.class}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-32 text-slate-500">Nama Orang Tua</span>
                <span className="text-slate-800">: {selectedStudent.parentName || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500">Total Hari Menabung</span>
                <span className="font-bold text-indigo-700">: {stats.savingDaysCount} Hari</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500">Saldo Akhir Saat Ini</span>
                <span className="font-mono font-bold text-emerald-800">: {formatRupiah(stats.finalBalance)}</span>
              </div>
            </div>
          </div>

          {/* Transaction History Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Rincian Transaksi Tabungan
            </h4>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-[11px] font-bold text-slate-700">
                  <th className="py-2 px-3 text-center w-10">No</th>
                  <th className="py-2 px-3">Tanggal</th>
                  <th className="py-2 px-3">Jenis Transaksi</th>
                  <th className="py-2 px-3">Keterangan</th>
                  <th className="py-2 px-3 text-right">Setoran (Rp)</th>
                  <th className="py-2 px-3 text-right">Penarikan (Rp)</th>
                  <th className="py-2 px-3 text-right">Saldo (Rp)</th>
                  <th className="py-2 px-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                      Belum ada transaksi yang tercatat.
                    </td>
                  </tr>
                ) : (
                  studentTransactions.map((trx, idx) => (
                    <tr key={trx.id}>
                      <td className="py-2 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 whitespace-nowrap text-slate-700">{formatIndoDate(trx.date)}</td>
                      <td className="py-2 px-3 font-semibold">
                        <span className={trx.type === 'SETORAN' ? 'text-emerald-800' : 'text-amber-800'}>
                          {trx.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{trx.description || '-'}</td>
                      <td className="py-2 px-3 font-mono tabular-nums text-right text-slate-800">
                        {trx.type === 'SETORAN' ? formatRupiah(trx.amount) : '-'}
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums text-right text-slate-800">
                        {trx.type === 'PENARIKAN' ? formatRupiah(trx.amount) : '-'}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold tabular-nums text-right text-slate-900">
                        {formatRupiah(trx.newBalance)}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{trx.createdBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-xs">
                  <td colSpan={4} className="py-2.5 px-3 uppercase text-center">
                    TOTAL KESELURUHAN
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums text-right text-emerald-800">
                    {formatRupiah(stats.totalDeposit)}
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums text-right text-amber-800">
                    {formatRupiah(stats.totalWithdrawal)}
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums text-right text-slate-900 text-sm">
                    {formatRupiah(stats.finalBalance)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center print-avoid-break">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Sekolah {settings.schoolName}</p>
              <div className="h-20"></div>
              <p className="font-bold underline">{settings.headmasterName}</p>
              <p className="text-[10px] text-slate-500">NIP. {settings.headmasterNip}</p>
            </div>

            <div>
              <p>Loloan Timur, {formatIndoDate(new Date())}</p>
              <p className="font-bold">Petugas Tabungan Sekolah</p>
              <div className="h-20"></div>
              <p className="font-bold underline">{settings.treasurerName}</p>
              <p className="text-[10px] text-slate-500">NIP. {settings.treasurerNip}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
