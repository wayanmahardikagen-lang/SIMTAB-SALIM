import React from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { formatIndoDate, formatRupiah, formatIndoDateTime } from '../../utils/format';
import { calculateSavingDays } from '../../utils/storage';
import {
  X,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  History,
  Printer,
  QrCode,
  User,
  Phone,
  FileSpreadsheet
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
  const { transactions, setActiveTab, setReceiptModalTrx, settings } = useApp();

  if (!student) return null;

  // Student specific transactions
  const studentTrx = transactions
    .filter((t) => t.studentId === student.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const validStudentTrx = studentTrx.filter((t) => t.status === 'VALID');

  const stats = calculateSavingDays(student.id, transactions);
  const lastTrx = validStudentTrx.length > 0 ? validStudentTrx[0] : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">{student.name}</h3>
              <p className="text-[11px] text-slate-500">
                NIS: {student.nis} {student.nisn ? `· NISN: ${student.nisn}` : ''} · Kelas {student.class}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu / Detail</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Printable Student Savings Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-200">
                  <span>KARTU TABUNGAN SISWA</span>
                  <span>·</span>
                  <span>{settings.schoolName}</span>
                </div>
                <h2 className="text-xl font-bold mt-2 tracking-tight">{student.name}</h2>
                <div className="text-xs text-emerald-100/90 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  <span>NIS: <strong className="font-mono">{student.nis}</strong></span>
                  <span>Kelas: <strong>{student.class}</strong></span>
                  <span>Status: <strong>{student.status}</strong></span>
                </div>
              </div>

              {/* QR Code and Current Balance Badge */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                <div className="p-2 bg-white rounded-xl shadow-xs">
                  {/* Clean SVG QR code representation */}
                  <svg viewBox="0 0 100 100" className="w-14 h-14" fill="#0f172a">
                    <rect x="0" y="0" width="30" height="30" rx="3" fill="#0f172a" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" fill="#0f172a" />

                    <rect x="70" y="0" width="30" height="30" rx="3" fill="#0f172a" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" fill="#0f172a" />

                    <rect x="0" y="70" width="30" height="30" rx="3" fill="#0f172a" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" fill="#0f172a" />

                    <rect x="40" y="10" width="8" height="8" />
                    <rect x="52" y="10" width="8" height="8" />
                    <rect x="40" y="25" width="20" height="8" />
                    <rect x="10" y="45" width="20" height="8" />
                    <rect x="40" y="45" width="8" height="20" />
                    <rect x="55" y="45" width="12" height="12" />
                    <rect x="75" y="45" width="15" height="8" />
                    <rect x="40" y="75" width="20" height="15" />
                    <rect x="70" y="70" width="10" height="10" />
                    <rect x="85" y="80" width="15" height="15" />
                  </svg>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-200 uppercase tracking-wider block">Saldo Saat Ini</span>
                  <span className="text-xl font-bold font-mono tracking-tight text-white tabular-nums">
                    {formatRupiah(student.balance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics (Section 19) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Seluruh Setoran
              </span>
              <span className="text-base font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
                {formatRupiah(stats.totalDeposit)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Seluruh Penarikan
              </span>
              <span className="text-base font-bold font-mono tabular-nums text-amber-700 mt-1 block">
                {formatRupiah(stats.totalWithdrawal)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Hari Menabung
              </span>
              <span className="text-base font-bold font-mono tabular-nums text-indigo-700 mt-1 block">
                {stats.daysCount} <span className="text-xs font-normal text-slate-500">Hari</span>
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Jumlah Transaksi
              </span>
              <span className="text-base font-bold font-mono tabular-nums text-slate-800 mt-1 block">
                {validStudentTrx.length} <span className="text-xs font-normal text-slate-500">Kali</span>
              </span>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
            <div>
              <span className="font-semibold text-slate-500">Nama Orang Tua/Wali:</span>{' '}
              <span className="text-slate-900 font-medium">{student.parentName || '-'}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">No. WhatsApp/HP:</span>{' '}
              <span className="text-slate-900 font-medium">{student.parentPhone || '-'}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Tanggal Mulai Menabung:</span>{' '}
              <span className="text-slate-900 font-medium">{formatIndoDate(student.initialDepositDate)}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Transaksi Terakhir:</span>{' '}
              <span className="text-slate-900 font-medium">
                {lastTrx ? `${formatIndoDate(lastTrx.date)} (${lastTrx.type})` : '-'}
              </span>
            </div>
            {student.notes && (
              <div className="sm:col-span-2 pt-1 border-t border-slate-100">
                <span className="font-semibold text-slate-500">Catatan:</span>{' '}
                <span className="text-slate-900 italic">{student.notes}</span>
              </div>
            )}
          </div>

          {/* Riwayat Transaksi Tabel */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Riwayat Transaksi Siswa ({validStudentTrx.length})
                </h4>
              </div>
            </div>

            {validStudentTrx.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                Belum ada transaksi tabungan untuk siswa ini.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                        <th className="py-2 px-3">Tanggal</th>
                        <th className="py-2 px-3">Jenis</th>
                        <th className="py-2 px-3 text-right">Nominal</th>
                        <th className="py-2 px-3 text-right">Saldo Sesudah</th>
                        <th className="py-2 px-3">Petugas</th>
                        <th className="py-2 px-3">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validStudentTrx.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 whitespace-nowrap text-slate-600">{formatIndoDate(t.date)}</td>
                          <td className="py-2 px-3 font-semibold">
                            <span className={t.type === 'SETORAN' ? 'text-emerald-700' : 'text-amber-700'}>
                              {t.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono tabular-nums text-right font-medium text-slate-900">
                            {formatRupiah(t.amount)}
                          </td>
                          <td className="py-2 px-3 font-mono tabular-nums text-right text-slate-600">
                            {formatRupiah(t.newBalance)}
                          </td>
                          <td className="py-2 px-3 text-slate-500 truncate max-w-[100px]">{t.createdBy}</td>
                          <td className="py-2 px-3 text-slate-600 truncate max-w-[150px]">{t.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="no-print bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              setActiveTab('report-passbook');
            }}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Buka Format Buku Tabungan Lengkap</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
