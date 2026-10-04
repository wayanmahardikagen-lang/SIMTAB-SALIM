import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  exportStudentsToExcel,
  exportTransactionsToExcel,
  exportRecapToExcel,
  exportClassRecapToExcel,
  exportChampionsToExcel
} from '../../utils/excel';
import { calculateChampions, calculateClassRecaps } from '../../utils/storage';
import { formatIndoDate, formatRupiah } from '../../utils/format';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  Users,
  History,
  BarChart3,
  School,
  Trophy,
  CalendarCheck,
  Database
} from 'lucide-react';

export const ExportHub: React.FC = () => {
  const { students, transactions, settings, academicYears, distributions } = useApp();

  const handleExportStudents = () => {
    exportStudentsToExcel(students, settings);
  };

  const handleExportTransactions = () => {
    exportTransactionsToExcel(transactions, settings, 'Semua Transaksi');
  };

  const handleExportRecap = () => {
    const recapRows = students.map((s) => {
      const sTrx = transactions.filter((t) => t.studentId === s.id && t.status === 'VALID');
      const dep = sTrx.filter((t) => t.type === 'SETORAN').reduce((a, b) => a + b.amount, 0);
      const wit = sTrx.filter((t) => t.type === 'PENARIKAN').reduce((a, b) => a + b.amount, 0);
      const days = new Set(sTrx.filter((t) => t.type === 'SETORAN').map((t) => t.date)).size;

      return {
        studentName: s.name,
        class: s.class,
        initialBalance: 0,
        totalDeposit: dep,
        totalWithdrawal: wit,
        finalBalance: s.balance,
        transactionCount: sTrx.length,
        savingDaysCount: days,
      };
    });
    exportRecapToExcel(recapRows, `Tahun Ajaran ${settings.activeAcademicYear}`, settings);
  };

  const handleExportClasses = () => {
    const rawMap = calculateClassRecaps(students, transactions);
    const classes = ['1', '2', '3', '4', '5', '6'].map((cls) => {
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
    exportClassRecapToExcel(classes, settings);
  };

  const handleExportChampions = () => {
    const champs = calculateChampions(students, transactions);
    exportChampionsToExcel(champs, `Tahun Ajaran ${settings.activeAcademicYear}`, settings);
  };

  // Full System Multi-Sheet Master Workbook Export
  const handleExportMasterBackup = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Profil Sekolah
    const infoRows = [
      ['PROFIL SISTEM TABUNGAN'],
      ['Nama Sekolah', settings.schoolName],
      ['NPSN', settings.npsn],
      ['Alamat', settings.address],
      ['Kepala Sekolah', settings.headmasterName],
      ['NIP Kepala Sekolah', settings.headmasterNip],
      ['Petugas Tabungan', settings.treasurerName],
      ['NIP Petugas', settings.treasurerNip],
      ['Tahun Ajaran Aktif', settings.activeAcademicYear],
      ['Tanggal Export', formatIndoDate(new Date())]
    ];
    const wsInfo = XLSX.utils.aoa_to_sheet(infoRows);
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Info Sekolah');

    // Sheet 2: Data Siswa
    const studentRows = [
      ['NIS', 'NISN', 'Nama Siswa', 'Kelas', 'L/P', 'Orang Tua', 'No. HP', 'Status', 'Saldo Saat Ini']
    ];
    students.forEach((s) => {
      studentRows.push([
        s.nis,
        s.nisn || '',
        s.name,
        s.class,
        s.gender,
        s.parentName,
        s.parentPhone || '',
        s.status,
        s.balance as any
      ]);
    });
    const wsStudents = XLSX.utils.aoa_to_sheet(studentRows);
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Data Siswa');

    // Sheet 3: Transaksi
    const trxRows = [
      ['No. Transaksi', 'Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Jenis', 'Nominal', 'Saldo Sebelum', 'Saldo Sesudah', 'Petugas', 'Keterangan', 'Status', 'Tahun Ajaran']
    ];
    transactions.forEach((t) => {
      trxRows.push([
        t.id,
        t.date,
        t.studentId,
        t.studentName,
        t.class,
        t.type,
        t.amount as any,
        t.previousBalance as any,
        t.newBalance as any,
        t.createdBy,
        t.description,
        t.status,
        t.academicYear
      ]);
    });
    const wsTrx = XLSX.utils.aoa_to_sheet(trxRows);
    XLSX.utils.book_append_sheet(wb, wsTrx, 'Riwayat Transaksi');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MASTER_BACKUP_TABUNGAN_${settings.schoolName.replace(/\s+/g, '_')}_${formatIndoDate(new Date()).replace(/\s+/g, '_')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  const exportCards = [
    {
      title: 'Data Siswa',
      desc: 'Unduh seluruh profil siswa, nomor induk, status, dan saldo tabungan terkini.',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      action: handleExportStudents,
      label: 'Unduh Data Siswa (.xlsx)',
    },
    {
      title: 'Semua Transaksi',
      desc: 'Riwayat mutasi setoran dan penarikan lengkap beserta nomor bukti dan petugas.',
      icon: <History className="w-5 h-5 text-emerald-600" />,
      action: handleExportTransactions,
      label: 'Unduh Riwayat Transaksi (.xlsx)',
    },
    {
      title: 'Rekapitulasi Tabungan',
      desc: 'Laporan saldo awal, total setoran, penarikan, saldo akhir, dan frekuensi menabung.',
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
      action: handleExportRecap,
      label: 'Unduh Rekap Tabungan (.xlsx)',
    },
    {
      title: 'Rekap per Kelas',
      desc: 'Perbandingan total saldo dan partisipasi menabung per rombongan belajar (Kelas 1 - 6).',
      icon: <School className="w-5 h-5 text-teal-600" />,
      action: handleExportClasses,
      label: 'Unduh Rekap Kelas (.xlsx)',
    },
    {
      title: 'Ranking Juara Menabung',
      desc: 'Peringkat siswa paling rajin menabung berdasarkan akumulasi hari menabung dan setoran.',
      icon: <Trophy className="w-5 h-5 text-amber-500" />,
      action: handleExportChampions,
      label: 'Unduh Juara Menabung (.xlsx)',
    },
    {
      title: 'Master Backup Keseluruhan',
      desc: 'File spreadsheet komprehensif berisi seluruh lembar kerja (Info, Siswa, Transaksi).',
      icon: <Database className="w-5 h-5 text-purple-600" />,
      action: handleExportMasterBackup,
      label: 'Unduh Master Backup (.xlsx)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Pusat Export Laporan Excel</h2>
            <p className="text-xs text-slate-500">
              Format dokumen Excel resmi sekolah dengan kop, kolom tertata rapi, dan rumus otomatis
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                {card.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
            </div>

            <button
              onClick={card.action}
              className="mt-5 w-full py-2.5 px-4 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>{card.label}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
