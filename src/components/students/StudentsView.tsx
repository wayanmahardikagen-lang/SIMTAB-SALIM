import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { formatRupiah } from '../../utils/format';
import { exportStudentsToExcel } from '../../utils/excel';
import { StudentFormModal } from './StudentFormModal';
import { StudentDetailModal } from './StudentDetailModal';
import { ImportExcelModal } from './ImportExcelModal';
import { QrCodeModal } from './QrCodeModal';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  FileDown,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  QrCode,
  AlertCircle,
  CreditCard
} from 'lucide-react';

export const StudentsView: React.FC = () => {
  const {
    students,
    transactions,
    addStudent,
    updateStudent,
    deleteStudent,
    settings,
    selectedStudentForDetail,
    setSelectedStudentForDetail,
    currentUser,
  } = useApp();

  const isKepalaSekolah = currentUser?.role === 'KEPALA_SEKOLAH';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [qrStudent, setQrStudent] = useState<Student | null>(null);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nisn && s.nisn.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchClass = selectedClass === 'all' || s.class === selectedClass;
      const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;

      return matchSearch && matchClass && matchStatus;
    });
  }, [students, searchQuery, selectedClass, selectedStatus]);

  // Compute student stats
  const studentMetrics = useMemo(() => {
    const map = new Map<string, { totalDeposit: number; totalWithdrawal: number }>();
    students.forEach((s) => map.set(s.id, { totalDeposit: 0, totalWithdrawal: 0 }));

    transactions.forEach((t) => {
      if (t.status === 'VALID' && map.has(t.studentId)) {
        const current = map.get(t.studentId)!;
        if (t.type === 'SETORAN') current.totalDeposit += t.amount;
        if (t.type === 'PENARIKAN') current.totalWithdrawal += t.amount;
      }
    });

    return map;
  }, [students, transactions]);

  const handleExportExcel = () => {
    exportStudentsToExcel(filteredStudents, settings);
  };

  const handleCreateStudent = async (data: any) => {
    const res = await addStudent(data);
    if (res.success) {
      setIsAddModalOpen(false);
    }
  };

  const handleUpdateStudent = async (data: any) => {
    if (!editingStudent) return;
    const res = await updateStudent(editingStudent.id, data);
    if (res.success) {
      setEditingStudent(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    await deleteStudent(deletingStudent.id);
    setDeletingStudent(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Data Siswa Penabung</h2>
          <p className="text-xs text-slate-500">
            Kelola data siswa, generate kartu QR, pantau saldo, dan ekspor data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isKepalaSekolah && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import Excel</span>
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          {!isKepalaSekolah && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, NIS, atau NISN..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
          >
            <option value="all">Semua Kelas</option>
            <option value="1">Kelas 1</option>
            <option value="2">Kelas 2</option>
            <option value="3">Kelas 3</option>
            <option value="4">Kelas 4</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Lulus">Lulus</option>
            <option value="Pindah">Pindah</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3.5 text-center">No</th>
                <th className="py-3 px-3.5">NIS/NISN</th>
                <th className="py-3 px-3.5">Nama Siswa</th>
                <th className="py-3 px-3.5">Kelas</th>
                <th className="py-3 px-3.5 text-center">L/P</th>
                <th className="py-3 px-3.5 text-right">Saldo Tabungan</th>
                <th className="py-3 px-3.5 text-right">Total Setoran</th>
                <th className="py-3 px-3.5 text-right">Total Penarikan</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Aksi & QR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">Belum ada data siswa ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const m = studentMetrics.get(student.id) || { totalDeposit: 0, totalWithdrawal: 0 };
                  const isZeroBalance = student.balance === 0;
                  const isLowBalance = student.balance > 0 && student.balance < settings.lowBalanceThreshold;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3.5">
                        <div className="font-mono font-bold text-slate-900">{student.nis}</div>
                        {student.nisn && <div className="text-[10px] text-slate-400 font-mono">{student.nisn}</div>}
                      </td>
                      <td className="py-3 px-3.5">
                        <button
                          onClick={() => setSelectedStudentForDetail(student)}
                          className="font-bold text-slate-900 hover:text-emerald-700 text-left transition-colors"
                        >
                          {student.name}
                        </button>
                        {student.parentName && (
                          <div className="text-[10px] text-slate-400">Wali: {student.parentName}</div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700">Kelas {student.class}</td>
                      <td className="py-3 px-3.5 text-center font-semibold text-slate-600">{student.gender}</td>
                      <td className="py-3 px-3.5 text-right">
                        <span className="font-mono font-bold tabular-nums text-emerald-800 block">
                          {formatRupiah(student.balance)}
                        </span>
                        {/* Requirement 19: Low balance notifications */}
                        {isZeroBalance && (
                          <span className="text-[10px] font-semibold text-slate-400 block">
                            Saldo Rp0
                          </span>
                        )}
                        {isLowBalance && (
                          <span className="text-[10px] font-semibold text-amber-600 block">
                            Saldo rendah
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 font-mono tabular-nums text-right text-slate-600">
                        {formatRupiah(m.totalDeposit)}
                      </td>
                      <td className="py-3 px-3.5 font-mono tabular-nums text-right text-slate-600">
                        {formatRupiah(m.totalWithdrawal)}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`font-semibold ${
                            student.status === 'Aktif'
                              ? 'text-emerald-700'
                              : student.status === 'Lulus'
                              ? 'text-blue-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Generate QR & Card Button (Requirement 7 & 9) */}
                          <button
                            onClick={() => setQrStudent(student)}
                            title="Generate QR Code & Kartu Tabungan Siswa"
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setSelectedStudentForDetail(student)}
                            title="Lihat Detail Profil Siswa"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!isKepalaSekolah && (
                            <button
                              onClick={() => setEditingStudent(student)}
                              title="Edit Data Siswa"
                              className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {currentUser?.role === 'ADMIN' && (
                            <button
                              onClick={() => setDeletingStudent(student)}
                              title="Hapus Data Siswa"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredStudents.length} dari {students.length} siswa</span>
          <span>
            Total Saldo Terfilter:{' '}
            <strong className="font-mono text-slate-900">
              {formatRupiah(filteredStudents.reduce((acc, s) => acc + s.balance, 0))}
            </strong>
          </span>
        </div>
      </div>

      {/* Modals */}
      <StudentFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateStudent}
      />

      <StudentFormModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSubmit={handleUpdateStudent}
        initialData={editingStudent}
      />

      <StudentDetailModal
        student={selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
      />

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <QrCodeModal
        student={qrStudent}
        settings={settings}
        onClose={() => setQrStudent(null)}
      />

      {/* Delete Confirmation */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900">Hapus Data Siswa?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus data <strong>{deletingStudent.name}</strong> (NIS: {deletingStudent.nis})?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
