import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  BookOpen,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Printer,
  FileSpreadsheet,
  RotateCcw,
  Keyboard
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoleTab?: 'ADMIN' | 'PETUGAS';
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  defaultRoleTab = 'PETUGAS',
}) => {
  const [activeGuideTab, setActiveGuideTab] = useState<'ADMIN' | 'PETUGAS'>(defaultRoleTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Buku Panduan & Petunjuk SIMTAB</h3>
              <p className="text-[11px] text-slate-500">Panduan operasional administrasi tabungan sekolah dasar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveGuideTab('PETUGAS')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeGuideTab === 'PETUGAS'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Petunjuk Petugas Tabungan</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('ADMIN')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeGuideTab === 'ADMIN'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Petunjuk Administrator Sekolah</span>
          </button>
        </div>

        {/* Guide Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {activeGuideTab === 'PETUGAS' ? (
            <div className="space-y-5">
              {/* Petunjuk Setoran */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Cara Melakukan Setoran Tabungan Harian</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-700 leading-relaxed">
                  <li>Buka menu <strong>Setoran</strong> di bilah navigasi kiri.</li>
                  <li>Ketik nama siswa atau NIS pada kolom pencarian (atau gunakan pemindai QR).</li>
                  <li>Pilih siswa dari hasil pencarian (saldo saat ini akan tampil di layar).</li>
                  <li>Masukkan nominal setoran atau gunakan tombol saran nominal (Rp 5.000, Rp 10.000, dst).</li>
                  <li>Tekan tombol <strong>Simpan Setoran</strong> (atau tekan tombol <strong>Enter</strong>).</li>
                  <li>Kuitansi resmi akan tampil otomatis dan dapat langsung dicetak. Form otomatis siap untuk siswa berikutnya!</li>
                </ol>
              </div>

              {/* Petunjuk Penarikan */}
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Cara Melakukan Penarikan Tabungan</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-700 leading-relaxed">
                  <li>Buka menu <strong>Penarikan</strong> di menu navigasi.</li>
                  <li>Cari dan pilih siswa yang akan menarik tabungan.</li>
                  <li>Sistem otomatis menampilkan saldo siswa. Pastikan nominal penarikan tidak melebihi saldo.</li>
                  <li>Masukkan nominal penarikan dan tuliskan keterangan penarikan (misal: keperluan seragam).</li>
                  <li>Klik <strong>Lanjutkan Penarikan</strong> dan periksa ringkasan pada kotak konfirmasi.</li>
                  <li>Klik <strong>Ya, Tarik Saldo</strong> untuk memproses transaksi.</li>
                </ol>
              </div>

              {/* Setoran Massal */}
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Setoran Massal Per Kelas</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-700 leading-relaxed">
                  <li>Buka menu <strong>Setoran Massal</strong>.</li>
                  <li>Pilih kelas sasaran (Kelas 1 s/d 6).</li>
                  <li>Jika nominal seluruh siswa sama, gunakan fitur <strong>Terapkan ke Semua</strong>.</li>
                  <li>Siswa yang tidak menabung cukup dikosongkan (sistem hanya mencatat siswa dengan nominal &gt; 0).</li>
                  <li>Periksa total rekapitulasi, lalu klik <strong>Simpan Semua Setoran</strong>.</li>
                </ol>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-slate-600" />
                  <span>Pintasan Keyboard (Keyboard Shortcut)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong>Ctrl / Cmd + K</strong>: Fokus pencarian siswa
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong>Enter</strong>: Simpan / Submit form
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong>Esc</strong>: Tutup kuitansi / modal
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Hak Akses & Tanggung Jawab Administrator</h4>
                <p className="text-slate-600 leading-relaxed">
                  Administrator memiliki kewenangan tertinggi dalam pengelolaan data sistem, pengaturan identitas sekolah, rekonsiliasi data saldo, dan pencadangan.
                </p>
              </div>

              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl p-3">
                  <div className="font-bold text-slate-900">1. Koreksi & Pembatalan Transaksi (Void)</div>
                  <p className="text-slate-600 mt-1">
                    Buka <strong>Riwayat Transaksi</strong>, temukan transaksi yang salah, lalu klik ikon panah putar (Koreksi). Masukkan alasan koreksi. Transaksi lama akan ditandai <code>VOID</code> dan saldo siswa disesuaikan secara otomatis.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3">
                  <div className="font-bold text-slate-900">2. Rekonsiliasi & Validasi Saldo Siswa</div>
                  <p className="text-slate-600 mt-1">
                    Buka menu <strong>Rekonsiliasi Data</strong>. Sistem akan menghitung ulang saldo siswa dari seluruh transaksi. Jika terdapat perbedaan antara saldo tersimpan dan saldo transaksi, Admin dapat menekan tombol <strong>Perbaiki Saldo</strong>.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3">
                  <div className="font-bold text-slate-900">3. Cadangan Data (Backup & Restore)</div>
                  <p className="text-slate-600 mt-1">
                    Lakukan backup secara berkala melalui menu <strong>Pengaturan</strong> &gt; <strong>Cadangkan Data (JSON)</strong>. File cadangan diberi nama otomatis dengan stempel waktu dan tanggal.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3">
                  <div className="font-bold text-slate-900">4. Manajemen Tahun Ajaran & Identitas</div>
                  <p className="text-slate-600 mt-1">
                    Ganti tahun ajaran aktif di menu <strong>Pengaturan</strong> saat pergantian tahun ajaran baru. Data tahun sebelumnya tetap tersimpan rapi dan dapat ditinjau kembali di laporan tahunan.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3">
                  <div className="font-bold text-slate-900">5. Audit Log Keamanan</div>
                  <p className="text-slate-600 mt-1">
                    Seluruh aktivitas penting (login, setoran, penarikan, edit, hapus siswa, dan pembatalan) tercatat rapi di menu <strong>Audit Log</strong> dan dapat diunduh dalam format Excel.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">SIMTAB v1.0.0 · SDN 1 Loloan Timur</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
