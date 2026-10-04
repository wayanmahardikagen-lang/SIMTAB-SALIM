import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndoDate, formatRupiah, getTodayDateString } from '../../utils/format';
import { calculateChampions, calculateClassRecaps } from '../../utils/storage';
import {
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Trophy,
  BarChart3,
  Layers,
  FileSpreadsheet,
  FileUp,
  FileDown,
  Printer,
  Calendar,
  AlertCircle,
  Camera,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  Eye,
  Award,
  Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    students,
    transactions,
    setActiveTab,
    setReceiptModalTrx,
    setSelectedStudentForDetail,
    setIsQrScannerOpen,
    isDemo,
    resetDataToDemo,
    clearDataClean,
    settings,
    currentUser,
  } = useApp();

  const isKepalaSekolah = currentUser?.role === 'KEPALA_SEKOLAH';
  const todayStr = getTodayDateString();

  // Primary Metrics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Aktif').length;
  const totalBalance = students.reduce((acc, s) => acc + s.balance, 0);

  const todayTrx = transactions.filter((t) => t.date === todayStr && t.status === 'VALID');
  const todayDeposits = todayTrx.filter((t) => t.type === 'SETORAN');
  const todayWithdrawals = todayTrx.filter((t) => t.type === 'PENARIKAN');

  const todayDepositTotal = todayDeposits.reduce((acc, t) => acc + t.amount, 0);
  const todayWithdrawalTotal = todayWithdrawals.reduce((acc, t) => acc + t.amount, 0);
  const todayTrxCount = todayTrx.length;
  const todaySavingStudentsCount = new Set(todayDeposits.map((t) => t.studentId)).size;

  // Year to Date stats
  const yearTrx = transactions.filter(
    (t) => t.academicYear === settings.activeAcademicYear && t.status === 'VALID'
  );
  const totalYearDeposit = yearTrx
    .filter((t) => t.type === 'SETORAN')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalYearWithdrawal = yearTrx
    .filter((t) => t.type === 'PENARIKAN')
    .reduce((acc, t) => acc + t.amount, 0);
  const avgStudentBalance = totalStudents > 0 ? Math.round(totalBalance / totalStudents) : 0;

  // Top 10 Savers (Requirement 14 for Kepala Sekolah)
  const top10Champions = useMemo(() => {
    return calculateChampions(students, transactions).slice(0, 10);
  }, [students, transactions]);

  // Class balances
  const classBalances = useMemo(() => {
    const rawMap = calculateClassRecaps(students, transactions);
    return ['1', '2', '3', '4', '5', '6'].map((cls) => ({
      class: cls,
      balance: rawMap[cls]?.totalBalance || 0,
      students: rawMap[cls]?.studentCount || 0,
    }));
  }, [students, transactions]);

  // Recent 10 transactions
  const recentTransactions = transactions.slice(0, 10);

  // Monthly stats breakdown
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyData: { month: string; deposit: number; withdraw: number; count: number }[] = [];

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const prefix = `${yyyy}-${mm}`;

    const monthTrx = transactions.filter((t) => t.date.startsWith(prefix) && t.status === 'VALID');
    const dep = monthTrx.filter((t) => t.type === 'SETORAN').reduce((acc, t) => acc + t.amount, 0);
    const wit = monthTrx.filter((t) => t.type === 'PENARIKAN').reduce((acc, t) => acc + t.amount, 0);

    monthlyData.push({
      month: `${monthNames[d.getMonth()]} ${yyyy.toString().slice(-2)}`,
      deposit: dep,
      withdraw: wit,
      count: monthTrx.length,
    });
  }

  const maxMonthValue = Math.max(...monthlyData.map((m) => Math.max(m.deposit, m.withdraw)), 100000);

  return (
    <div className="space-y-6">
      {/* Demo Notice Banner */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Mode Demo Aktif:</strong> Tersedia 20 data siswa simulasi dengan mutasi tabungan aktif di Cloud Firestore.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={resetDataToDemo}
              className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 font-semibold rounded-lg hover:bg-amber-100 transition-colors"
            >
              Muat Ulang Demo
            </button>
            <button
              onClick={clearDataClean}
              className="px-2.5 py-1 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
            >
              Hapus Data Demo
            </button>
          </div>
        </div>
      )}

      {/* DASHBOARD KEPALA SEKOLAH (Section 14: Read Only Executive Dashboard) */}
      {isKepalaSekolah ? (
        <div className="space-y-6">
          {/* Executive Badge */}
          <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 block">
                PORTAL EKSEKUTIF KEPALA SEKOLAH
              </span>
              <h2 className="text-lg font-bold tracking-tight">
                Ringkasan Tabungan Siswa {settings.schoolName}
              </h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                Tahun Ajaran: {settings.activeAcademicYear} · Mode Baca & Monitoring (Read-Only)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('recap')}
                className="px-3.5 py-2 text-xs font-bold text-indigo-950 bg-white hover:bg-indigo-50 rounded-xl transition-all shadow-xs"
              >
                Lihat Rekap Lengkap
              </button>
              <button
                onClick={() => setActiveTab('report-yearend')}
                className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-600 rounded-xl transition-all border border-indigo-500"
              >
                Laporan Akhir Tahun
              </button>
            </div>
          </div>

          {/* Executive KPI Cards (Section 14) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Siswa</span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">{totalStudents}</div>
              <span className="text-[10px] text-slate-400">{activeStudents} Aktif</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs sm:col-span-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Saldo Seluruh Siswa</span>
              <div className="text-xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">
                {formatRupiah(totalBalance)}
              </div>
              <span className="text-[10px] text-slate-400">Rata-rata: {formatRupiah(avgStudentBalance)}/siswa</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs sm:col-span-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Setoran Tahun Berjalan</span>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                {formatRupiah(totalYearDeposit)}
              </div>
              <span className="text-[10px] text-slate-400">TA {settings.activeAcademicYear}</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs sm:col-span-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Penarikan Tahun Berjalan</span>
              <div className="text-lg font-bold font-mono text-amber-700 mt-1 tabular-nums">
                {formatRupiah(totalYearWithdrawal)}
              </div>
              <span className="text-[10px] text-slate-400">{yearTrx.length} total transaksi</span>
            </div>
          </div>

          {/* Charts Row: Monthly Trend & Balance per Class */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pertumbuhan Setoran & Penarikan Bulanan</h3>
                  <p className="text-xs text-slate-500">Analisis tren 6 bulan terakhir</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block"></span> Setoran
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block"></span> Penarikan
                  </span>
                </div>
              </div>

              <div className="pt-4 pb-2 grid grid-cols-6 gap-3 items-end h-48 border-b border-slate-100">
                {monthlyData.map((item, idx) => {
                  const depH = Math.min(100, Math.round((item.deposit / maxMonthValue) * 100));
                  const witH = Math.min(100, Math.round((item.withdraw / maxMonthValue) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1.5 h-36">
                        <div
                          style={{ height: `${Math.max(4, depH)}%` }}
                          className="w-1/2 max-w-[20px] bg-emerald-600 rounded-t-md relative"
                          title={`Setoran: ${formatRupiah(item.deposit)}`}
                        ></div>
                        <div
                          style={{ height: `${Math.max(4, witH)}%` }}
                          className="w-1/2 max-w-[20px] bg-amber-500 rounded-t-md relative"
                          title={`Penarikan: ${formatRupiah(item.withdraw)}`}
                        ></div>
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 mt-2 truncate w-full text-center">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Saldo per Kelas */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Saldo Tabungan per Kelas</h3>
                <p className="text-xs text-slate-500 mb-4">Distribusi dana per rombongan belajar</p>

                <div className="space-y-2.5">
                  {classBalances.map((cb) => (
                    <div key={cb.class} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 font-mono font-bold text-slate-700 flex items-center justify-center text-[10px]">
                          {cb.class}
                        </span>
                        <span className="font-medium text-slate-800">Kelas {cb.class}</span>
                        <span className="text-[10px] text-slate-400">({cb.students} siswa)</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {formatRupiah(cb.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('recap-class')}
                className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 hover:text-emerald-800 text-center w-full"
              >
                Lihat Rekap Kelas Lengkap &rarr;
              </button>
            </div>
          </div>

          {/* TOP 10 SISWA PALING RAJIN MENABUNG (Section 14) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Top 10 Siswa Paling Rajin Menabung
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('champions')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Lihat Seluruh Peringkat &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase">
                    <th className="py-2.5 px-4 text-center w-12">Peringkat</th>
                    <th className="py-2.5 px-4">Nama Siswa</th>
                    <th className="py-2.5 px-4">Kelas</th>
                    <th className="py-2.5 px-4 text-center">Hari Menabung</th>
                    <th className="py-2.5 px-4 text-right">Total Setoran</th>
                    <th className="py-2.5 px-4 text-right">Saldo Saat Ini</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {top10Champions.map((champ) => (
                    <tr key={champ.studentId} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-center font-bold font-mono">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            champ.rank === 1
                              ? 'bg-amber-400 text-slate-950'
                              : champ.rank === 2
                              ? 'bg-slate-300 text-slate-900'
                              : champ.rank === 3
                              ? 'bg-orange-300 text-orange-950'
                              : 'text-slate-600'
                          }`}
                        >
                          {champ.rank}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{champ.studentName}</td>
                      <td className="py-2.5 px-4 text-slate-600">Kelas {champ.class}</td>
                      <td className="py-2.5 px-4 text-center font-bold text-indigo-700 font-mono">
                        {champ.savingDaysCount} Hari
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold tabular-nums text-right text-emerald-800">
                        {formatRupiah(champ.totalDeposit)}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold tabular-nums text-right text-slate-900">
                        {formatRupiah(champ.finalBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* DASHBOARD PETUGAS & ADMIN (Section 15: Operational Action Dashboard) */
        <div className="space-y-6">
          {/* Operational Metrics (Today's performance) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Setoran Hari Ini
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                {formatRupiah(todayDepositTotal)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {todaySavingStudentsCount} siswa ({todayDeposits.length} transaksi)
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Penarikan Hari Ini
              </span>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
                {formatRupiah(todayWithdrawalTotal)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {todayWithdrawals.length} transaksi penarikan
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Jumlah Transaksi Hari Ini
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {todayTrxCount} <span className="text-xs font-normal text-slate-500">Transaksi</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Tanggal {formatIndoDate(todayStr)}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Saldo Semua Siswa
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {formatRupiah(totalBalance)}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                {activeStudents} Siswa Aktif Terdaftar
              </div>
            </div>
          </div>

          {/* Big Action Buttons (Section 15 & 26) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Aksi Utama Petugas Tabungan
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                onClick={() => setActiveTab('deposit')}
                className="py-4 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-xs transition-all group"
              >
                <ArrowDownLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-extrabold">+ SETORAN</span>
              </button>

              <button
                onClick={() => setActiveTab('withdraw')}
                className="py-4 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-xs transition-all group"
              >
                <ArrowUpRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-extrabold">- PENARIKAN</span>
              </button>

              <button
                onClick={() => setIsQrScannerOpen(true)}
                className="py-4 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-xs transition-all group"
              >
                <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-extrabold">📷 SCAN QR</span>
              </button>

              <button
                onClick={() => setActiveTab('mass-deposit')}
                className="py-4 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-xs transition-all group"
              >
                <Layers className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-extrabold">SETORAN MASSAL</span>
              </button>

              <button
                onClick={() => setActiveTab('students')}
                className="py-4 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-xs transition-all group"
              >
                <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-extrabold">👨‍🎓 DATA SISWA</span>
              </button>

              <button
                onClick={() => setActiveTab('recap')}
                className="py-4 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 border border-slate-200 transition-all group"
              >
                <BarChart3 className="w-6 h-6 text-slate-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-extrabold">📊 REKAP</span>
              </button>
            </div>
          </div>

          {/* 10 Transaksi Terbaru */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">10 Transaksi Terbaru</h3>
                <p className="text-xs text-slate-500">Mutasi tabungan yang baru diproses di sistem</p>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Lihat Seluruh Mutasi &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase">
                    <th className="py-2.5 px-4">No. Transaksi</th>
                    <th className="py-2.5 px-4">Tanggal</th>
                    <th className="py-2.5 px-4">Nama Siswa</th>
                    <th className="py-2.5 px-4">Kelas</th>
                    <th className="py-2.5 px-4">Jenis</th>
                    <th className="py-2.5 px-4 text-right">Nominal</th>
                    <th className="py-2.5 px-4 text-right">Saldo Sesudah</th>
                    <th className="py-2.5 px-4">Petugas</th>
                    <th className="py-2.5 px-4 text-center">Struk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">{trx.id}</td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{formatIndoDate(trx.date)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{trx.studentName}</td>
                      <td className="py-3 px-4 text-slate-600">Kelas {trx.class}</td>
                      <td className="py-3 px-4 font-bold">
                        <span className={trx.type === 'SETORAN' ? 'text-emerald-700' : 'text-amber-700'}>
                          {trx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold tabular-nums text-right text-slate-900">
                        {formatRupiah(trx.amount)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600">
                        {formatRupiah(trx.newBalance)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{trx.createdBy}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setReceiptModalTrx(trx)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Struk</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
