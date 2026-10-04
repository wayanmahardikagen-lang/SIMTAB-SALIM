import React, { useState } from 'react';
import { Transaction } from '../../types';
import { formatIndoDate, formatRupiah } from '../../utils/format';
import { AlertTriangle, X, Check } from 'lucide-react';

interface CorrectionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onConfirm: (transactionId: string, reason: string) => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  transaction,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Alasan koreksi transaksi wajib diisi.');
      return;
    }
    onConfirm(transaction.id, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Koreksi / Batalkan Transaksi</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
          <p className="font-semibold">Perhatian Hak Akses Administrator:</p>
          <p className="leading-relaxed">
            Membatalkan transaksi akan menandai transaksi ini sebagai <strong>DIKOREKSI</strong>, memperbarui saldo siswa secara otomatis, dan mencatat rincian ke dalam Audit Log.
          </p>
        </div>

        {/* Transaction Brief */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
          <div className="flex justify-between">
            <span>No. Transaksi:</span>
            <span className="font-mono font-bold text-slate-900">{transaction.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Siswa:</span>
            <span className="font-bold text-slate-900">{transaction.studentName} (Kelas {transaction.class})</span>
          </div>
          <div className="flex justify-between">
            <span>Jenis & Nominal:</span>
            <span className="font-bold text-slate-900">
              {transaction.type} ({formatRupiah(transaction.amount)})
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>{formatIndoDate(transaction.date)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan Koreksi / Pembatalan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="Contoh: Salah memasukkan nominal kelebihan satu angka nol / salah pilih nama siswa..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
            {error && <p className="text-[11px] text-rose-600 font-medium mt-1">{error}</p>}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Koreksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
