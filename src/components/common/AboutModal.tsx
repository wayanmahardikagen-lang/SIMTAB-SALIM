import React from 'react';
import { useApp } from '../../context/AppContext';
import { Info, X, Shield, School, Award, Heart } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-scale-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 mx-auto p-1 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">SIMTAB</h3>
          <p className="text-xs font-semibold text-emerald-700">Sistem Informasi Tabungan Siswa</p>
          <p className="text-[11px] text-slate-500">{settings.schoolName}</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl space-y-2.5 text-xs border border-slate-100">
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Versi Rilis:</span>
            <span className="font-mono font-bold text-slate-900">v1.0.0</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Tahun Pengembangan:</span>
            <span className="font-bold text-slate-900">2026</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Pengembang:</span>
            <span className="font-bold text-slate-900">Administrator Sekolah</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">NPSN Sekolah:</span>
            <span className="font-mono font-bold text-slate-900">{settings.npsn}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Alamat:</span>
            <span className="text-slate-900 text-right">{settings.address}</span>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400">
          Dirancang untuk transparansi dan ketepatan pengelolaan tabungan siswa sekolah dasar.
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Tutup Informasi
        </button>
      </div>
    </div>
  );
};
