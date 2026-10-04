import React, { useState, useEffect } from 'react';
import { Student, SchoolSettings } from '../../types';
import { generateQrDataUrl, downloadQrCode } from '../../utils/qr';
import { formatRupiah, formatIndoDate } from '../../utils/format';
import {
  QrCode,
  Download,
  Printer,
  X,
  CreditCard,
  Check
} from 'lucide-react';

interface QrCodeModalProps {
  student: Student | null;
  settings: SchoolSettings;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  student,
  settings,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'qr_only' | 'card'>('card');

  useEffect(() => {
    if (!student) return;
    const qrPayload = student.qrCodeData || `SIMTAB:STD:${student.id}`;
    generateQrDataUrl(qrPayload).then((url) => {
      setQrDataUrl(url);
    });
  }, [student]);

  if (!student) return null;

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    downloadQrCode(qrDataUrl, `QR_SIMTAB_${student.nis}_${student.name.replace(/\s+/g, '_')}.png`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              QR Code & Kartu Tabungan Siswa
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="no-print px-6 pt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'card'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kartu Tabungan Lengkap
          </button>
          <button
            type="button"
            onClick={() => setViewMode('qr_only')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'qr_only'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hanya QR Code
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
          {viewMode === 'card' ? (
            /* Printable Student Savings Card (Requirement 9) */
            <div
              id="student-savings-card"
              className="w-full max-w-sm bg-white border-2 border-slate-800 rounded-2xl p-5 shadow-md text-slate-900 relative print:border-2 print:border-black print:shadow-none"
            >
              {/* Card Header */}
              <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-800">
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="w-11 h-11 object-contain shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block leading-tight">
                    SIMTAB
                  </span>
                  <h4 className="text-xs font-black uppercase text-slate-900 leading-tight">
                    KARTU TABUNGAN SISWA
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold">{settings.schoolName}</p>
                </div>
              </div>

              {/* Student Metadata & QR */}
              <div className="py-4 flex items-center justify-between gap-3">
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Nama Siswa
                    </span>
                    <strong className="text-sm font-bold text-slate-900 block leading-tight">
                      {student.name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      NIS / Kelas
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {student.nis}
                    </span>{' '}
                    · Kelas {student.class}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Saldo Terakhir
                    </span>
                    <strong className="font-mono text-emerald-800 text-sm tabular-nums">
                      {formatRupiah(student.balance)}
                    </strong>
                  </div>
                </div>

                {/* QR Code image */}
                <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Siswa"
                      className="w-24 h-24 object-contain"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-slate-200 animate-pulse rounded-lg"></div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-dashed border-slate-300 text-center text-[9px] text-slate-400 uppercase tracking-wider">
                Tunjukkan kartu ini kepada petugas tabungan saat transaksi
              </div>
            </div>
          ) : (
            /* QR Only View */
            <div className="text-center space-y-3">
              <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm inline-block">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-56 h-56 object-contain"
                  />
                )}
              </div>
              <div className="text-xs font-mono font-bold text-slate-800">
                {student.qrCodeData || `SIMTAB:STD:${student.id}`}
              </div>
              <div className="text-xs text-slate-500">
                {student.name} · NIS: {student.nis} · Kelas {student.class}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="no-print bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownloadQr}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download QR (PNG)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kartu Siswa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
