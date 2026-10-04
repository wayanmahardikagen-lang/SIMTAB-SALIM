import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { formatIndoDate, formatRupiah } from '../../utils/format';
import { exportTransactionsToExcel } from '../../utils/excel';
import { CorrectionModal } from './CorrectionModal';
import {
  History,
  Search,
  Filter,
  FileDown,
  Printer,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const {
    transactions,
    students,
    settings,
    currentUser,
    setReceiptModalTrx,
    correctTransaction,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [correctionTarget, setCorrectionTarget] = useState<Transaction | null>(null);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = filterType === 'all' || t.type === filterType;
      const matchClass = filterClass === 'all' || t.class === filterClass;
      const matchStart = !startDate || t.date >= startDate;
      const matchEnd = !endDate || t.date <= endDate;

      return matchSearch && matchType && matchClass && matchStart && matchEnd;
    });
  }, [transactions, searchQuery, filterType, filterClass, startDate, endDate]);

  const handleExport = () => {
    exportTransactionsToExcel(
      filteredTransactions,
      settings,
      filterType === 'all' ? 'Semua Transaksi' : filterType
    );
  };

  const handleApplyCorrection = (transactionId: string, reason: string) => {
    correctTransaction(transactionId, reason);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Riwayat Transaksi Tabungan</h2>
          <p className="text-xs text-slate-500">
            Daftar lengkap seluruh mutasi setoran, penarikan, dan audit koreksi
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FileDown className="w-4 h-4 text-emerald-600" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NIS, atau no transaksi..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="all">Semua Jenis Transaksi</option>
              <option value="SETORAN">Setoran</option>
              <option value="PENARIKAN">Penarikan</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
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

          {/* Date Range Reset */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-1/2 px-2 py-2 text-xs rounded-xl border border-slate-200"
              title="Tanggal Awal"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-1/2 px-2 py-2 text-xs rounded-xl border border-slate-200"
              title="Tanggal Akhir"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 text-center">No</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">No. Transaksi</th>
                <th className="py-3 px-3">Nama Siswa</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-3">Jenis</th>
                <th className="py-3 px-3 text-right">Nominal</th>
                <th className="py-3 px-3 text-right">Saldo Sesudah</th>
                <th className="py-3 px-3">Petugas</th>
                <th className="py-3 px-3">Keterangan</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx, idx) => {
                  const isDeposit = trx.type === 'SETORAN';
                  const isCorrected = trx.status === 'DIKOREKSI';

                  return (
                    <tr
                      key={trx.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCorrected ? 'bg-slate-50/60 line-through text-slate-400' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">{formatIndoDate(trx.date)}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{trx.id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{trx.studentName}</td>
                      <td className="py-2.5 px-3 text-slate-600">Kelas {trx.class}</td>
                      <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isDeposit ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {isDeposit ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 inline text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 inline text-amber-600" />
                          )}
                          {trx.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold tabular-nums text-right text-slate-900">
                        {formatRupiah(trx.amount)}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right text-slate-600">
                        {formatRupiah(trx.newBalance)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 truncate max-w-[100px]">{trx.createdBy}</td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[160px]" title={trx.description}>
                        {trx.description || '-'}
                        {trx.correctionReason && (
                          <div className="text-[10px] text-rose-600 italic">
                            Koreksi: {trx.correctionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold ${
                            trx.status === 'VALID' ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {trx.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setReceiptModalTrx(trx)}
                            title="Cetak Kuitansi Transaksi"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Koreksi button visible to ADMIN */}
                          {currentUser?.role === 'ADMIN' && trx.status === 'VALID' && (
                            <button
                              onClick={() => setCorrectionTarget(trx)}
                              title="Koreksi / Batalkan Transaksi (Khusus Admin)"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Menampilkan <strong className="text-slate-800">{filteredTransactions.length}</strong> transaksi
          </div>
          <div className="flex items-center gap-4">
            <span>
              Setoran:{' '}
              <strong className="text-emerald-700 font-mono">
                {formatRupiah(
                  filteredTransactions
                    .filter((t) => t.type === 'SETORAN' && t.status === 'VALID')
                    .reduce((a, b) => a + b.amount, 0)
                )}
              </strong>
            </span>
            <span>
              Penarikan:{' '}
              <strong className="text-amber-700 font-mono">
                {formatRupiah(
                  filteredTransactions
                    .filter((t) => t.type === 'PENARIKAN' && t.status === 'VALID')
                    .reduce((a, b) => a + b.amount, 0)
                )}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Correction Modal */}
      <CorrectionModal
        transaction={correctionTarget}
        onClose={() => setCorrectionTarget(null)}
        onConfirm={handleApplyCorrection}
      />
    </div>
  );
};
