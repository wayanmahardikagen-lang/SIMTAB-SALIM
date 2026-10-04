import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { formatRupiah, getTodayDateString, parseCurrencyInput } from '../../utils/format';
import { calculateSavingDays } from '../../utils/storage';
import {
  ArrowUpRight,
  Search,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

export const TransactionWithdraw: React.FC = () => {
  const { students, transactions, createTransaction, currentUser, settings } = useApp();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('Penarikan tabungan keperluan sekolah');
  const [transactionDate, setTransactionDate] = useState(getTodayDateString());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Search filtered active students
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return students
      .filter(
        (s) =>
          s.status === 'Aktif' &&
          (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.nis.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .slice(0, 5);
  }, [students, searchQuery]);

  // Statistics for selected student
  const studentStats = useMemo(() => {
    if (!selectedStudent) return { totalDeposit: 0, totalWithdrawal: 0 };
    return calculateSavingDays(selectedStudent.id, transactions);
  }, [selectedStudent, transactions]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery('');
    setValidationError('');
    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 50);
  };

  const handleClearSelectedStudent = () => {
    setSelectedStudent(null);
    setAmountStr('');
    setValidationError('');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleWithdrawalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const amount = parseCurrencyInput(amountStr);
    if (amount <= 0) {
      setValidationError('Nominal penarikan harus lebih dari Rp 0.');
      return;
    }

    if (amount > selectedStudent.balance) {
      setValidationError('Saldo tidak mencukupi.');
      return;
    }

    setValidationError('');
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedStudent || isSubmitting) return;
    const amount = parseCurrencyInput(amountStr);

    setIsSubmitting(true);
    const res = await createTransaction({
      studentId: selectedStudent.id,
      type: 'PENARIKAN',
      amount,
      date: transactionDate,
      description: description.trim() || 'Penarikan tabungan',
    });

    setIsSubmitting(false);
    setShowConfirmModal(false);

    if (res.success) {
      setSelectedStudent(null);
      setAmountStr('');
      setDescription('Penarikan tabungan keperluan sekolah');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  };

  const currentAmount = parseCurrencyInput(amountStr);
  const isOverdrawn = selectedStudent ? currentAmount > selectedStudent.balance : false;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Penarikan Tabungan Siswa</h2>
            <p className="text-xs text-slate-500">
              Proses pencairan dana tabungan siswa dengan validasi saldo
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500 hidden sm:block">
          <div>Petugas: <strong className="text-slate-800">{currentUser?.name}</strong></div>
          <div>TA: <strong>{settings.activeAcademicYear}</strong></div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleWithdrawalRequest} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Step 1: Search & Select Student */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Cari & Pilih Siswa
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama siswa atau NIS..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Search Dropdown */}
          {filteredStudents.length > 0 && (
            <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-lg">
              {filteredStudents.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => handleSelectStudent(s)}
                  className="w-full p-3 text-left hover:bg-amber-50/50 flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-500">
                      NIS: <span className="font-mono">{s.nis}</span> · Kelas {s.class}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Saldo</span>
                    <span className="text-xs font-bold font-mono text-slate-900">
                      {formatRupiah(s.balance)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Student Information (Requirement 7) */}
        {selectedStudent ? (
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedStudent.name}</h4>
                  <p className="text-xs text-slate-600">
                    NIS: <strong className="font-mono">{selectedStudent.nis}</strong> · Kelas {selectedStudent.class}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-amber-200">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-amber-800 uppercase font-semibold block tracking-wider">
                    Saldo Tersedia
                  </span>
                  <span className="text-xl font-bold font-mono text-amber-900 tabular-nums">
                    {formatRupiah(selectedStudent.balance)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedStudent}
                  className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Batalkan pilihan siswa"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Ganti</span>
                </button>
              </div>
            </div>

            {/* Total deposit & total withdrawal metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/80 text-xs">
              <div className="text-slate-600">
                Total Setoran: <strong className="font-mono text-slate-800">{formatRupiah(studentStats.totalDeposit)}</strong>
              </div>
              <div className="text-slate-600 sm:text-right">
                Total Penarikan: <strong className="font-mono text-slate-800">{formatRupiah(studentStats.totalWithdrawal)}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-400">
            Silakan pilih siswa yang akan melakukan penarikan.
          </div>
        )}

        {/* Step 2: Withdrawal Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. Nominal Penarikan (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400">
              Rp
            </span>
            <input
              ref={amountInputRef}
              type="text"
              required
              disabled={!selectedStudent || selectedStudent.balance <= 0}
              value={amountStr}
              onChange={(e) => {
                const num = parseCurrencyInput(e.target.value);
                setAmountStr(num > 0 ? num.toLocaleString('id-ID') : '');
                setValidationError('');
              }}
              placeholder="0"
              className={`w-full pl-11 pr-4 py-3 text-lg font-bold font-mono rounded-xl border focus:outline-none focus:ring-2 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed ${
                isOverdrawn
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 text-rose-700 bg-rose-50/30'
                  : 'border-slate-200 focus:border-amber-600 focus:ring-amber-500/20'
              }`}
            />
          </div>

          {/* Quick buttons */}
          {selectedStudent && selectedStudent.balance > 0 && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[0.25, 0.5, 0.75].map((pct) => {
                const nominal = Math.floor((selectedStudent.balance * pct) / 1000) * 1000;
                if (nominal <= 0) return null;
                return (
                  <button
                    type="button"
                    key={pct}
                    onClick={() => setAmountStr(nominal.toLocaleString('id-ID'))}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-amber-50 hover:text-amber-900 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    {pct * 100}% ({formatRupiah(nominal)})
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setAmountStr(selectedStudent.balance.toLocaleString('id-ID'))}
                className="px-2.5 py-1 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg border border-amber-300 transition-colors cursor-pointer"
              >
                Tarik Semua ({formatRupiah(selectedStudent.balance)})
              </button>
            </div>
          )}

          {/* Real-time overdrawn warning banner */}
          {isOverdrawn && (
            <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Saldo tidak mencukupi.</strong> Penarikan sebesar {formatRupiah(currentAmount)} melebihi saldo siswa saat ini ({formatRupiah(selectedStudent?.balance)}).
              </span>
            </div>
          )}

          {validationError && (
            <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              {validationError}
            </div>
          )}
        </div>

        {/* Step 3: Date & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Penarikan
            </label>
            <input
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Penarikan
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Pembelian perlengkapan ujian"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedStudent || currentAmount <= 0 || isOverdrawn}
          className={`w-full py-3 px-4 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
            selectedStudent && currentAmount > 0 && !isOverdrawn
              ? 'bg-amber-600 hover:bg-amber-700 cursor-pointer'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>PROSES PENARIKAN TABUNGAN</span>
        </button>
      </form>

      {/* Confirmation Modal Dialog (Section 7) */}
      {showConfirmModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900">Konfirmasi Penarikan Tabungan</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Apakah Anda yakin akan melakukan penarikan sebesar{' '}
                <strong className="text-slate-900 font-mono text-sm">{formatRupiah(currentAmount)}</strong> untuk siswa{' '}
                <strong className="text-slate-900">{selectedStudent.name}</strong> (Kelas {selectedStudent.class})?
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Saldo Saat Ini:</span>
                <span className="font-mono">{formatRupiah(selectedStudent.balance)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                <span>Sisa Saldo Sesudah:</span>
                <span className="font-mono text-amber-800">
                  {formatRupiah(selectedStudent.balance - currentAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs"
              >
                {isSubmitting ? 'Memproses...' : 'Ya, Tarik Tabungan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
