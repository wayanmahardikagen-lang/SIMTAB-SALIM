import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { formatRupiah, getTodayDateString, parseCurrencyInput } from '../../utils/format';
import {
  ArrowDownLeft,
  Search,
  Wallet,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';

export const TransactionDeposit: React.FC = () => {
  const { students, createTransaction, currentUser, settings } = useApp();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('Setoran tabungan rutin');
  const [transactionDate, setTransactionDate] = useState(getTodayDateString());
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery('');
    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 50);
  };

  const handleQuickAmount = (val: number) => {
    setAmountStr(val.toLocaleString('id-ID'));
  };

  const handleClearSelectedStudent = () => {
    setSelectedStudent(null);
    setAmountStr('');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || isSubmitting) return;

    const amount = parseCurrencyInput(amountStr);
    if (amount <= 0) return;

    setIsSubmitting(true);
    const res = await createTransaction({
      studentId: selectedStudent.id,
      type: 'SETORAN',
      amount,
      date: transactionDate,
      description: description.trim() || 'Setoran tabungan',
    });

    setIsSubmitting(false);

    if (res.success) {
      // Clear form and refocus for next fast transaction
      setSelectedStudent(null);
      setAmountStr('');
      setDescription('Setoran tabungan rutin');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Setoran Tabungan Siswa</h2>
            <p className="text-xs text-slate-500">
              Input setoran harian dengan cepat dan akurat
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500 hidden sm:block">
          <div>Petugas: <strong className="text-slate-800">{currentUser?.name}</strong></div>
          <div>TA: <strong>{settings.activeAcademicYear}</strong></div>
        </div>
      </div>

      {/* Main Deposit Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
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
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Search Results Dropdown */}
          {filteredStudents.length > 0 && (
            <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-lg">
              {filteredStudents.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => handleSelectStudent(s)}
                  className="w-full p-3 text-left hover:bg-emerald-50/50 flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-500">
                      NIS: <span className="font-mono">{s.nis}</span> · Kelas {s.class}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Saldo</span>
                    <span className="text-xs font-bold font-mono text-emerald-700">
                      {formatRupiah(s.balance)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Student Information Card */}
        {selectedStudent ? (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedStudent.name}</h4>
                <p className="text-xs text-slate-600">
                  NIS: <strong className="font-mono">{selectedStudent.nis}</strong> · Kelas {selectedStudent.class}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-emerald-800 uppercase font-semibold block tracking-wider">
                  Saldo Saat Ini
                </span>
                <span className="text-xl font-bold font-mono text-emerald-800 tabular-nums">
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
        ) : (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-400">
            Silakan cari dan pilih siswa di atas terlebih dahulu.
          </div>
        )}

        {/* Step 2: Amount & Quick Buttons */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. Nominal Setoran (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400">
              Rp
            </span>
            <input
              ref={amountInputRef}
              type="text"
              required
              disabled={!selectedStudent}
              value={amountStr}
              onChange={(e) => {
                const num = parseCurrencyInput(e.target.value);
                setAmountStr(num > 0 ? num.toLocaleString('id-ID') : '');
              }}
              placeholder="0"
              className="w-full pl-11 pr-4 py-3 text-lg font-bold font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Quick Amount Suggestion Buttons */}
          <div className="flex flex-wrap gap-2 mt-2.5">
            {[2000, 5000, 10000, 20000, 50000, 100000].map((val) => (
              <button
                type="button"
                key={val}
                disabled={!selectedStudent}
                onClick={() => handleQuickAmount(val)}
                className="px-2.5 py-1 text-xs font-semibold font-mono bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +{val.toLocaleString('id-ID')}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Date & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Transaksi
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Tabungan saku harian"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Preview Calculations */}
        {selectedStudent && parseCurrencyInput(amountStr) > 0 && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Saldo Lama:</span>
              <span className="font-mono">{formatRupiah(selectedStudent.balance)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
              <span>Estimasi Saldo Baru:</span>
              <span className="font-mono text-emerald-700">
                {formatRupiah(selectedStudent.balance + parseCurrencyInput(amountStr))}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button with double-click guard */}
        <button
          type="submit"
          disabled={!selectedStudent || parseCurrencyInput(amountStr) <= 0 || isSubmitting}
          className={`w-full py-3 px-4 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
            selectedStudent && parseCurrencyInput(amountStr) > 0 && !isSubmitting
              ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isSubmitting ? 'Menyimpan...' : 'SIMPAN TRANSAKSI SETORAN'}</span>
        </button>
      </form>
    </div>
  );
};
