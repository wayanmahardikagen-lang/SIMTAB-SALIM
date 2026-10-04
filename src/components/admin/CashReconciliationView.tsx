import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndoDate, formatRupiah, getTodayDateString, parseCurrencyInput } from '../../utils/format';
import {
  Coins,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Calendar,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CashDenominations {
  c100k: number;
  c50k: number;
  c20k: number;
  c10k: number;
  c5k: number;
  c2k: number;
  c1k: number;
  coins: number;
}

export const CashReconciliationView: React.FC = () => {
  const { transactions, currentUser, settings } = useApp();

  const [reconcileDate, setReconcileDate] = useState(getTodayDateString());
  const [initialCashStr, setInitialCashStr] = useState('0');
  const [denominations, setDenominations] = useState<CashDenominations>({
    c100k: 0,
    c50k: 0,
    c20k: 0,
    c10k: 0,
    c5k: 0,
    c2k: 0,
    c1k: 0,
    coins: 0,
  });
  const [cashNotes, setCashNotes] = useState('Rekonsiliasi kas harian petugas tabungan');

  // Filter transactions on selected date
  const dayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === reconcileDate && t.status === 'VALID');
  }, [transactions, reconcileDate]);

  // Aggregate deposits and withdrawals
  const totalDayDeposits = useMemo(() => {
    return dayTransactions
      .filter((t) => t.type === 'SETORAN' || t.type === 'SALDO_AWAL')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [dayTransactions]);

  const totalDayWithdrawals = useMemo(() => {
    return dayTransactions
      .filter((t) => t.type === 'PENARIKAN')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [dayTransactions]);

  const initialCash = parseCurrencyInput(initialCashStr);
  const expectedCash = initialCash + totalDayDeposits - totalDayWithdrawals;

  // Calculate physical cash from denomination counts
  const physicalCash = useMemo(() => {
    return (
      denominations.c100k * 100000 +
      denominations.c50k * 50000 +
      denominations.c20k * 20000 +
      denominations.c10k * 10000 +
      denominations.c5k * 5000 +
      denominations.c2k * 2000 +
      denominations.c1k * 1000 +
      denominations.coins
    );
  }, [denominations]);

  const discrepancy = physicalCash - expectedCash;
  const isBalanced = discrepancy === 0;

  const handleDenominationChange = (key: keyof CashDenominations, val: string) => {
    const num = Math.max(0, parseInt(val) || 0);
    setDenominations((prev) => ({ ...prev, [key]: num }));
  };

  const handleSetQuickPhysical = () => {
    // Fill quick matching denomination if officer just wants to match expected
    const rem = expectedCash;
    if (rem > 0) {
      const c100 = Math.floor(rem / 100000);
      const c50 = Math.floor((rem % 100000) / 50000);
      const c20 = Math.floor((rem % 50000) / 20000);
      const c10 = Math.floor((rem % 20000) / 10000);
      const c5 = Math.floor((rem % 10000) / 5000);
      const c2 = Math.floor((rem % 5000) / 2000);
      const c1 = Math.floor((rem % 2000) / 1000);
      const coins = rem % 1000;
      setDenominations({
        c100k: c100,
        c50k: c50,
        c20k: c20,
        c10k: c10,
        c5k: c5,
        c2k: c2,
        c1k: c1,
        coins,
      });
    }
  };

  const handleExportExcel = () => {
    const rows = [
      [settings.schoolName.toUpperCase()],
      ['BERITA ACARA REKONSILIASI KAS HARIAN TABUNGAN SISWA'],
      [`Tanggal Rekonsiliasi: ${formatIndoDate(reconcileDate)}`],
      [`Petugas Pencatat: ${currentUser?.name || 'Petugas Tabungan'}`],
      [],
      ['RINCIAN PERHITUNGAN KAS'],
      ['Uraian', 'Nominal (Rp)'],
      ['Saldo Kas Awal', initialCash],
      ['Total Setoran Siswa (+)', totalDayDeposits],
      ['Total Penarikan Siswa (-)', totalDayWithdrawals],
      ['Kas Seharusnya (Teoritis)', expectedCash],
      ['Kas Fisik Terhitung', physicalCash],
      ['Selisih Kas', discrepancy],
      ['Status', isBalanced ? 'SESUAI' : discrepancy > 0 ? 'SELISIH LEBIH' : 'SELISIH KURANG'],
      [],
      ['RINCIAN PECAHAN UANG FISIK'],
      ['Pecahan', 'Jumlah Lembar/Keping', 'Subtotal (Rp)'],
      ['Rp 100.000', denominations.c100k, denominations.c100k * 100000],
      ['Rp 50.000', denominations.c50k, denominations.c50k * 50000],
      ['Rp 20.000', denominations.c20k, denominations.c20k * 20000],
      ['Rp 10.000', denominations.c10k, denominations.c10k * 10000],
      ['Rp 5.000', denominations.c5k, denominations.c5k * 5000],
      ['Rp 2.000', denominations.c2k, denominations.c2k * 2000],
      ['Rp 1.000', denominations.c1k, denominations.c1k * 1000],
      ['Koin / Receh', 1, denominations.coins],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekonsiliasi Kas');
    XLSX.writeFile(wb, `Rekonsiliasi_Kas_${reconcileDate}.xlsx`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Rekonsiliasi Kas Harian Petugas</h2>
            <p className="text-xs text-slate-500">
              Validasi kesesuaian antara mutasi transaksi sistem dengan uang fisik kas tabungan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-200 flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak Berita Acara</span>
          </button>
        </div>
      </div>

      {/* Date & Initial Cash Filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Tanggal Rekonsiliasi Kas:</span>
          </label>
          <input
            type="date"
            value={reconcileDate}
            onChange={(e) => setReconcileDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
            <span>Saldo Kas Awal Hari Ini (Rp):</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
            <input
              type="text"
              value={initialCashStr}
              onChange={(e) => {
                const num = parseCurrencyInput(e.target.value);
                setInitialCashStr(num.toLocaleString('id-ID'));
              }}
              placeholder="0"
              className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Setoran Hari Ini</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-700">
            {formatRupiah(totalDayDeposits)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {dayTransactions.filter((t) => t.type === 'SETORAN').length} transaksi setoran
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Penarikan Hari Ini</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg font-bold font-mono text-rose-700">
            {formatRupiah(totalDayWithdrawals)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {dayTransactions.filter((t) => t.type === 'PENARIKAN').length} transaksi penarikan
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Kas Seharusnya</span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold font-mono text-blue-800">
            {formatRupiah(expectedCash)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Kas Awal + Setoran - Penarikan</div>
        </div>

        <div
          className={`p-4 rounded-2xl border shadow-xs ${
            isBalanced
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-rose-50/70 border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={isBalanced ? 'text-emerald-800' : 'text-rose-800'}>
              Status Kas
            </span>
            {isBalanced ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div
            className={`text-lg font-bold font-mono ${
              isBalanced ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {isBalanced ? 'SESUAI (0)' : formatRupiah(discrepancy)}
          </div>
          <div
            className={`text-[10px] font-semibold mt-1 ${
              isBalanced ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {isBalanced
              ? '✓ Kas fisik 100% cocok'
              : discrepancy > 0
              ? '⚠️ Kas fisik LEBIH dari sistem'
              : '⚠️ Kas fisik KURANG dari sistem'}
          </div>
        </div>
      </div>

      {/* Cash Counting Workspace */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Perhitungan Fisik Uang Kas (Cash Drawer)</h3>
            <p className="text-xs text-slate-500">Hitung lembaran uang fisik di laci kasir per pecahan</p>
          </div>
          <button
            type="button"
            onClick={handleSetQuickPhysical}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cocokkan Cepat ke Kas Seharusnya
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rp 100.000</label>
            <input
              type="number"
              min="0"
              value={denominations.c100k || ''}
              onChange={(e) => handleDenominationChange('c100k', e.target.value)}
              placeholder="0 lembar"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              = {formatRupiah(denominations.c100k * 100000)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rp 50.000</label>
            <input
              type="number"
              min="0"
              value={denominations.c50k || ''}
              onChange={(e) => handleDenominationChange('c50k', e.target.value)}
              placeholder="0 lembar"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              = {formatRupiah(denominations.c50k * 50000)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rp 20.000</label>
            <input
              type="number"
              min="0"
              value={denominations.c20k || ''}
              onChange={(e) => handleDenominationChange('c20k', e.target.value)}
              placeholder="0 lembar"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              = {formatRupiah(denominations.c20k * 20000)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rp 10.000</label>
            <input
              type="number"
              min="0"
              value={denominations.c10k || ''}
              onChange={(e) => handleDenominationChange('c10k', e.target.value)}
              placeholder="0 lembar"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              = {formatRupiah(denominations.c10k * 10000)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rp 5.000</label>
            <input
              type="number"
              min="0"
              value={denominations.c5k || ''}
              onChange={(e) => handleDenominationChange('c5k', e.target.value)}
              placeholder="0 lembar"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              = {formatRupiah(denominations.c5k * 5000)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rp 2.000</label>
            <input
              type="number"
              min="0"
              value={denominations.c2k || ''}
              onChange={(e) => handleDenominationChange('c2k', e.target.value)}
              placeholder="0 lembar"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              = {formatRupiah(denominations.c2k * 2000)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rp 1.000</label>
            <input
              type="number"
              min="0"
              value={denominations.c1k || ''}
              onChange={(e) => handleDenominationChange('c1k', e.target.value)}
              placeholder="0 lembar"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              = {formatRupiah(denominations.c1k * 1000)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Koin / Receh</label>
            <input
              type="number"
              min="0"
              value={denominations.coins || ''}
              onChange={(e) => handleDenominationChange('coins', e.target.value)}
              placeholder="0 rupiah"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              = {formatRupiah(denominations.coins)}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
          <span className="text-xs font-bold text-slate-700">Total Kas Fisik Terhitung:</span>
          <span className="text-base font-bold font-mono text-slate-900">{formatRupiah(physicalCash)}</span>
        </div>
      </div>
    </div>
  );
};
