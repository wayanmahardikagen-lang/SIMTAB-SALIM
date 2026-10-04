import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndoDate, formatIndoDateTime, formatRupiah } from '../../utils/format';
import { Printer, CheckCircle, ArrowRight, X } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { receiptModalTrx, setReceiptModalTrx, settings } = useApp();

  if (!receiptModalTrx) return null;

  const trx = receiptModalTrx;
  const isDeposit = trx.type === 'SETORAN';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Receipt Header (screen) */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Transaksi Berhasil Disimpan</span>
          </div>
          <button
            onClick={() => setReceiptModalTrx(null)}
            className="text-slate-400 hover:text-white transition-colors p-1"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="printable-receipt" className="p-6 bg-white text-slate-900">
          {/* School Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="w-12 h-12 mx-auto mb-2">
              <img
                src={settings.logoUrl}
                alt="Logo Sekolah"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-base font-bold uppercase tracking-tight text-slate-900">
              {settings.schoolName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{settings.address}</p>
            <p className="text-xs font-semibold text-emerald-700 mt-1 uppercase tracking-wider">
              BUKTI TRANSAKSI TABUNGAN SISWA
            </p>
          </div>

          {/* Transaction Metadata */}
          <div className="py-4 space-y-2 text-xs border-b border-dashed border-slate-300">
            <div className="flex justify-between text-slate-600">
              <span>No. Transaksi</span>
              <span className="font-mono font-medium text-slate-900">{trx.id}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tanggal / Waktu</span>
              <span className="font-medium text-slate-900">{formatIndoDateTime(trx.createdAt)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Nama Siswa</span>
              <span className="font-bold text-slate-900">{trx.studentName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Kelas</span>
              <span className="font-medium text-slate-900">Kelas {trx.class}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Jenis Transaksi</span>
              <span
                className={`font-bold ${
                  isDeposit ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {trx.type}
              </span>
            </div>
            {trx.description && (
              <div className="flex justify-between text-slate-600">
                <span>Keterangan</span>
                <span className="text-slate-800 text-right max-w-[200px] truncate">{trx.description}</span>
              </div>
            )}
          </div>

          {/* Amount Breakdown */}
          <div className="py-4 space-y-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 uppercase tracking-wide">
                Nominal {isDeposit ? 'Setoran' : 'Penarikan'}
              </div>
              <div
                className={`text-2xl font-bold font-mono tracking-tight tabular-nums mt-0.5 ${
                  isDeposit ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {formatRupiah(trx.amount)}
              </div>
            </div>

            <div className="pt-2 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Saldo Sebelumnya:</span>
                <span className="font-mono tabular-nums">{formatRupiah(trx.previousBalance)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Saldo Terbaru:</span>
                <span className="font-mono tabular-nums text-slate-900">{formatRupiah(trx.newBalance)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t border-dashed border-slate-300 text-center text-[11px] text-slate-600 grid grid-cols-2 gap-4">
            <div>
              <p>Penyetor / Siswa</p>
              <div className="h-10"></div>
              <p className="font-medium text-slate-800">({trx.studentName})</p>
            </div>
            <div>
              <p>Petugas Tabungan</p>
              <div className="h-10"></div>
              <p className="font-medium text-slate-800">({trx.createdBy})</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 mt-4">
            *Simpan bukti ini sebagai tanda transaksi tabungan yang sah.
          </div>
        </div>

        {/* Modal Buttons (hidden during print) */}
        <div className="no-print bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Cetak Kuitansi
          </button>
          <button
            onClick={() => setReceiptModalTrx(null)}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs"
          >
            <span>Selesai</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
