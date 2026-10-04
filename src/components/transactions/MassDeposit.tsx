import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, getTodayDateString, parseCurrencyInput } from '../../utils/format';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Copy,
  Calendar,
  Wallet
} from 'lucide-react';

export const MassDeposit: React.FC = () => {
  const { students, createMassDeposit, settings, currentUser } = useApp();

  const [selectedClass, setSelectedClass] = useState<string>('5');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionDate, setTransactionDate] = useState(getTodayDateString());
  const [commonDescription, setCommonDescription] = useState('Setoran tabungan massal');
  const [depositAmounts, setDepositAmounts] = useState<Record<string, string>>({});
  const [uniformAmountStr, setUniformAmountStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active students in selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClass === 'all' || s.class === selectedClass;
      const matchStatus = s.status === 'Aktif';
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchStatus && matchSearch;
    });
  }, [students, selectedClass, searchQuery]);

  const handleAmountChange = (studentId: string, value: string) => {
    const num = parseCurrencyInput(value);
    setDepositAmounts((prev) => ({
      ...prev,
      [studentId]: num > 0 ? num.toLocaleString('id-ID') : '',
    }));
  };

  const handleApplyUniformAmount = () => {
    const num = parseCurrencyInput(uniformAmountStr);
    if (num <= 0) return;

    const newMap: Record<string, string> = {};
    classStudents.forEach((s) => {
      newMap[s.id] = num.toLocaleString('id-ID');
    });
    setDepositAmounts(newMap);
  };

  const handleClearAll = () => {
    setDepositAmounts({});
    setUniformAmountStr('');
  };

  // Calculations
  const depositItems = useMemo(() => {
    return Object.entries(depositAmounts)
      .map(([studentId, strVal]) => ({
        studentId,
        amount: parseCurrencyInput(strVal),
      }))
      .filter((item) => item.amount > 0);
  }, [depositAmounts]);

  const totalMassAmount = depositItems.reduce((acc, it) => acc + it.amount, 0);

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    const res = await createMassDeposit({
      date: transactionDate,
      description: commonDescription.trim() || 'Setoran tabungan massal',
      items: depositItems,
    });

    setIsSubmitting(false);

    if (res.success) {
      setDepositAmounts({});
      setUniformAmountStr('');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Setoran Tabungan Massal</h2>
            <p className="text-xs text-slate-500">
              Input setoran banyak siswa sekaligus per kelas secara cepat
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500 hidden sm:block">
          <div>Tahun Ajaran: <strong className="text-slate-800">{settings.activeAcademicYear}</strong></div>
          <div>Petugas: <strong>{currentUser?.name}</strong></div>
        </div>
      </div>

      {/* Control Panel Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Class Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setDepositAmounts({});
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white font-medium"
            >
              <option value="1">Kelas 1</option>
              <option value="2">Kelas 2</option>
              <option value="3">Kelas 3</option>
              <option value="4">Kelas 4</option>
              <option value="5">Kelas 5</option>
              <option value="6">Kelas 6</option>
              <option value="all">Semua Siswa</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Setoran
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Common Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              value={commonDescription}
              onChange={(e) => setCommonDescription(e.target.value)}
              placeholder="Setoran rutin..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Search within class */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cari Siswa
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nama / NIS..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Quick Batch Helpers: Uniform Amount & Clear */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Isi Nominal Sama:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold">Rp</span>
              <input
                type="text"
                value={uniformAmountStr}
                onChange={(e) => {
                  const num = parseCurrencyInput(e.target.value);
                  setUniformAmountStr(num > 0 ? num.toLocaleString('id-ID') : '');
                }}
                placeholder="Contoh: 10.000"
                className="w-28 px-2.5 py-1.5 font-mono text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={handleApplyUniformAmount}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-colors"
              >
                Terapkan Semua
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan Semua</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student List Table Form */}
      <form onSubmit={handleSubmitAll} className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 text-center w-12">No</th>
                  <th className="py-3 px-4">NIS</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4 text-right">Saldo Saat Ini</th>
                  <th className="py-3 px-4 text-right w-56">Nominal Setoran (Rp)</th>
                  <th className="py-3 px-4 text-right">Saldo Sesudah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      Tidak ada siswa ditemukan di kelas {selectedClass}.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((student, idx) => {
                    const rowAmountStr = depositAmounts[student.id] || '';
                    const rowAmount = parseCurrencyInput(rowAmountStr);
                    const newEstimatedBalance = student.balance + rowAmount;

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          rowAmount > 0 ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{student.nis}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{student.name}</td>
                        <td className="py-2.5 px-4 text-slate-600">Kelas {student.class}</td>
                        <td className="py-2.5 px-4 font-mono tabular-nums text-right text-slate-700">
                          {formatRupiah(student.balance)}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="relative inline-block w-full max-w-[180px]">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-[11px] text-slate-400">
                              Rp
                            </span>
                            <input
                              type="text"
                              value={rowAmountStr}
                              onChange={(e) => handleAmountChange(student.id, e.target.value)}
                              placeholder="0"
                              className="w-full pl-8 pr-2.5 py-1.5 font-mono font-bold text-right text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold tabular-nums text-right text-emerald-800">
                          {formatRupiah(newEstimatedBalance)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Sticky Summary & Submit Bar */}
          <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-300">
                Siswa yang Menabung: <strong className="text-white font-mono text-sm">{depositItems.length}</strong> siswa
              </div>
              <div className="text-xs text-slate-300">
                Total Uang Masuk:{' '}
                <strong className="text-emerald-400 font-mono text-base font-bold tabular-nums">
                  {formatRupiah(totalMassAmount)}
                </strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={depositItems.length === 0 || isSubmitting}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 ${
                depositItems.length > 0 && !isSubmitting
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 cursor-pointer font-black'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Menyimpan...'
                  : `SIMPAN SEMUA (${depositItems.length} SISWA)`}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
