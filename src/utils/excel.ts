import * as XLSX from 'xlsx';
import { Student, Transaction, SchoolSettings, ChampionRecord, ClassRecapItem } from '../types';
import { formatIndoDate, formatRupiah } from './format';

/**
 * Trigger browser file download from Blob
 */
function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Export Students to Excel
 */
export function exportStudentsToExcel(students: Student[], school: SchoolSettings) {
  const rows = [
    [school.schoolName.toUpperCase()],
    ['DATA TABUNGAN SISWA'],
    [`Tahun Ajaran: ${school.activeAcademicYear}`],
    [`Tanggal Cetak: ${formatIndoDate(new Date())}`],
    [],
    ['No', 'NIS', 'NISN', 'Nama Siswa', 'Kelas', 'L/P', 'Nama Orang Tua', 'No. HP', 'Status', 'Saldo Tabungan (Rp)']
  ];

  let totalBalance = 0;
  students.forEach((s, idx) => {
    totalBalance += s.balance;
    rows.push([
      (idx + 1).toString(),
      s.nis,
      s.nisn || '-',
      s.name,
      s.class,
      s.gender,
      s.parentName || '-',
      s.parentPhone || '-',
      s.status,
      s.balance as any
    ]);
  });

  rows.push([]);
  rows.push(['', '', '', '', '', '', '', '', 'TOTAL SALDO', totalBalance as any]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 16 },
    { wch: 25 },
    { wch: 10 },
    { wch: 6 },
    { wch: 22 },
    { wch: 16 },
    { wch: 12 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
  downloadWorkbook(wb, `Data_Siswa_${school.schoolName.replace(/\s+/g, '_')}_${school.activeAcademicYear.replace(/\//g, '-')}.xlsx`);
}

/**
 * Export Transactions to Excel
 */
export function exportTransactionsToExcel(transactions: Transaction[], school: SchoolSettings, titleFilter = 'Semua Transaksi') {
  const rows = [
    [school.schoolName.toUpperCase()],
    [`RIWAYAT TRANSAKSI TABUNGAN - ${titleFilter.toUpperCase()}`],
    [`Tahun Ajaran: ${school.activeAcademicYear}`],
    [`Tanggal Export: ${formatIndoDate(new Date())}`],
    [],
    [
      'No',
      'No. Transaksi',
      'Tanggal',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Jenis',
      'Nominal (Rp)',
      'Saldo Sebelum (Rp)',
      'Saldo Sesudah (Rp)',
      'Petugas',
      'Keterangan',
      'Status'
    ]
  ];

  let totalDeposit = 0;
  let totalWithdraw = 0;

  transactions.forEach((t, idx) => {
    if (t.status === 'VALID') {
      if (t.type === 'SETORAN') totalDeposit += t.amount;
      if (t.type === 'PENARIKAN') totalWithdraw += t.amount;
    }
    rows.push([
      (idx + 1).toString(),
      t.id,
      t.date,
      t.studentId,
      t.studentName,
      t.class,
      t.type,
      t.amount as any,
      t.previousBalance as any,
      t.newBalance as any,
      t.createdBy,
      t.description || '-',
      t.status
    ]);
  });

  rows.push([]);
  rows.push(['', '', '', '', '', '', 'TOTAL SETORAN VALID', totalDeposit as any, '', '', '', '', '']);
  rows.push(['', '', '', '', '', '', 'TOTAL PENARIKAN VALID', totalWithdraw as any, '', '', '', '', '']);
  rows.push(['', '', '', '', '', '', 'SALDO BERSIH (NET)', (totalDeposit - totalWithdraw) as any, '', '', '', '', '']);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
    { wch: 10 },
    { wch: 12 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 25 },
    { wch: 12 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
  downloadWorkbook(wb, `Transaksi_${school.schoolName.replace(/\s+/g, '_')}_${school.activeAcademicYear.replace(/\//g, '-')}.xlsx`);
}

/**
 * Export Recap Savings to Excel
 */
export function exportRecapToExcel(
  items: {
    studentName: string;
    class: string;
    initialBalance: number;
    totalDeposit: number;
    totalWithdrawal: number;
    finalBalance: number;
    transactionCount: number;
    savingDaysCount: number;
  }[],
  periodLabel: string,
  school: SchoolSettings
) {
  const rows = [
    [school.schoolName.toUpperCase()],
    [`REKAPITULASI TABUNGAN SISWA - PERIODE: ${periodLabel.toUpperCase()}`],
    [`Tahun Ajaran: ${school.activeAcademicYear}`],
    [`Tanggal Cetak: ${formatIndoDate(new Date())}`],
    [],
    [
      'No',
      'Nama Siswa',
      'Kelas',
      'Saldo Awal (Rp)',
      'Total Setoran (Rp)',
      'Total Penarikan (Rp)',
      'Saldo Akhir (Rp)',
      'Jumlah Transaksi',
      'Hari Menabung'
    ]
  ];

  let sumInit = 0;
  let sumDep = 0;
  let sumWith = 0;
  let sumFinal = 0;
  let sumTrx = 0;

  items.forEach((item, idx) => {
    sumInit += item.initialBalance;
    sumDep += item.totalDeposit;
    sumWith += item.totalWithdrawal;
    sumFinal += item.finalBalance;
    sumTrx += item.transactionCount;

    rows.push([
      (idx + 1).toString(),
      item.studentName,
      item.class,
      item.initialBalance as any,
      item.totalDeposit as any,
      item.totalWithdrawal as any,
      item.finalBalance as any,
      item.transactionCount as any,
      item.savingDaysCount as any
    ]);
  });

  rows.push([]);
  rows.push([
    '',
    'TOTAL KESELURUHAN',
    '',
    sumInit as any,
    sumDep as any,
    sumWith as any,
    sumFinal as any,
    sumTrx as any,
    ''
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 10 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Tabungan');
  downloadWorkbook(wb, `Rekap_Tabungan_${periodLabel.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Export Class Recap to Excel
 */
export function exportClassRecapToExcel(classes: ClassRecapItem[], school: SchoolSettings) {
  const rows = [
    [school.schoolName.toUpperCase()],
    ['REKAPITULASI TABUNGAN PER KELAS'],
    [`Tahun Ajaran: ${school.activeAcademicYear}`],
    [`Tanggal Cetak: ${formatIndoDate(new Date())}`],
    [],
    [
      'No',
      'Kelas',
      'Jumlah Siswa',
      'Siswa Aktif',
      'Total Saldo (Rp)',
      'Total Setoran (Rp)',
      'Total Penarikan (Rp)',
      'Total Transaksi',
      'Rata-rata Saldo/Siswa (Rp)'
    ]
  ];

  let totalStudents = 0;
  let totalActive = 0;
  let totalBalance = 0;
  let totalDeposit = 0;
  let totalWithdraw = 0;
  let totalTrx = 0;

  classes.forEach((c, idx) => {
    totalStudents += c.studentCount;
    totalActive += c.activeStudentCount;
    totalBalance += c.totalBalance;
    totalDeposit += c.totalDeposit;
    totalWithdraw += c.totalWithdrawal;
    totalTrx += c.totalTransactions;

    rows.push([
      (idx + 1).toString(),
      `Kelas ${c.class}`,
      c.studentCount as any,
      c.activeStudentCount as any,
      c.totalBalance as any,
      c.totalDeposit as any,
      c.totalWithdrawal as any,
      c.totalTransactions as any,
      c.avgBalance as any
    ]);
  });

  rows.push([]);
  rows.push([
    '',
    'TOTAL KESELURUHAN',
    totalStudents as any,
    totalActive as any,
    totalBalance as any,
    totalDeposit as any,
    totalWithdraw as any,
    totalTrx as any,
    (totalStudents > 0 ? Math.round(totalBalance / totalStudents) : 0) as any
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 },
    { wch: 24 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kelas');
  downloadWorkbook(wb, `Rekap_Kelas_${school.activeAcademicYear.replace(/\//g, '-')}.xlsx`);
}

/**
 * Export Champions (Juara Menabung) to Excel
 */
export function exportChampionsToExcel(champions: ChampionRecord[], periodTitle: string, school: SchoolSettings) {
  const rows = [
    [school.schoolName.toUpperCase()],
    ['PERINGKAT JUARA MENABUNG SISWA'],
    [`Kriteria: Paling Rajin Menabung (Jumlah Hari Menabung Terbanyak)`],
    [`Periode: ${periodTitle}`],
    [`Tahun Ajaran: ${school.activeAcademicYear}`],
    [`Tanggal Cetak: ${formatIndoDate(new Date())}`],
    [],
    [
      'Peringkat',
      'Nama Siswa',
      'Kelas',
      'Jumlah Hari Menabung',
      'Total Setoran (Rp)',
      'Total Penarikan (Rp)',
      'Saldo Akhir (Rp)',
      'Tanggal Setoran Pertama'
    ]
  ];

  champions.forEach((c) => {
    rows.push([
      c.rank.toString(),
      c.studentName,
      c.class,
      c.savingDaysCount as any,
      c.totalDeposit as any,
      c.totalWithdrawal as any,
      c.finalBalance as any,
      c.firstDepositDate ? formatIndoDate(c.firstDepositDate) : '-'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 26 },
    { wch: 10 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 24 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Juara Menabung');
  downloadWorkbook(wb, `Juara_Menabung_${school.activeAcademicYear.replace(/\//g, '-')}.xlsx`);
}

/**
 * Export Student Single Statement to Excel
 */
export function exportSingleStudentToExcel(
  student: Student,
  transactions: Transaction[],
  school: SchoolSettings,
  summary: {
    initialBalance: number;
    totalDeposit: number;
    totalWithdrawal: number;
    finalBalance: number;
    savingDaysCount: number;
  }
) {
  const rows = [
    [school.schoolName.toUpperCase()],
    ['BUKU TABUNGAN & LAPORAN REKENING SISWA'],
    [`Alamat: ${school.address} | NPSN: ${school.npsn}`],
    [],
    ['Nama Siswa', `: ${student.name}`, '', 'Saldo Awal', `: ${formatRupiah(summary.initialBalance)}`],
    ['NIS / NISN', `: ${student.nis} / ${student.nisn || '-'}`, '', 'Total Setoran', `: ${formatRupiah(summary.totalDeposit)}`],
    ['Kelas', `: ${student.class}`, '', 'Total Penarikan', `: ${formatRupiah(summary.totalWithdrawal)}`],
    ['Nama Orang Tua', `: ${student.parentName || '-'}`, '', 'Saldo Akhir Saat Ini', `: ${formatRupiah(summary.finalBalance)}`],
    ['Hari Menabung', `: ${summary.savingDaysCount} hari`, '', 'Tahun Ajaran', `: ${school.activeAcademicYear}`],
    [],
    ['No', 'Tanggal', 'Jenis Transaksi', 'Keterangan', 'Setoran (Rp)', 'Penarikan (Rp)', 'Saldo (Rp)', 'Petugas']
  ];

  transactions.forEach((t, idx) => {
    rows.push([
      (idx + 1).toString(),
      t.date,
      t.type,
      t.description || '-',
      t.type === 'SETORAN' ? (t.amount as any) : 0,
      t.type === 'PENARIKAN' ? (t.amount as any) : 0,
      t.newBalance as any,
      t.createdBy
    ]);
  });

  rows.push([]);
  rows.push(['', '', '', 'Mengetahui,', '', '', 'Loloan Timur, ' + formatIndoDate(new Date())]);
  rows.push(['', '', '', 'Kepala Sekolah,', '', '', 'Petugas Tabungan,']);
  rows.push([]);
  rows.push([]);
  rows.push(['', '', '', school.headmasterName, '', '', school.treasurerName]);
  rows.push(['', '', '', `NIP. ${school.headmasterNip}`, '', '', `NIP. ${school.treasurerNip}`]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 16 },
    { wch: 28 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Tabungan_${student.nis}`);
  downloadWorkbook(wb, `Laporan_Tabungan_${student.nis}_${student.name.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Generate Template Excel for Importing Students
 */
export function generateStudentImportTemplate() {
  const headers = [
    ['PETUNJUK PENGISIAN:'],
    ['1. Kolom NIS dan Nama Siswa WAJIB diisi.'],
    ['2. Kelas diisi angka (1-6) atau contoh: "1A", "5B".'],
    ['3. Jenis Kelamin diisi L (Laki-laki) atau P (Perempuan).'],
    ['4. Jangan mengubah susunan baris header di baris ke-7.'],
    [],
    ['NIS', 'NISN', 'Nama Siswa', 'Kelas', 'Jenis Kelamin (L/P)', 'Nama Orang Tua / Wali', 'Nomor HP Orang Tua', 'Saldo Awal (Rp)', 'Catatan'],
    ['2026011', '0123456781', 'Ahmad Dhani', '1', 'L', 'Bambang', '081234567890', 25000, 'Siswa pindahan'],
    ['2026012', '0123456782', 'Bella Cantika', '1', 'P', 'Rina Wati', '081234567891', 10000, ''],
    ['2026013', '0123456783', 'Cahya Ramadhan', '2', 'L', 'Sutrisno', '081234567892', 0, '']
  ];

  const ws = XLSX.utils.aoa_to_sheet(headers);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 16 },
    { wch: 24 },
    { wch: 10 },
    { wch: 20 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
  downloadWorkbook(wb, 'Template_Import_Siswa_SIMTAB.xlsx');
}

/**
 * Parse Excel file for student imports with validation
 */
export interface ParsedImportRow {
  rowNum: number;
  nis: string;
  nisn: string;
  name: string;
  class: string;
  gender: 'L' | 'P';
  parentName: string;
  parentPhone: string;
  initialBalance: number;
  notes: string;
  isValid: boolean;
  errors: string[];
}

export function parseStudentsExcel(fileBuffer: ArrayBuffer, existingNisList: string[]): Promise<ParsedImportRow[]> {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

      // Find the header row (contains 'NIS' or 'Nama')
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(15, data.length); i++) {
        const row = data[i];
        if (row && row.some((cell: any) => typeof cell === 'string' && /NIS/i.test(cell))) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        // Fallback: assume row 0 is header
        headerRowIndex = 0;
      }

      const rows: ParsedImportRow[] = [];
      const seenNisInFile = new Set<string>();

      for (let i = headerRowIndex + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0 || !row[0]) continue; // skip empty

        const nis = String(row[0] || '').trim();
        const nisn = String(row[1] || '').trim();
        const name = String(row[2] || '').trim();
        const classVal = String(row[3] || '1').trim();
        let genderVal = String(row[4] || 'L').trim().toUpperCase();
        if (genderVal.startsWith('P')) genderVal = 'P';
        else genderVal = 'L';

        const parentName = String(row[5] || '').trim();
        const parentPhone = String(row[6] || '').trim();
        const rawBalance = row[7];
        const initialBalance = typeof rawBalance === 'number' ? rawBalance : (parseInt(String(rawBalance || '0').replace(/[^\d]/g, ''), 10) || 0);
        const notes = String(row[8] || '').trim();

        const errors: string[] = [];

        if (!nis) {
          errors.push('NIS wajib diisi');
        } else if (existingNisList.includes(nis)) {
          errors.push(`NIS ${nis} sudah terdaftar di sistem`);
        } else if (seenNisInFile.has(nis)) {
          errors.push(`NIS ${nis} duplikat di dalam file ini`);
        } else {
          seenNisInFile.add(nis);
        }

        if (!name) {
          errors.push('Nama siswa wajib diisi');
        }

        if (!classVal) {
          errors.push('Kelas wajib diisi');
        }

        if (initialBalance < 0) {
          errors.push('Saldo awal tidak boleh negatif');
        }

        rows.push({
          rowNum: i + 1,
          nis,
          nisn,
          name,
          class: classVal,
          gender: genderVal as 'L' | 'P',
          parentName,
          parentPhone,
          initialBalance,
          notes,
          isValid: errors.length === 0,
          errors
        });
      }

      resolve(rows);
    } catch (err) {
      reject(err);
    }
  });
}
