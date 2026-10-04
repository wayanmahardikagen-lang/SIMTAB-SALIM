import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
  History,
  BarChart3,
  School,
  Trophy,
  Gift,
  FileSpreadsheet,
  BookOpen,
  CalendarCheck,
  FileUp,
  FileDown,
  Settings,
  ShieldAlert,
  X,
  CreditCard,
  Scale,
  Activity,
  HelpCircle,
  Info,
  Coins,
  FileText,
  FileCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp?: () => void;
  onOpenAbout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenHelp, onOpenAbout }) => {
  const { activeTab, setActiveTab, currentUser, isDemo } = useApp();

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  const navItem = (tab: ActiveTab, label: string, icon: React.ReactNode, count?: number) => {
    const isActive = activeTab === tab;
    return (
      <button
        key={tab}
        onClick={() => handleNav(tab)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
          isActive
            ? 'bg-emerald-600 text-white shadow-xs font-semibold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`}>
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </div>
        {count !== undefined && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
              isActive ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  const isKepalaSekolah = currentUser?.role === 'KEPALA_SEKOLAH';
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`no-print fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <span className="text-sm font-bold text-slate-900">Menu SIMTAB</span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Group */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
            </div>
            <div className="space-y-0.5">
              {navItem('dashboard', 'Dashboard', <LayoutDashboard className="w-4 h-4" />)}
              {navItem('students', 'Data Siswa', <Users className="w-4 h-4" />)}
            </div>
          </div>

          {/* Transaksi Group */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Transaksi Tabungan
            </div>
            <div className="space-y-0.5">
              {!isKepalaSekolah && (
                <>
                  {navItem('deposit', 'Setoran', <ArrowDownLeft className="w-4 h-4 text-emerald-600" />)}
                  {navItem('withdraw', 'Penarikan', <ArrowUpRight className="w-4 h-4 text-amber-600" />)}
                  {navItem('mass-deposit', 'Setoran Massal', <Layers className="w-4 h-4" />)}
                  {navItem('cash-reconciliation', 'Rekonsiliasi Kas', <Coins className="w-4 h-4 text-amber-600" />)}
                </>
              )}
              {navItem('transactions', 'Riwayat Transaksi', <History className="w-4 h-4" />)}
            </div>
          </div>

          {/* Rekap & Juara Group */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Rekap & Prestasi
            </div>
            <div className="space-y-0.5">
              {navItem('recap', 'Rekap Tabungan', <BarChart3 className="w-4 h-4" />)}
              {navItem('recap-class', 'Rekap Kelas', <School className="w-4 h-4" />)}
              {navItem('champions', 'Juara Menabung', <Trophy className="w-4 h-4 text-amber-500" />)}
              {navItem('distribution', 'Pembagian Tabungan', <Gift className="w-4 h-4 text-indigo-500" />)}
            </div>
          </div>

          {/* Laporan Group */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cetak & Laporan
            </div>
            <div className="space-y-0.5">
              {navItem('report-student', 'Laporan Siswa', <FileSpreadsheet className="w-4 h-4" />)}
              {navItem('report-passbook', 'Buku Tabungan', <BookOpen className="w-4 h-4" />)}
              {navItem('report-yearend', 'Laporan Akhir Tahun', <CalendarCheck className="w-4 h-4" />)}
            </div>
          </div>

          {/* Data Transfer & Sistem Group */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Integrasi & Sistem
            </div>
            <div className="space-y-0.5">
              {!isKepalaSekolah &&
                navItem('import-excel', 'Import Excel', <FileUp className="w-4 h-4 text-blue-600" />)}
              {navItem('export-excel', 'Export Excel', <FileDown className="w-4 h-4 text-emerald-600" />)}

              {isAdmin && (
                <>
                  {navItem('initial-balance', 'Saldo Awal / Migrasi', <FileText className="w-4 h-4 text-blue-600" />)}
                  {navItem('reconciliation', 'Rekonsiliasi Data', <Scale className="w-4 h-4 text-amber-600" />)}
                  {navItem('system-health', 'Status Sistem', <Activity className="w-4 h-4 text-emerald-600" />)}
                  {navItem('uat-checklist', 'UAT Checklist', <FileCheck className="w-4 h-4 text-indigo-600" />)}
                  {navItem('settings', 'Pengaturan', <Settings className="w-4 h-4" />)}
                </>
              )}

              {(isAdmin || isKepalaSekolah) &&
                navItem('audit-log', 'Audit Log', <ShieldAlert className="w-4 h-4 text-rose-600" />)}
            </div>
          </div>

          {/* Quick Help & About Links */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            {onOpenHelp && (
              <button
                onClick={onOpenHelp}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Petunjuk Penggunaan</span>
              </button>
            )}

            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <Info className="w-4 h-4 text-slate-400" />
                <span>Tentang SIMTAB</span>
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
          <div className="font-semibold text-slate-700">SDN 1 Loloan Timur</div>
          <div className="text-[10px] text-slate-400">SIMTAB v1.0.0 · Production Ready</div>
        </div>
      </aside>
    </>
  );
};
