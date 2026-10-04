import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndoDate, formatRupiah } from '../../utils/format';
import { BookOpen, Printer, Search } from 'lucide-react';

export const PassbookPrint: React.FC = () => {
  const { students, transactions, settings } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.length > 0 ? students[0].id : ''
  );

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0] || null;
  }, [students, selectedStudentId]);

  const studentTransactions = useMemo(() => {
    if (!selectedStudent) return [];
    return transactions
      .filter((t) => t.studentId === selectedStudent.id && t.status === 'VALID')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [transactions, selectedStudent]);

  const handlePrint = () => {
    window.print();
  };

  // Generate blank lines if few transactions so the passbook page looks authentic
  const emptyRowsCount = Math.max(0, 15 - studentTransactions.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Cetak Buku Tabungan Siswa</h2>
            <p className="text-xs text-slate-500">
              Format lembaran mutasi buku tabungan fisik sekolah dengan kolom paraf petugas
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Buku Tabungan</span>
        </button>
      </div>

      {/* Selector */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
          Pilih Buku Tabungan Siswa:
        </label>
        <select
          value={selectedStudent?.id || ''}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full sm:max-w-md px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-medium"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (NIS: {s.nis}) - Kelas {s.class}
            </option>
          ))}
        </select>
      </div>

      {/* Passbook Container */}
      {selectedStudent && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 sm:p-10 max-w-3xl mx-auto print:border-none print:p-0">
          {/* Header of Passbook */}
          <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                BUKU TABUNGAN SISWA
              </span>
              <h3 className="text-lg font-black uppercase text-slate-900">
                {settings.schoolName}
              </h3>
            </div>
            <div className="text-right text-xs">
              <span className="font-mono text-slate-500">NO. REKENING: </span>
              <strong className="font-mono text-slate-900">{selectedStudent.nis}</strong>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4 print:bg-white print:border-slate-400">
            <div>
              <span className="text-slate-500 w-24 inline-block">Nama Siswa:</span>
              <strong className="text-slate-900">{selectedStudent.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 w-24 inline-block">Kelas:</span>
              <strong className="text-slate-900">Kelas {selectedStudent.class}</strong>
            </div>
            <div>
              <span className="text-slate-500 w-24 inline-block">NIS / NISN:</span>
              <span className="font-mono">{selectedStudent.nis} / {selectedStudent.nisn || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 w-24 inline-block">Saldo Terakhir:</span>
              <strong className="font-mono text-emerald-800">{formatRupiah(selectedStudent.balance)}</strong>
            </div>
          </div>

          {/* Passbook Table with lines (Section 11) */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-800">
                  <th className="py-2 px-3 text-center border-r border-slate-300 w-10">No</th>
                  <th className="py-2 px-3 border-r border-slate-300 w-24">Tanggal</th>
                  <th className="py-2 px-3 border-r border-slate-300">Keterangan</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300 w-28">Setoran (Rp)</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300 w-28">Penarikan (Rp)</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300 w-28">Saldo (Rp)</th>
                  <th className="py-2 px-3 text-center w-20">Paraf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentTransactions.map((trx, idx) => (
                  <tr key={trx.id} className="h-8">
                    <td className="py-1.5 px-3 text-center font-mono text-slate-500 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-3 whitespace-nowrap text-slate-700 font-mono border-r border-slate-200">
                      {formatIndoDate(trx.date)}
                    </td>
                    <td className="py-1.5 px-3 text-slate-700 truncate max-w-[150px] border-r border-slate-200">
                      {trx.description || (trx.type === 'SETORAN' ? 'Setoran tunai' : 'Penarikan tunai')}
                    </td>
                    <td className="py-1.5 px-3 font-mono tabular-nums text-right text-emerald-800 border-r border-slate-200">
                      {trx.type === 'SETORAN' ? formatRupiah(trx.amount) : '-'}
                    </td>
                    <td className="py-1.5 px-3 font-mono tabular-nums text-right text-amber-800 border-r border-slate-200">
                      {trx.type === 'PENARIKAN' ? formatRupiah(trx.amount) : '-'}
                    </td>
                    <td className="py-1.5 px-3 font-mono font-bold tabular-nums text-right text-slate-900 border-r border-slate-200">
                      {formatRupiah(trx.newBalance)}
                    </td>
                    <td className="py-1.5 px-3 text-center text-slate-400 font-mono text-[10px]">
                      ✓
                    </td>
                  </tr>
                ))}

                {/* Blank rows for visual print continuity */}
                {Array.from({ length: emptyRowsCount }).map((_, i) => (
                  <tr key={`empty-${i}`} className="h-8">
                    <td className="py-1.5 px-3 text-center text-slate-300 border-r border-slate-200 font-mono">
                      {studentTransactions.length + i + 1}
                    </td>
                    <td className="border-r border-slate-200"></td>
                    <td className="border-r border-slate-200"></td>
                    <td className="border-r border-slate-200"></td>
                    <td className="border-r border-slate-200"></td>
                    <td className="border-r border-slate-200"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-[10px] text-slate-400 text-center italic">
            *Bawa buku ini setiap kali melakukan transaksi setoran atau penarikan di sekolah.
          </div>
        </div>
      )}
    </div>
  );
};
