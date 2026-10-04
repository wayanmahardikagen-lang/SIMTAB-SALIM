import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndoDate, formatRupiah } from '../../utils/format';
import { FileText, Printer, ArrowLeft } from 'lucide-react';

interface MinutesOfDistributionProps {
  onBack: () => void;
}

export const MinutesOfDistribution: React.FC<MinutesOfDistributionProps> = ({ onBack }) => {
  const { students, distributions, settings } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const distributedList = students.map((s, idx) => {
    const record = distributions.find((d) => d.studentId === s.id);
    return {
      no: idx + 1,
      nis: s.nis,
      name: s.name,
      class: s.class,
      amount: record ? record.amountDistributed : s.balance,
      status: record ? 'Sudah Dibagikan' : 'Belum Dibagikan',
    };
  });

  const totalAmount = distributedList.reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Header */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pembagian Tabungan</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Berita Acara</span>
        </button>
      </div>

      {/* Printable Sheet (Requirement 22) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 sm:p-12 print:border-none print:p-0">
        {/* Kop Surat Resmi */}
        <div className="pb-4 mb-6 border-b-2 border-slate-900 flex items-center gap-4">
          <img
            src={settings.logoUrl}
            alt="Logo"
            className="w-16 h-16 object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="text-center flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
              PEMERINTAH KABUPATEN JEMBRANA · DINAS PENDIDIKAN
            </p>
            <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900">
              {settings.schoolName}
            </h1>
            <p className="text-xs text-slate-600">{settings.address} · NPSN: {settings.npsn}</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 underline">
            BERITA ACARA SERAH TERIMA PEMBAGIAN TABUNGAN SISWA
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tahun Ajaran: {settings.activeAcademicYear}
          </p>
        </div>

        {/* Body Text */}
        <div className="text-xs leading-relaxed text-slate-800 space-y-3 mb-6">
          <p>
            Pada hari ini, <strong>{formatIndoDate(new Date())}</strong>, bertempat di {settings.schoolName}, telah dilaksanakan penyerahan dan pembagian dana tabungan siswa untuk Tahun Ajaran <strong>{settings.activeAcademicYear}</strong> dengan rincian sebagai berikut:
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Jumlah Siswa Penabung:</span>{' '}
              <strong>{distributedList.length} Orang</strong>
            </div>
            <div>
              <span className="text-slate-500">Total Dana Tabungan:</span>{' '}
              <strong className="font-mono text-emerald-800">{formatRupiah(totalAmount)}</strong>
            </div>
          </div>

          <p>
            Dana tabungan tersebut telah diserahkan secara tertib kepada masing-masing siswa / orang tua wali sebagaimana tercantum dalam daftar tanda terima terlampir.
          </p>
        </div>

        {/* Distribution Student Table */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Lampiran Daftar Siswa Penerima Dana Tabungan
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-300 text-[11px] font-bold text-slate-700">
                <th className="py-2 px-3 text-center w-10">No</th>
                <th className="py-2 px-3">NIS</th>
                <th className="py-2 px-3">Nama Siswa</th>
                <th className="py-2 px-3 text-center">Kelas</th>
                <th className="py-2 px-3 text-right">Nominal Tabungan (Rp)</th>
                <th className="py-2 px-3 text-center">Tanda Tangan / Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {distributedList.map((item) => (
                <tr key={item.nis} className="h-9">
                  <td className="py-1.5 px-3 text-center font-mono text-slate-500">{item.no}</td>
                  <td className="py-1.5 px-3 font-mono font-bold text-slate-800">{item.nis}</td>
                  <td className="py-1.5 px-3 font-bold text-slate-900">{item.name}</td>
                  <td className="py-1.5 px-3 text-center text-slate-600">Kelas {item.class}</td>
                  <td className="py-1.5 px-3 font-mono tabular-nums text-right font-medium text-slate-900">
                    {formatRupiah(item.amount)}
                  </td>
                  <td className="py-1.5 px-3 text-center">
                    <div className="h-6 border-b border-dashed border-slate-300 w-24 mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-xs">
                <td colSpan={4} className="py-2.5 px-3 uppercase text-center">
                  TOTAL DANA YANG DISERAHKAN
                </td>
                <td className="py-2.5 px-3 font-mono tabular-nums text-right text-emerald-800">
                  {formatRupiah(totalAmount)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signatures */}
        <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-center print-avoid-break">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Sekolah {settings.schoolName}</p>
            <div className="h-20"></div>
            <p className="font-bold underline text-slate-950">{settings.headmasterName}</p>
            <p className="text-[10px] text-slate-500">NIP. {settings.headmasterNip}</p>
          </div>

          <div>
            <p>Loloan Timur, {formatIndoDate(new Date())}</p>
            <p className="font-bold">Petugas Tabungan Siswa</p>
            <div className="h-20"></div>
            <p className="font-bold underline text-slate-950">{settings.treasurerName}</p>
            <p className="text-[10px] text-slate-500">NIP. {settings.treasurerNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
