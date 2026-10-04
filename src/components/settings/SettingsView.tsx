import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolSettings, AcademicYear } from '../../types';
import {
  Settings,
  School,
  Calendar,
  Users,
  Database,
  Save,
  Plus,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSchoolSettings,
    academicYears,
    updateAcademicYears,
    students,
    transactions,
    auditLogs,
    resetDataToDemo,
    clearDataClean,
    currentUser,
    isDemo,
    distributions,
    showNotification,
  } = useApp();

  // School identity state
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [npsn, setNpsn] = useState(settings.npsn);
  const [address, setAddress] = useState(settings.address);
  const [headmasterName, setHeadmasterName] = useState(settings.headmasterName);
  const [headmasterNip, setHeadmasterNip] = useState(settings.headmasterNip);
  const [treasurerName, setTreasurerName] = useState(settings.treasurerName);
  const [treasurerNip, setTreasurerNip] = useState(settings.treasurerNip);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);

  // New academic year form
  const [newYearName, setNewYearName] = useState('');
  const [showAddYear, setShowAddYear] = useState(false);

  // Clear demo confirmation state
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [confirmInputText, setConfirmInputText] = useState('');

  // JSON Restore file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolSettings({
      ...settings,
      schoolName: schoolName.trim(),
      npsn: npsn.trim(),
      address: address.trim(),
      headmasterName: headmasterName.trim(),
      headmasterNip: headmasterNip.trim(),
      treasurerName: treasurerName.trim(),
      treasurerNip: treasurerNip.trim(),
      logoUrl: logoUrl.trim(),
    });
  };

  const handleSetActiveYear = (id: string) => {
    const updated = academicYears.map((ay) => ({
      ...ay,
      isActive: ay.id === id,
    }));
    updateAcademicYears(updated);
  };

  const handleAddAcademicYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName.trim()) return;

    const newYear: AcademicYear = {
      id: 'ay-' + Date.now(),
      name: newYearName.trim(),
      isActive: false,
    };
    updateAcademicYears([...academicYears, newYear]);
    setNewYearName('');
    setShowAddYear(false);
  };

  // JSON Backup (Requirement 15: SIMTAB_BACKUP_YYYY-MM-DD_HH-mm.json)
  const handleExportJsonBackup = () => {
    const payload = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      school: settings.schoolName,
      settings,
      academicYears,
      students,
      transactions,
      distributions,
      auditLogs,
    };

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const filename = `SIMTAB_BACKUP_${timeStr}.json`;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('success', `File cadangan ${filename} berhasil diunduh.`);
  };

  // JSON Restore (Requirement 16: auto-backup before restore)
  const handleRestoreJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Automatic pre-restore backup
    handleExportJsonBackup();
    showNotification('info', 'Backup otomatis dibuat sebelum proses restore.');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.students && Array.isArray(parsed.students)) {
          localStorage.setItem('simtab_v2_students', JSON.stringify(parsed.students));
          if (parsed.transactions) {
            localStorage.setItem('simtab_v2_transactions', JSON.stringify(parsed.transactions));
          }
          if (parsed.settings) {
            localStorage.setItem('simtab_v2_settings', JSON.stringify(parsed.settings));
          }
          if (parsed.academicYears) {
            localStorage.setItem('simtab_v2_academic_years', JSON.stringify(parsed.academicYears));
          }
          if (parsed.distributions) {
            localStorage.setItem('simtab_v2_distributions', JSON.stringify(parsed.distributions));
          }
          showNotification('success', 'Data berhasil dipulihkan dari cadangan. Memuat ulang sistem...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showNotification('error', 'Format berkas cadangan JSON tidak valid atau struktur tidak cocok.');
        }
      } catch {
        showNotification('error', 'Gagal membaca berkas cadangan JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmClearDemo = () => {
    if (confirmInputText.trim().toUpperCase() !== 'BERSIHKAN') {
      showNotification('error', 'Teks konfirmasi salah. Ketik BERSIHKAN untuk melanjutkan.');
      return;
    }
    clearDataClean();
    setShowClearConfirmModal(false);
    setConfirmInputText('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Pengaturan Sistem Tabungan</h2>
            <p className="text-xs text-slate-500">
              Konfigurasi data sekolah, tahun ajaran aktif, dan cadangan basis data
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: School Identity */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <School className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Identitas Sekolah & Petugas</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Sekolah
            </label>
            <input
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NPSN (Nomor Pokok Sekolah Nasional)
            </label>
            <input
              type="text"
              required
              value={npsn}
              onChange={(e) => setNpsn(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Sekolah
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Kepala Sekolah
            </label>
            <input
              type="text"
              required
              value={headmasterName}
              onChange={(e) => setHeadmasterName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIP Kepala Sekolah
            </label>
            <input
              type="text"
              required
              value={headmasterNip}
              onChange={(e) => setHeadmasterNip(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Petugas Tabungan
            </label>
            <input
              type="text"
              required
              value={treasurerName}
              onChange={(e) => setTreasurerName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIP Petugas Tabungan
            </label>
            <input
              type="text"
              required
              value={treasurerNip}
              onChange={(e) => setTreasurerNip(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Identitas Sekolah</span>
          </button>
        </div>
      </form>

      {/* Section 2: Academic Year Management (Section 22) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Manajemen Tahun Ajaran</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAddYear(!showAddYear)}
            className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Tahun Ajaran</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Sistem mendukung pergantian tahun ajaran. Data transaksi pada tahun ajaran sebelumnya akan tetap tersimpan secara permanen dan dapat dilihat kapan saja.
        </p>

        {showAddYear && (
          <form onSubmit={handleAddAcademicYear} className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-center gap-2 text-xs">
            <input
              type="text"
              required
              placeholder="Contoh: 2028/2029"
              value={newYearName}
              onChange={(e) => setNewYearName(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setShowAddYear(false)}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
            >
              Batal
            </button>
          </form>
        )}

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {academicYears.map((year) => (
            <div
              key={year.id}
              className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 text-sm">{year.name}</span>
                {year.isActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Aktif Saat Ini
                  </span>
                )}
              </div>

              {!year.isActive && (
                <button
                  type="button"
                  onClick={() => handleSetActiveYear(year.id)}
                  className="px-3 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Jadikan Aktif
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Data Backup, Restore & Demo Reset (Section 32 & 35) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">Cadangan & Pemulihan Data (Backup & Restore)</h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Amankan data tabungan siswa dengan mengunduh berkas cadangan JSON atau memulihkan data yang pernah disimpan sebelumnya.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Cadangkan Data (JSON)</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Unduh seluruh berkas data siswa, histori transaksi, audit log, dan pengaturan ke komputer.
            </p>
            <button
              type="button"
              onClick={handleExportJsonBackup}
              className="mt-2 w-full py-2 px-3 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            >
              Unduh File Cadangan JSON
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Pulihkan Data (JSON Restore)</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Muat kembali data dari berkas cadangan JSON yang pernah diunduh sebelumnya.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleRestoreJson}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 w-full py-2 px-3 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            >
              Pilih Berkas JSON Restore
            </button>
          </div>
        </div>

        {/* Demo Data Management */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Kontrol Data Contoh (Demo Data)</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={resetDataToDemo}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Muat Ulang Data Simulasi / Demo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowClearConfirmModal(true);
                setConfirmInputText('');
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Data Demo (Mulai Data Riil)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: User Accounts & Role Management (Requirement 8 & 32) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Manajemen Pengguna & Hak Akses (RBAC)</h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Firebase Auth Provider</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Daftar akun petugas dan staf yang berwenang mengakses SIMTAB. Akun yang dinonaktifkan tidak dapat login, namun histori transaksi dan audit log tetap tersimpan permanen.
        </p>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <div className="font-bold text-slate-900">I Putu Suardana (Admin Utama)</div>
              <div className="text-[11px] text-slate-500 font-mono">admin · wayanmahardikagen@gmail.com</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                ADMIN
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Aktif
              </span>
            </div>
          </div>

          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <div className="font-bold text-slate-900">Ni Made Lestari (Petugas Tabungan)</div>
              <div className="text-[11px] text-slate-500 font-mono">petugas · petugas@sdn1loloantimur.sch.id</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                PETUGAS
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Aktif
              </span>
            </div>
          </div>

          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <div className="font-bold text-slate-900">Drs. I Wayan Sudarma, M.Pd. (Kepala Sekolah)</div>
              <div className="text-[11px] text-slate-500 font-mono">kepsek · kepsek@sdn1loloantimur.sch.id</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                KEPALA_SEKOLAH
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Aktif (Read-Only)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Level Confirmation Modal for Clearing Demo Data */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Penghapusan Data Demo</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tindakan ini akan mengosongkan seluruh data simulasi siswa dan transaksi demo agar aplikasi bersih dan siap digunakan untuk data riil sekolah.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold">Sebelum melanjutkan:</div>
              <p>Pastikan Anda telah mengunduh cadangan file JSON jika sewaktu-waktu membutuhkan data simulasi ini kembali.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ketik <strong className="text-rose-600 font-mono">BERSIHKAN</strong> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                value={confirmInputText}
                onChange={(e) => setConfirmInputText(e.target.value)}
                placeholder="Ketik BERSIHKAN..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 font-mono text-center font-bold tracking-wider"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={confirmInputText.trim().toUpperCase() !== 'BERSIHKAN'}
                onClick={handleConfirmClearDemo}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Hapus Data Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
