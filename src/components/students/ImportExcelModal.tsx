import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { generateStudentImportTemplate, parseStudentsExcel, ParsedImportRow } from '../../utils/excel';
import { formatRupiah } from '../../utils/format';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Download,
  AlertCircle
} from 'lucide-react';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({ isOpen, onClose }) => {
  const { students, batchImportStudents } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const existingNisList = students.map((s) => s.nis);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const buffer = await file.arrayBuffer();
      const rows = await parseStudentsExcel(buffer, existingNisList);
      setParsedRows(rows);
      if (rows.length === 0) {
        setErrorMessage('File tidak memiliki data siswa yang dapat dibaca. Pastikan format tabel sesuai dengan template.');
      }
    } catch (err: any) {
      setErrorMessage('Gagal membaca file Excel. Pastikan file dalam format .xlsx atau .xls yang valid.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleConfirmImport = () => {
    if (validRows.length === 0) return;

    const formattedData = validRows.map((r) => ({
      nis: r.nis,
      nisn: r.nisn,
      name: r.name,
      class: r.class,
      gender: r.gender,
      parentName: r.parentName,
      parentPhone: r.parentPhone,
      status: 'Aktif' as const,
      initialBalance: r.initialBalance,
      notes: r.notes,
    }));

    batchImportStudents(formattedData);
    onClose();
  };

  const handleReset = () => {
    setParsedRows([]);
    setFileName('');
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Import Data Siswa dari Excel</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Instructions and Template Download */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-emerald-950">
            <div>
              <div className="font-bold mb-1">Panduan Format Import Excel:</div>
              <p className="text-emerald-900 leading-relaxed">
                Gunakan template resmi SIMTAB. Sistem akan otomatis memvalidasi NIS agar tidak duplikat dan memeriksa kelengkapan nama serta kelas siswa.
              </p>
            </div>
            <button
              onClick={() => generateStudentImportTemplate()}
              className="shrink-0 px-3.5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Format Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {parsedRows.length === 0 ? (
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer block">
                <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <div className="text-sm font-bold text-slate-800">
                  {isProcessing ? 'Memproses Berkas...' : 'Klik untuk Memilih Berkas Excel'}
                </div>
                <p className="text-xs text-slate-500 mt-1">Mendukung format .xlsx, .xls</p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">{fileName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600">{parsedRows.length} baris terdeteksi</span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                >
                  Ganti File
                </button>
              </div>

              {/* Validation Summary Badges */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <div>
                    <strong>{validRows.length}</strong> Data Siswa Siap Diimport
                  </div>
                </div>

                <div
                  className={`p-3 border rounded-xl flex items-center gap-2 ${
                    invalidRows.length > 0
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <AlertTriangle
                    className={`w-4 h-4 ${invalidRows.length > 0 ? 'text-rose-600' : 'text-slate-400'}`}
                  />
                  <div>
                    <strong>{invalidRows.length}</strong> Baris Bermasalah (Dilewati)
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                        <th className="py-2.5 px-3">Baris</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">NIS</th>
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        <th className="py-2.5 px-3">Kelas</th>
                        <th className="py-2.5 px-3">L/P</th>
                        <th className="py-2.5 px-3">Orang Tua</th>
                        <th className="py-2.5 px-3 text-right">Saldo Awal</th>
                        <th className="py-2.5 px-3">Keterangan / Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((row) => (
                        <tr
                          key={row.rowNum}
                          className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40 text-rose-950'}
                        >
                          <td className="py-2 px-3 font-mono text-slate-500">{row.rowNum}</td>
                          <td className="py-2 px-3">
                            {row.isValid ? (
                              <span className="font-semibold text-emerald-700">Valid</span>
                            ) : (
                              <span className="font-semibold text-rose-600">Gagal</span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{row.nis}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{row.name}</td>
                          <td className="py-2 px-3 text-slate-600">{row.class}</td>
                          <td className="py-2 px-3 text-slate-600">{row.gender}</td>
                          <td className="py-2 px-3 text-slate-600">{row.parentName || '-'}</td>
                          <td className="py-2 px-3 font-mono tabular-nums text-right text-slate-800">
                            {formatRupiah(row.initialBalance)}
                          </td>
                          <td className="py-2 px-3">
                            {row.isValid ? (
                              <span className="text-emerald-700 font-medium">Siap dimasukkan</span>
                            ) : (
                              <span className="text-rose-600 font-medium">{row.errors.join(', ')}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={validRows.length === 0}
            onClick={handleConfirmImport}
            className={`px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 ${
              validRows.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Konfirmasi & Import ({validRows.length} Siswa)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
