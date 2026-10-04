import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, Transaction } from '../../types';
import { formatIndoDate, formatRupiah, getTodayDateString, parseCurrencyInput } from '../../utils/format';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  Building,
  HelpCircle,
  X
} from 'lucide-react';

export const InitialBalanceMigrationView: React.FC = () => {
  const { students, transactions, currentUser, settings, executeCustomTransaction } = useApp();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amountStr, setAmountStr] = useState('');
  const [migrationDate, setMigrationDate] = useState(getTodayDateString());
  const [documentNumber, setDocumentNumber] = useState('');
  const [sourceData, setSourceData] = useState('Buku Kas Tabungan Fisik Manual');
  const [notes, setNotes] = useState('Migrasi saldo awal dari pembukuan manual sebelum sistem SIMTAB');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  // Filter students for search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nis.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [students, searchQuery]);

  // Existing migration transactions
  const migrationTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'SALDO_AWAL' && t.status === 'VALID');
  }, [transactions]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery('');
    setDocumentNumber(`DOC-MIGRASI-${student.nis}-${new Date().getFullYear()}`);
    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 50);
  };

  const handleClearSelectedStudent = () => {
    setSelectedStudent(null);
    setAmountStr('');
    setDocumentNumber('');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const amount = parseCurrencyInput(amountStr);
    if (amount <= 0) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedStudent || isSubmitting || !isAdmin) return;
    const amount = parseCurrencyInput(amountStr);
    if (amount <= 0) return;

    setIsSubmitting(true);
    const res = await executeCustomTransaction({
      studentId: selectedStudent.id,
      type: 'SALDO_AWAL',
      amount,
      date: migrationDate,
      description: notes.trim() || 'Migrasi saldo awal tabungan',
      documentNumber: documentNumber.trim(),
      sourceData: sourceData.trim(),
      isMigration: true,
    });

    setIsSubmitting(false);
    setShowConfirmModal(false);

    if (res.success) {
      setSelectedStudent(null);
      setAmountStr('');
      setDocumentNumber('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-amber-900">Hak Akses Khusus Diperlukan</h3>
        <p className="text-xs text-amber-700 mt-1">
          Hanya Administrator dengan wewenang khusus yang diizinkan menginput Saldo Awal / Migrasi Data Siswa.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Saldo Awal / Migrasi Data Tabungan</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                ADMIN ONLY
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pencatatan resmi saldo awal siswa saat perpindahan dari buku manual ke sistem digital SIMTAB
            </p>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-semibold">Integritas Rekonsiliasi & Aturan Perhitungan:</strong>
          <span>
            Saldo Awal dicatat sebagai transaksi khusus bertipe <code>SALDO_AWAL</code>. Transaksi ini menambah saldo siswa untuk perhitungan saldo akhir, namun <em>tidak dihitung</em> sebagai hari menabung pada Juara Menabung agar adil bagi siswa lain yang menabung secara berkala.
          </span>
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleOpenConfirm} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Step 1: Select Student */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Cari Siswa untuk Migrasi Saldo
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama siswa atau NIS..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 focus:bg-white"
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
                  className="w-full p-3 text-left hover:bg-blue-50/50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-500">
                      NIS: <span className="font-mono">{s.nis}</span> · Kelas {s.class}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Saldo Saat Ini</span>
                    <span className="text-xs font-bold font-mono text-slate-800">
                      {formatRupiah(s.balance)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Student Card */}
        {selectedStudent ? (
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedStudent.name}</h4>
                <p className="text-xs text-slate-600">
                  NIS: <strong className="font-mono">{selectedStudent.nis}</strong> · Kelas {selectedStudent.class}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-blue-200">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-blue-800 uppercase font-semibold block tracking-wider">
                  Saldo Saat Ini
                </span>
                <span className="text-xl font-bold font-mono text-blue-900 tabular-nums">
                  {formatRupiah(selectedStudent.balance)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearSelectedStudent}
                className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Ganti</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-400">
            Pilih siswa yang akan dicatatkan saldo awalnya.
          </div>
        )}

        {/* Step 2: Amount & Migration Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Nominal Saldo Awal (Rp)
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
                className="w-full pl-11 pr-4 py-2.5 text-base font-bold font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Tanggal Efektif Migrasi
            </label>
            <input
              type="date"
              required
              disabled={!selectedStudent}
              value={migrationDate}
              onChange={(e) => setMigrationDate(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Dokumen / Berita Acara
            </label>
            <input
              type="text"
              required
              disabled={!selectedStudent}
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Contoh: DOC-MIGRASI-10001-2026"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sumber Data Fisik
            </label>
            <input
              type="text"
              required
              disabled={!selectedStudent}
              value={sourceData}
              onChange={(e) => setSourceData(e.target.value)}
              placeholder="Contoh: Buku Kas Tabungan Fisik Hal. 14"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Keterangan & Catatan Audit
          </label>
          <input
            type="text"
            disabled={!selectedStudent}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
          />
        </div>

        {/* Calculations preview */}
        {selectedStudent && parseCurrencyInput(amountStr) > 0 && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Saldo Lama:</span>
              <span className="font-mono">{formatRupiah(selectedStudent.balance)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
              <span>Estimasi Saldo Baru Setelah Migrasi:</span>
              <span className="font-mono text-blue-700">
                {formatRupiah(selectedStudent.balance + parseCurrencyInput(amountStr))}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedStudent || parseCurrencyInput(amountStr) <= 0 || isSubmitting}
          className={`w-full py-3 px-4 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
            selectedStudent && parseCurrencyInput(amountStr) > 0 && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>PROSES SALDO AWAL / MIGRASI DATA</span>
        </button>
      </form>

      {/* Historical Migration Records */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Riwayat Transaksi Saldo Awal / Migrasi</h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
            {migrationTransactions.length} Data
          </span>
        </div>

        {migrationTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada data saldo awal / migrasi yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3">Nominal Migrasi</th>
                  <th className="py-2.5 px-3">No. Dokumen</th>
                  <th className="py-2.5 px-3">Sumber Data</th>
                  <th className="py-2.5 px-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {migrationTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono">{formatIndoDate(trx.date)}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{trx.studentName}</td>
                    <td className="py-2.5 px-3">Kelas {trx.class}</td>
                    <td className="py-2.5 px-3 font-bold font-mono text-blue-700">
                      {formatRupiah(trx.amount)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{trx.documentNumber || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{trx.sourceData || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-500">{trx.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Saldo Awal</h3>
                <p className="text-xs text-slate-500">Pastikan data dokumen fisik telah sesuai</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Siswa:</span>
                <span className="font-bold text-slate-900">{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NIS:</span>
                <span className="font-mono text-slate-800">{selectedStudent.nis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal Saldo Awal:</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  {formatRupiah(parseCurrencyInput(amountStr))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. Dokumen:</span>
                <span className="font-mono text-slate-800">{documentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sumber Fisik:</span>
                <span className="text-slate-800">{sourceData}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Memproses...' : 'Ya, Catat Saldo Awal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
