import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, UserCheck, Lock, User, ArrowRight, Award, Cloud, KeyRound, Mail, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';

export const LoginView: React.FC = () => {
  const { login, loginWithGoogle, settings, isSyncingFirebase, showNotification } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingInGoogle(true);
      await loginWithGoogle();
    } finally {
      setIsLoggingInGoogle(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setIsSendingReset(true);
    setResetMessage(null);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetMessage({
        type: 'success',
        text: `Tautan reset kata sandi telah dikirim ke email ${resetEmail}. Silakan periksa kotak masuk atau spam email Anda.`
      });
      showNotification('success', 'Email reset kata sandi berhasil dikirim.');
    } catch (err: any) {
      console.warn('Password reset notice:', err);
      // Friendly message
      setResetMessage({
        type: 'error',
        text: 'Tidak dapat mengirim email reset. Pastikan alamat email terdaftar dan koneksi internet stabil.'
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    if (role === 'ADMIN') {
      setUsername('admin');
      setPassword('admin123');
      login('admin', 'ADMIN');
    } else if (role === 'KEPALA_SEKOLAH') {
      setUsername('kepsek');
      setPassword('kepsek123');
      login('kepsek', 'KEPALA_SEKOLAH');
    } else {
      setUsername('petugas');
      setPassword('petugas123');
      login('petugas', 'PETUGAS');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 p-1 bg-white rounded-2xl shadow-md">
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight">SIMTAB</h2>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Sistem Informasi Tabungan Siswa
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{settings.schoolName}</p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded-full border border-slate-700/60 text-[11px]">
            <Cloud className={`w-3.5 h-3.5 ${isSyncingFirebase ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="text-slate-300">
              {isSyncingFirebase ? 'Sinkronisasi Realtime Cloud Firestore' : 'Database Aktif'}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoggingInGoogle}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-all shadow-xs flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoggingInGoogle ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[11px] text-slate-400 font-medium uppercase">Atau login petugas</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pengguna / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setResetMessage(null);
                }}
                className="text-[11px] text-slate-500 hover:text-emerald-700 font-medium transition-colors cursor-pointer"
              >
                Lupa Kata Sandi?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Masuk ke SIMTAB</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Presets for Evaluation & Role Switching */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Pilihan Role / Akses Cepat
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-indigo-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">Akses penuh</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('PETUGAS')}
                className="p-2.5 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-emerald-700">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Petugas</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">Transaksi</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('KEPALA_SEKOLAH')}
                className="p-2.5 bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-amber-700">
                  <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Kepsek</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">Laporan</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-scale-up relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 pt-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Lupa Kata Sandi?</h3>
              <p className="text-xs text-slate-500">
                Masukkan alamat email yang terdaftar untuk menerima tautan pemulihan kata sandi resmi dari Firebase Authentication.
              </p>
            </div>

            {resetMessage && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  resetMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {resetMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>{resetMessage.text}</div>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email Akun
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="nama@sekolah.sch.id atau gmail..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Kembali ke Login
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset || !resetEmail.trim()}
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSendingReset ? 'Mengirim...' : 'Kirim Tautan Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
