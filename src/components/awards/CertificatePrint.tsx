import React from 'react';
import { ChampionRecord, SchoolSettings } from '../../types';
import { formatIndoDate, formatRupiah } from '../../utils/format';
import { Printer, X, Award } from 'lucide-react';

interface CertificatePrintProps {
  champion: ChampionRecord | null;
  periodLabel: string;
  settings: SchoolSettings;
  onClose: () => void;
}

export const CertificatePrint: React.FC<CertificatePrintProps> = ({
  champion,
  periodLabel,
  settings,
  onClose,
}) => {
  if (!champion) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-scale-up">
        {/* Modal Screen Header */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Piagam Penghargaan Juara Menabung - {champion.studentName}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Piagam</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Sheet (Printable A4 Landscape style) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100/50 print:bg-white print:p-0">
          <div className="mx-auto max-w-2xl bg-white border-8 border-double border-amber-600/80 p-8 sm:p-12 text-center rounded-xl shadow-lg relative print:shadow-none print:border-8 print:border-amber-700">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 text-amber-600 text-xs font-serif">❖</div>
            <div className="absolute top-2 right-2 text-amber-600 text-xs font-serif">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-600 text-xs font-serif">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-600 text-xs font-serif">❖</div>

            {/* School Crest */}
            <div className="w-16 h-16 mx-auto mb-3">
              <img
                src={settings.logoUrl}
                alt="Logo Sekolah"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-xs font-bold tracking-widest text-slate-700 uppercase">
              PEMERINTAH KABUPATEN JEMBRANA · DINAS PENDIDIKAN
            </p>
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-slate-900 mt-0.5">
              {settings.schoolName}
            </h2>
            <p className="text-[11px] text-slate-500">{settings.address}</p>

            <div className="my-5 flex items-center justify-center gap-3">
              <div className="h-0.5 w-16 bg-amber-500"></div>
              <span className="text-xl font-serif font-black tracking-widest text-amber-800 uppercase">
                PIAGAM PENGHARGAAN
              </span>
              <div className="h-0.5 w-16 bg-amber-500"></div>
            </div>

            <p className="text-xs text-slate-600 font-medium">Diberikan dengan bangga kepada:</p>

            {/* Student Name */}
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-950 my-3 tracking-tight border-b-2 border-slate-900 inline-block px-8 pb-1">
              {champion.studentName}
            </h1>

            <p className="text-xs text-slate-700 font-medium mt-1">
              Siswa Kelas <strong className="text-slate-900">{champion.class}</strong>
            </p>

            <p className="text-xs sm:text-sm text-slate-800 max-w-lg mx-auto leading-relaxed mt-4">
              Atas dedikasi, kedisiplinan, dan keteladanan yang luar biasa sebagai:
            </p>

            {/* Rank Badge */}
            <div className="my-4 inline-block px-5 py-2 rounded-xl bg-amber-50 border border-amber-300">
              <div className="text-base font-black uppercase tracking-wide text-amber-900">
                JUARA {champion.rank} SISWA TELADAN MENABUNG
              </div>
              <div className="text-xs font-semibold text-amber-800 mt-0.5">
                Tercatat Aktif Menabung Selama{' '}
                <strong className="font-mono text-sm underline">{champion.savingDaysCount} Hari</strong> ({periodLabel})
              </div>
            </div>

            <p className="text-[11px] text-slate-500 max-w-md mx-auto italic">
              "Menabung sejak dini adalah pangkal kemandirian dan kesuksesan masa depan."
            </p>

            {/* Formal Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 mt-4 text-xs text-center text-slate-800 border-t border-slate-200">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala Sekolah</p>
                <div className="h-14"></div>
                <p className="font-bold underline text-slate-950">{settings.headmasterName}</p>
                <p className="text-[10px] text-slate-500">NIP. {settings.headmasterNip}</p>
              </div>

              <div>
                <p>Loloan Timur, {formatIndoDate(new Date())}</p>
                <p className="font-bold">Petugas Tabungan Siswa</p>
                <div className="h-14"></div>
                <p className="font-bold underline text-slate-950">{settings.treasurerName}</p>
                <p className="text-[10px] text-slate-500">NIP. {settings.treasurerNip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
