import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { formatRupiah } from '../../utils/format';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  X,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (student: Student, action: 'deposit' | 'withdraw') => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const { students } = useApp();

  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualQuery, setManualQuery] = useState('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setScannedStudent(null);
      setScannerError(null);
      setManualQuery('');
      return;
    }

    // Start scanner after modal opens
    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setScannerError(null);
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setScannerError('Kamera tidak terdeteksi pada perangkat ini. Silakan gunakan pencarian manual nama/NIS di bawah.');
        return;
      }

      setIsScanning(true);
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleDecodedQr(decodedText);
        },
        (errorMessage) => {
          // ignore transient frame decode errors
        }
      );
    } catch (err: any) {
      console.warn('Scanner error:', err);
      setScannerError('Tidak dapat mengakses kamera (izin ditolak atau kamera sedang digunakan aplikasi lain). Anda dapat mencari siswa secara manual di bawah.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleDecodedQr = (text: string) => {
    // Expected format: "SIMTAB:STD:std-001" or "std-001" or NIS
    let targetId = text.trim();
    if (targetId.startsWith('SIMTAB:STD:')) {
      targetId = targetId.replace('SIMTAB:STD:', '');
    }

    const found = students.find(
      (s) =>
        s.id === targetId ||
        s.nis === targetId ||
        (s.qrCodeData && s.qrCodeData === text.trim())
    );

    if (found) {
      setScannedStudent(found);
      stopScanner();
    } else {
      setScannerError(`QR Code "${text}" tidak cocok dengan data siswa mana pun.`);
    }
  };

  // Manual fallback search
  const manualResults = manualQuery.trim()
    ? students
        .filter(
          (s) =>
            s.status === 'Aktif' &&
            (s.name.toLowerCase().includes(manualQuery.toLowerCase()) ||
              s.nis.toLowerCase().includes(manualQuery.toLowerCase()))
        )
        .slice(0, 4)
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Scan QR Code Siswa</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {!scannedStudent ? (
            <>
              {/* Camera Scanner Viewport */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-square max-w-[280px] mx-auto border-2 border-dashed border-slate-300 flex items-center justify-center">
                <div id={scannerContainerId} className="w-full h-full"></div>
                {!isScanning && !scannerError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
                    <span className="text-xs">Menyiapkan kamera...</span>
                  </div>
                )}
              </div>

              {scannerError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{scannerError}</span>
                </div>
              )}

              {/* Manual search fallback (Requirement 8) */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Atau Cari Siswa Manual (Nama / NIS):
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    placeholder="Ketik nama atau NIS siswa..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 focus:bg-white"
                  />
                </div>

                {manualResults.length > 0 && (
                  <div className="mt-2 border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-36 overflow-y-auto bg-white shadow-xs">
                    {manualResults.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setScannedStudent(s);
                          stopScanner();
                        }}
                        className="w-full p-2.5 text-left text-xs flex items-center justify-between hover:bg-indigo-50/50"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-slate-500">NIS: {s.nis} · Kelas {s.class}</div>
                        </div>
                        <div className="font-mono font-bold text-emerald-700">
                          {formatRupiah(s.balance)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Scanned Student Information and Instant Action Buttons */
            <div className="space-y-4 animate-scale-up">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-base flex items-center justify-center mx-auto mb-2">
                  {scannedStudent.name.charAt(0)}
                </div>
                <div className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
                  Siswa Ditemukan
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {scannedStudent.name}
                </h3>
                <p className="text-xs text-slate-600">
                  NIS: <span className="font-mono font-bold">{scannedStudent.nis}</span> · Kelas {scannedStudent.class}
                </p>

                <div className="pt-3 mt-2 border-t border-emerald-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Saldo Tabungan Terkini
                  </span>
                  <span className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
                    {formatRupiah(scannedStudent.balance)}
                  </span>
                </div>
              </div>

              {/* Action Choices (Requirement 8) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onSelectAction(scannedStudent, 'deposit');
                    onClose();
                  }}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs transition-all"
                >
                  <ArrowDownLeft className="w-5 h-5" />
                  <span>SETORAN</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectAction(scannedStudent, 'withdraw');
                    onClose();
                  }}
                  className="py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs transition-all"
                >
                  <ArrowUpRight className="w-5 h-5" />
                  <span>PENARIKAN</span>
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setScannedStudent(null);
                    startScanner();
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Scan Siswa Lain
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
