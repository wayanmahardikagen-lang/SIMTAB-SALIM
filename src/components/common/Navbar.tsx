import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  UserCheck,
  ShieldCheck,
  LogOut,
  Menu,
  Calendar,
  X,
  ArrowUpRight,
  HelpCircle,
  Info,
  Award,
  FlaskConical,
  Database,
  Sparkles,
  Trash2
} from 'lucide-react';
import { formatRupiah } from '../../utils/format';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  onOpenHelp?: () => void;
  onOpenAbout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  onOpenHelp,
  onOpenAbout,
}) => {
  const {
    currentUser,
    logout,
    settings,
    students,
    setSelectedStudentForDetail,
    setActiveTab,
    isDemo,
    load100TestStudentsDataset,
    clearTestDatasetToEmpty,
  } = useApp();

  const [showTestMenu, setShowTestMenu] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close search dropdown on click outside and listen to Ctrl+K shortcut
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchResults(true);
      } else if (event.key === 'Escape') {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const searchResults = searchQuery.trim()
    ? students
        .filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.nisn && s.nisn.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  const handleSelectStudent = (student: typeof students[0]) => {
    setSelectedStudentForDetail(student);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <header className="no-print sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile toggle & Brand Title */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none cursor-pointer"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <img
            src={settings.logoUrl}
            alt="Logo"
            className="w-9 h-9 object-contain rounded-full border border-slate-200"
            referrerPolicy="no-referrer"
          />
          <div className="leading-tight">
            <h1 className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              SIMTAB
            </h1>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block whitespace-nowrap">
              {settings.schoolName}
            </p>
          </div>
        </div>
      </div>

      {/* Zone 2: Global Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Cari siswa (Tekan Ctrl+K)..."
            className="w-full pl-9 pr-14 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200/60 rounded border border-slate-300/60">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* Live Search Dropdown */}
        {showSearchResults && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-40 max-h-80 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Siswa tidak ditemukan untuk "{searchQuery}"
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50">
                  Hasil Pencarian Siswa ({searchResults.length})
                </div>
                {searchResults.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStudent(s)}
                    className="w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5">
                        {s.name}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
                      </div>
                      <div className="text-[11px] text-slate-500">
                        NIS: <span className="font-mono">{s.nis}</span> · Kelas {s.class} · {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-emerald-700">
                        {formatRupiah(s.balance)}
                      </div>
                      <span className="text-[10px] text-slate-400">Saldo saat ini</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zone 3: Academic Year, Help, About, User Profile & Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Academic Year Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-100">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>TA {settings.activeAcademicYear}</span>
        </div>

        {/* Environment Mode Badge (Requirement 2 & 3) */}
        <div className="relative">
          {isDemo ? (
            <button
              onClick={() => setShowTestMenu((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-xs cursor-pointer border border-amber-600/30"
              title="Klik untuk opsi dataset simulasi UAT"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">MODE UJI / TEST</span>
              <span className="sm:hidden">UJI</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white rounded-lg shadow-xs border border-emerald-700/30">
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PRODUKSI</span>
            </div>
          )}

          {/* Test Environment Dropdown Menu */}
          {showTestMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 space-y-2">
              <div className="text-[11px] font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                <span>Lingkungan Uji Coba (UAT)</span>
                <button onClick={() => setShowTestMenu(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Data simulasi tidak akan mencemari data produksi. Anda dapat memuat 100 siswa uji dan membersihkannya kapan saja.
              </p>
              <div className="space-y-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    load100TestStudentsDataset();
                    setShowTestMenu(false);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs text-left font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Muat 100 Siswa Simulasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearTestDatasetToEmpty();
                    setShowTestMenu(false);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs text-left font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Bersihkan Data Uji (Kosongkan)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Guide Trigger */}
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            title="Buku Petunjuk Aplikasi"
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Petunjuk Penggunaan"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        {/* About SIMTAB Trigger */}
        {onOpenAbout && (
          <button
            onClick={onOpenAbout}
            title="Tentang SIMTAB"
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Tentang SIMTAB"
          >
            <Info className="w-4 h-4" />
          </button>
        )}

        {/* User Card */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight max-w-[140px] truncate">
                {currentUser.name}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                {currentUser.role === 'ADMIN' ? (
                  <ShieldCheck className="w-3 h-3 text-indigo-600 inline" />
                ) : currentUser.role === 'KEPALA_SEKOLAH' ? (
                  <Award className="w-3 h-3 text-amber-600 inline" />
                ) : (
                  <UserCheck className="w-3 h-3 text-emerald-600 inline" />
                )}
                <span>{currentUser.role}</span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Keluar dari Akun"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
