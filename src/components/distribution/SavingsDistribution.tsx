import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndoDate, formatRupiah, getTodayDateString } from '../../utils/format';
import {
  Gift,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  FileDown,
  Clock,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const SavingsDistribution: React.FC = () => {
  const { students, distributions, markDistribution, settings, currentUser } = useApp();

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Belum Dibagikan' | 'Sudah Dibagikan'>('all');
  const [targetStudentForDistribute, setTargetStudentForDistribute] = useState<{ id: string; name: string; balance: number } | null>(null);
  const [distributeNotes, setDistributeNotes] = useState('Tabungan kenaikan kelas dibagikan tunai');

  // Distribution status mapping per student
  const distributionMap = useMemo(() => {
    const map = new Map<string, typeof distributions[0]>();
    distributions.forEach((d) => map.set(d.studentId, d));
    return map;
  }, [distributions]);

  const studentRows = useMemo(() => {
    return students
      .filter((s) => {
        const matchClass = selectedClass === 'all' || s.class === selectedClass;
        const matchSearch =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nis.toLowerCase().includes(searchQuery.toLowerCase());

        const record = distributionMap.get(s.id);
        const status = record ? 'Sudah Dibagikan' : 'Belum Dibagikan';
        const matchStatus = statusFilter === 'all' || status === statusFilter;

        return matchClass && matchSearch && matchStatus;
      })
      .map((student) => {
        const record = distributionMap.get(student.id);
        return {
          student,
          isDistributed: !!record,
          distributedDate: record?.distributedDate,
          distributedBy: record?.distributedBy,
          distributedAmount: record ? record.amountDistributed : student.balance,
          notes: record?.notes,
        };
      });
  }, [students, selectedClass, searchQuery, statusFilter, distributionMap]);

  const handleConfirmDistribution = () => {
    if (!targetStudentForDistribute) return;
    markDistribution(targetStudentForDistribute.id, targetStudentForDistribute.balance, distributeNotes);
    setTargetStudentForDistribute(null);
  };

  const handleExportExcel = () => {
    const rows = [
      [settings.schoolName.toUpperCase()],
      ['DAFTAR PEMBAGIAN TABUNGAN AKHIR TAHUN SISWA'],
      [`Tahun Ajaran: ${settings.activeAcademicYear}`],
      [`Tanggal Cetak: ${formatIndoDate(new Date())}`],
      [],
      ['No', 'NIS', 'Nama Siswa', 'Kelas', 'Saldo yang Dibagikan (Rp)', 'Status Pembagian', 'Tanggal Pembagian', 'Petugas', 'Keterangan']
    ];

    studentRows.forEach((r, idx) => {
      rows.push([
        (idx + 1).toString(),
        r.student.nis,
        r.student.name,
        r.student.class,
        r.distributedAmount as any,
        r.isDistributed ? 'Sudah Dibagikan' : 'Belum Dibagikan',
        r.distributedDate ? formatIndoDate(r.distributedDate) : '-',
        r.distributedBy || '-',
        r.notes || '-'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 25 },
      { wch: 10 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 25 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pembagian Tabungan');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pembagian_Tabungan_${settings.activeAcademicYear.replace(/\//g, '-')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalDistributed = studentRows
    .filter((r) => r.isDistributed)
    .reduce((acc, r) => acc + r.distributedAmount, 0);

  const totalPending = studentRows
    .filter((r) => !r.isDistributed)
    .reduce((acc, r) => acc + r.student.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Pembagian Tabungan Akhir Tahun</h2>
            <p className="text-xs text-slate-500">
              Pencatatan pengembalian dana tabungan kepada siswa/wali murid secara rapi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Tanda Terima</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Siswa Terdaftar
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {studentRows.length} <span className="text-xs font-sans text-slate-500 font-normal">Siswa</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
            Sudah Selesai Dibagikan
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-800 tabular-nums mt-1">
            {formatRupiah(totalDistributed)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {studentRows.filter((r) => r.isDistributed).length} siswa telah menerima
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
            Belum Dibagikan (Tersedia)
          </span>
          <div className="text-2xl font-bold font-mono text-amber-800 tabular-nums mt-1">
            {formatRupiah(totalPending)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {studentRows.filter((r) => !r.isDistributed).length} siswa menunggu pembagian
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa atau NIS..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
          >
            <option value="all">Semua Kelas</option>
            <option value="1">Kelas 1</option>
            <option value="2">Kelas 2</option>
            <option value="3">Kelas 3</option>
            <option value="4">Kelas 4</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6 (Kelulusan)</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
          >
            <option value="all">Semua Status Pembagian</option>
            <option value="Belum Dibagikan">Belum Dibagikan</option>
            <option value="Sudah Dibagikan">Sudah Selesai Dibagikan</option>
          </select>
        </div>
      </div>

      {/* Table Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 print:border-none print:p-0">
        {/* Printable Header */}
        <div className="text-center pb-4 mb-4 border-b-2 border-slate-900 hidden print:block">
          <h2 className="text-base font-bold uppercase">{settings.schoolName}</h2>
          <p className="text-xs">{settings.address} · NPSN: {settings.npsn}</p>
          <h3 className="text-sm font-bold uppercase mt-2">DAFTAR TANDA TERIMA PEMBAGIAN TABUNGAN AKHIR TAHUN</h3>
          <p className="text-xs">Tahun Ajaran: {settings.activeAcademicYear} | Tanggal Cetak: {formatIndoDate(new Date())}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider print:bg-slate-100">
                <th className="py-3 px-3 text-center">No</th>
                <th className="py-3 px-3">NIS</th>
                <th className="py-3 px-3">Nama Siswa</th>
                <th className="py-3 px-3 text-center">Kelas</th>
                <th className="py-3 px-3 text-right">Saldo yang Dibagikan</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Tanggal Pembagian</th>
                <th className="py-3 px-3">Petugas</th>
                <th className="py-3 px-3 text-center no-print">Aksi</th>
                <th className="py-3 px-3 text-center hidden print:table-cell w-28">Tanda Tangan Siswa/Wali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tidak ada siswa ditemukan.
                  </td>
                </tr>
              ) : (
                studentRows.map((r, idx) => (
                  <tr key={r.student.id} className="hover:bg-slate-50 print:border-b print:border-slate-200">
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{r.student.nis}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{r.student.name}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{r.student.class}</td>
                    <td className="py-3 px-3 font-mono font-bold tabular-nums text-right text-slate-900">
                      {formatRupiah(r.distributedAmount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[11px] font-semibold ${
                          r.isDistributed ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {r.isDistributed ? 'Sudah Dibagikan' : 'Belum Dibagikan'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {r.distributedDate ? formatIndoDate(r.distributedDate) : '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{r.distributedBy || '-'}</td>
                    <td className="py-3 px-3 text-center no-print whitespace-nowrap">
                      {r.isDistributed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <Check className="w-3.5 h-3.5" /> Selesai
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setTargetStudentForDistribute({
                              id: r.student.id,
                              name: r.student.name,
                              balance: r.student.balance,
                            })
                          }
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                        >
                          Selesai Dibagikan
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center hidden print:table-cell">
                      <div className="h-8 border-b border-dashed border-slate-300"></div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Formal Signature Area for Print */}
        <div className="pt-10 hidden print:grid grid-cols-2 gap-8 text-xs text-center">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold">Kepala Sekolah {settings.schoolName}</p>
            <div className="h-20"></div>
            <p className="font-bold underline">{settings.headmasterName}</p>
            <p className="text-[10px]">NIP. {settings.headmasterNip}</p>
          </div>
          <div>
            <p>Loloan Timur, {formatIndoDate(new Date())}</p>
            <p className="font-semibold">Petugas Tabungan Siswa</p>
            <div className="h-20"></div>
            <p className="font-bold underline">{settings.treasurerName}</p>
            <p className="text-[10px]">NIP. {settings.treasurerNip}</p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {targetStudentForDistribute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Gift className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900">Konfirmasi Pembagian Tabungan</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Tandai bahwa tabungan atas nama <strong>{targetStudentForDistribute.name}</strong> sebesar{' '}
                <strong className="text-emerald-700 font-mono text-sm">{formatRupiah(targetStudentForDistribute.balance)}</strong> telah resmi diserahkan kepada siswa / wali murid.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Penyerahan:
              </label>
              <input
                type="text"
                value={distributeNotes}
                onChange={(e) => setDistributeNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setTargetStudentForDistribute(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDistribution}
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
              >
                Konfirmasi Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
