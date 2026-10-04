import {
  Student,
  Transaction,
  SchoolSettings,
  AcademicYear,
  AuditLog,
  DistributionRecord,
  ChampionRecord,
  UserAccount
} from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'simtab_v2_students',
  TRANSACTIONS: 'simtab_v2_transactions',
  SETTINGS: 'simtab_v2_settings',
  ACADEMIC_YEARS: 'simtab_v2_academic_years',
  AUDIT_LOGS: 'simtab_v2_audit_logs',
  DISTRIBUTIONS: 'simtab_v2_distributions',
  CURRENT_USER: 'simtab_v2_current_user',
  IS_DEMO_ACTIVE: 'simtab_v2_is_demo',
};

export const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'SD Negeri 1 Loloan Timur',
  npsn: '50101234',
  address: 'Jl. Pulau Irian No. 12, Loloan Timur',
  village: 'Loloan Timur',
  district: 'Negara',
  regency: 'Jembrana',
  province: 'Bali',
  headmasterName: 'Drs. I Wayan Sudarma, M.Pd.',
  headmasterNip: '19690812 199403 1 004',
  treasurerName: 'Ni Made Lestari, S.Pd.',
  treasurerNip: '19820514 200801 2 011',
  activeAcademicYear: '2026/2027',
  logoUrl: '/src/assets/images/logo_sdn_loloan_timur_1791121899882.jpg',
  minSavingsAmount: 1000,
  lowBalanceThreshold: 10000, // Section 19: configurable low balance threshold
};

export const DEFAULT_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'ay-1', name: '2025/2026', isActive: false },
  { id: 'ay-2', name: '2026/2027', isActive: true },
  { id: 'ay-3', name: '2027/2028', isActive: false },
];

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'u-admin',
    username: 'admin',
    name: 'I Putu Suardana (Admin)',
    email: 'wayanmahardikagen@gmail.com',
    role: 'ADMIN',
    status: 'active',
  },
  {
    id: 'u-petugas',
    username: 'petugas',
    name: 'Ni Made Lestari (Petugas Tabungan)',
    email: 'petugas@sdn1loloantimur.sch.id',
    role: 'PETUGAS',
    status: 'active',
  },
  {
    id: 'u-kepsek',
    username: 'kepsek',
    name: 'Drs. I Wayan Sudarma, M.Pd. (Kepala Sekolah)',
    email: 'kepsek@sdn1loloantimur.sch.id',
    role: 'KEPALA_SEKOLAH',
    status: 'active',
  },
];

// Expanded 20 demo students (Section 36)
export const INITIAL_DEMO_STUDENTS: Student[] = [
  {
    id: 'std-001',
    nis: '2026001',
    nisn: '0123456701',
    name: 'Andi Pratama',
    class: '5',
    gender: 'L',
    parentName: 'I Wayan Pratama',
    parentPhone: '081234567801',
    status: 'Aktif',
    balance: 145000,
    initialDepositDate: '2026-08-01',
    notes: 'Siswa rajin menabung harian',
    createdAt: '2026-08-01T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-001',
  },
  {
    id: 'std-002',
    nis: '2026002',
    nisn: '0123456702',
    name: 'Budi Santoso',
    class: '5',
    gender: 'L',
    parentName: 'Santoso Budi',
    parentPhone: '081234567802',
    status: 'Aktif',
    balance: 85000,
    initialDepositDate: '2026-08-02',
    notes: '',
    createdAt: '2026-08-01T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-002',
  },
  {
    id: 'std-003',
    nis: '2026003',
    nisn: '0123456703',
    name: 'Citra Lestari',
    class: '5',
    gender: 'P',
    parentName: 'Made Subawa',
    parentPhone: '081234567803',
    status: 'Aktif',
    balance: 210000,
    initialDepositDate: '2026-08-01',
    notes: 'Pernah juara tabungan',
    createdAt: '2026-08-01T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-003',
  },
  {
    id: 'std-004',
    nis: '2026004',
    nisn: '0123456704',
    name: 'Dewi Anggraeni',
    class: '4',
    gender: 'P',
    parentName: 'Ketut Sudarsana',
    parentPhone: '081234567804',
    status: 'Aktif',
    balance: 130000,
    initialDepositDate: '2026-08-03',
    notes: '',
    createdAt: '2026-08-01T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-004',
  },
  {
    id: 'std-005',
    nis: '2026005',
    nisn: '0123456705',
    name: 'Eka Saputra',
    class: '4',
    gender: 'L',
    parentName: 'Nyoman Saputra',
    parentPhone: '081234567805',
    status: 'Aktif',
    balance: 75000,
    initialDepositDate: '2026-08-05',
    notes: '',
    createdAt: '2026-08-01T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-005',
  },
  {
    id: 'std-006',
    nis: '2026006',
    nisn: '0123456706',
    name: 'Fajar Hidayat',
    class: '3',
    gender: 'L',
    parentName: 'Abdul Hidayat',
    parentPhone: '081234567806',
    status: 'Aktif',
    balance: 60000,
    initialDepositDate: '2026-08-06',
    notes: '',
    createdAt: '2026-08-01T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-006',
  },
  {
    id: 'std-007',
    nis: '2026007',
    nisn: '0123456707',
    name: 'Gita Maharani',
    class: '3',
    gender: 'P',
    parentName: 'I Gede Mahardika',
    parentPhone: '081234567807',
    status: 'Aktif',
    balance: 175000,
    initialDepositDate: '2026-08-02',
    notes: '',
    createdAt: '2026-08-01T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-007',
  },
  {
    id: 'std-008',
    nis: '2026008',
    nisn: '0123456708',
    name: 'Hendra Gunawan',
    class: '2',
    gender: 'L',
    parentName: 'Gunawan Prasetyo',
    parentPhone: '081234567808',
    status: 'Aktif',
    balance: 45000,
    initialDepositDate: '2026-08-08',
    notes: '',
    createdAt: '2026-08-01T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-008',
  },
  {
    id: 'std-009',
    nis: '2026009',
    nisn: '0123456709',
    name: 'Intan Permata',
    class: '2',
    gender: 'P',
    parentName: 'Agus Permata',
    parentPhone: '081234567809',
    status: 'Aktif',
    balance: 90000,
    initialDepositDate: '2026-08-04',
    notes: '',
    createdAt: '2026-08-01T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-009',
  },
  {
    id: 'std-010',
    nis: '2026010',
    nisn: '0123456710',
    name: 'Joko Widodo',
    class: '1',
    gender: 'L',
    parentName: 'Widodo Sujatmiko',
    parentPhone: '081234567810',
    status: 'Aktif',
    balance: 50000,
    initialDepositDate: '2026-08-10',
    notes: '',
    createdAt: '2026-08-01T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-010',
  },
  // Additional 10 students to complete 20 students requirement
  {
    id: 'std-011',
    nis: '2026011',
    nisn: '0123456711',
    name: 'Kadek Arta Wijaya',
    class: '6',
    gender: 'L',
    parentName: 'I Wayan Wijaya',
    parentPhone: '081234567811',
    status: 'Aktif',
    balance: 320000,
    initialDepositDate: '2026-07-20',
    notes: 'Kelas 6 persiapan kelulusan',
    createdAt: '2026-07-20T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-011',
  },
  {
    id: 'std-012',
    nis: '2026012',
    nisn: '0123456712',
    name: 'Luh Putu Dian Sari',
    class: '6',
    gender: 'P',
    parentName: 'I Made Sari',
    parentPhone: '081234567812',
    status: 'Aktif',
    balance: 280000,
    initialDepositDate: '2026-07-22',
    notes: '',
    createdAt: '2026-07-22T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-012',
  },
  {
    id: 'std-013',
    nis: '2026013',
    nisn: '0123456713',
    name: 'Muhammad Rizky',
    class: '5',
    gender: 'L',
    parentName: 'Rahmat Hidayat',
    parentPhone: '081234567813',
    status: 'Aktif',
    balance: 110000,
    initialDepositDate: '2026-08-12',
    notes: '',
    createdAt: '2026-08-12T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-013',
  },
  {
    id: 'std-014',
    nis: '2026014',
    nisn: '0123456714',
    name: 'Ni Komang Ayu',
    class: '4',
    gender: 'P',
    parentName: 'I Nyoman Suarna',
    parentPhone: '081234567814',
    status: 'Aktif',
    balance: 95000,
    initialDepositDate: '2026-08-14',
    notes: '',
    createdAt: '2026-08-14T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-014',
  },
  {
    id: 'std-015',
    nis: '2026015',
    nisn: '0123456715',
    name: 'Oka Mahendra',
    class: '3',
    gender: 'L',
    parentName: 'I Ketut Mahendra',
    parentPhone: '081234567815',
    status: 'Aktif',
    balance: 70000,
    initialDepositDate: '2026-08-15',
    notes: '',
    createdAt: '2026-08-15T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-015',
  },
  {
    id: 'std-016',
    nis: '2026016',
    nisn: '0123456716',
    name: 'Putu Riska Dewi',
    class: '3',
    gender: 'P',
    parentName: 'I Made Sukarja',
    parentPhone: '081234567816',
    status: 'Aktif',
    balance: 80000,
    initialDepositDate: '2026-08-18',
    notes: '',
    createdAt: '2026-08-18T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-016',
  },
  {
    id: 'std-017',
    nis: '2026017',
    nisn: '0123456717',
    name: 'Qori Al-Ghifari',
    class: '2',
    gender: 'L',
    parentName: 'Ilyas Al-Ghifari',
    parentPhone: '081234567817',
    status: 'Aktif',
    balance: 55000,
    initialDepositDate: '2026-08-20',
    notes: '',
    createdAt: '2026-08-20T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-017',
  },
  {
    id: 'std-018',
    nis: '2026018',
    nisn: '0123456718',
    name: 'Ratih Purwasih',
    class: '2',
    gender: 'P',
    parentName: 'Sujana',
    parentPhone: '081234567818',
    status: 'Aktif',
    balance: 65000,
    initialDepositDate: '2026-08-22',
    notes: '',
    createdAt: '2026-08-22T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-018',
  },
  {
    id: 'std-019',
    nis: '2026019',
    nisn: '0123456719',
    name: 'Surya Dharma',
    class: '1',
    gender: 'L',
    parentName: 'I Wayan Dharma',
    parentPhone: '081234567819',
    status: 'Aktif',
    balance: 40000,
    initialDepositDate: '2026-08-25',
    notes: '',
    createdAt: '2026-08-25T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-019',
  },
  {
    id: 'std-020',
    nis: '2026020',
    nisn: '0123456720',
    name: 'Tari Anindita',
    class: '1',
    gender: 'P',
    parentName: 'Bagus Anindita',
    parentPhone: '081234567820',
    status: 'Aktif',
    balance: 45000,
    initialDepositDate: '2026-08-26',
    notes: '',
    createdAt: '2026-08-26T08:00:00Z',
    qrCodeData: 'SIMTAB:STD:std-020',
  },
];

// Initial demo transactions demonstrating multiple dates and same-day multiple deposits
export const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  // Andi Pratama (std-001) - Multiple deposits on 2026-10-01 to test the same-day rule
  {
    id: 'TRX-2026-0001',
    studentId: 'std-001',
    studentName: 'Andi Pratama',
    class: '5',
    type: 'SETORAN',
    amount: 50000,
    date: '2026-08-01',
    previousBalance: 0,
    newBalance: 50000,
    description: 'Setoran awal tahun ajaran baru',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-08-01T08:30:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },
  {
    id: 'TRX-2026-0002',
    studentId: 'std-001',
    studentName: 'Andi Pratama',
    class: '5',
    type: 'SETORAN',
    amount: 25000,
    date: '2026-08-15',
    previousBalance: 50000,
    newBalance: 75000,
    description: 'Setoran rutin dua mingguan',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-08-15T08:45:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },
  {
    id: 'TRX-2026-0003',
    studentId: 'std-001',
    studentName: 'Andi Pratama',
    class: '5',
    type: 'SETORAN',
    amount: 30000,
    date: '2026-09-01',
    previousBalance: 75000,
    newBalance: 105000,
    description: 'Setoran awal bulan September',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-09-01T08:20:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },
  {
    id: 'TRX-2026-0004',
    studentId: 'std-001',
    studentName: 'Andi Pratama',
    class: '5',
    type: 'SETORAN',
    amount: 10000,
    date: '2026-10-01',
    previousBalance: 105000,
    newBalance: 115000,
    description: 'Setoran pagi',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-10-01T07:45:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },
  {
    id: 'TRX-2026-0005',
    studentId: 'std-001',
    studentName: 'Andi Pratama',
    class: '5',
    type: 'SETORAN',
    amount: 15000,
    date: '2026-10-01', // Same day as above!
    previousBalance: 115000,
    newBalance: 130000,
    description: 'Tambahan uang saku siang',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-10-01T12:15:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },
  {
    id: 'TRX-2026-0006',
    studentId: 'std-001',
    studentName: 'Andi Pratama',
    class: '5',
    type: 'SETORAN',
    amount: 15000,
    date: '2026-10-04',
    previousBalance: 130000,
    newBalance: 145000,
    description: 'Setoran mingguan',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-10-04T08:00:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },

  // Citra Lestari (std-003) - Top Saver
  {
    id: 'TRX-2026-0007',
    studentId: 'std-003',
    studentName: 'Citra Lestari',
    class: '5',
    type: 'SETORAN',
    amount: 50000,
    date: '2026-08-01',
    previousBalance: 0,
    newBalance: 50000,
    description: 'Setoran awal',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-08-01T08:15:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },
  {
    id: 'TRX-2026-0008',
    studentId: 'std-003',
    studentName: 'Citra Lestari',
    class: '5',
    type: 'SETORAN',
    amount: 40000,
    date: '2026-08-10',
    previousBalance: 50000,
    newBalance: 90000,
    description: 'Uang tabungan lomba',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-08-10T08:30:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },
  {
    id: 'TRX-2026-0009',
    studentId: 'std-003',
    studentName: 'Citra Lestari',
    class: '5',
    type: 'SETORAN',
    amount: 50000,
    date: '2026-08-25',
    previousBalance: 90000,
    newBalance: 140000,
    description: 'Setoran akhir Agustus',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-08-25T08:40:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },
  {
    id: 'TRX-2026-0010',
    studentId: 'std-003',
    studentName: 'Citra Lestari',
    class: '5',
    type: 'SETORAN',
    amount: 40000,
    date: '2026-09-12',
    previousBalance: 140000,
    newBalance: 180000,
    description: 'Setoran berkala',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-09-12T08:10:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },
  {
    id: 'TRX-2026-0011',
    studentId: 'std-003',
    studentName: 'Citra Lestari',
    class: '5',
    type: 'SETORAN',
    amount: 30000,
    date: '2026-10-02',
    previousBalance: 180000,
    newBalance: 210000,
    description: 'Setoran awal Oktober',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-10-02T08:15:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },

  // Gita Maharani (std-007) - With withdrawal
  {
    id: 'TRX-2026-0012',
    studentId: 'std-007',
    studentName: 'Gita Maharani',
    class: '3',
    type: 'SETORAN',
    amount: 100000,
    date: '2026-08-02',
    previousBalance: 0,
    newBalance: 100000,
    description: 'Setoran awal',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-08-02T09:00:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },
  {
    id: 'TRX-2026-0013',
    studentId: 'std-007',
    studentName: 'Gita Maharani',
    class: '3',
    type: 'SETORAN',
    amount: 50000,
    date: '2026-08-20',
    previousBalance: 100000,
    newBalance: 150000,
    description: 'Setoran tabungan',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-08-20T09:10:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },
  {
    id: 'TRX-2026-0014',
    studentId: 'std-007',
    studentName: 'Gita Maharani',
    class: '3',
    type: 'SETORAN',
    amount: 50000,
    date: '2026-09-15',
    previousBalance: 150000,
    newBalance: 200000,
    description: 'Setoran rutin',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-09-15T08:30:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },
  {
    id: 'TRX-2026-0015',
    studentId: 'std-007',
    studentName: 'Gita Maharani',
    class: '3',
    type: 'PENARIKAN',
    amount: 25000,
    date: '2026-09-28',
    previousBalance: 200000,
    newBalance: 175000,
    description: 'Beli buku tulis dan alat lukis',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-09-28T10:00:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  },

  // Kadek Arta Wijaya (std-011) - High balance
  {
    id: 'TRX-2026-0016',
    studentId: 'std-011',
    studentName: 'Kadek Arta Wijaya',
    class: '6',
    type: 'SETORAN',
    amount: 320000,
    date: '2026-07-20',
    previousBalance: 0,
    newBalance: 320000,
    description: 'Setoran tabungan kenaikan kelas 6',
    createdBy: 'Petugas Tabungan',
    createdAt: '2026-07-20T08:00:00Z',
    status: 'VALID',
    academicYear: '2026/2027',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-08-01T08:00:00Z',
    userName: 'I Putu Suardana (Admin)',
    role: 'ADMIN',
    action: 'INISIALISASI_SISTEM',
    details: 'Inisialisasi sistem SIMTAB SDN 1 Loloan Timur Tahun Ajaran 2026/2027',
  },
  {
    id: 'log-002',
    timestamp: '2026-08-01T08:15:00Z',
    userName: 'Ni Made Lestari (Petugas Tabungan)',
    role: 'PETUGAS',
    action: 'CREATE STUDENT',
    details: 'Pendaftaran 20 data siswa perdana',
  },
];

/**
 * Storage Helpers (with memory fallback)
 */
export function getStoredStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_DEMO_STUDENTS));
      localStorage.setItem(STORAGE_KEYS.IS_DEMO_ACTIVE, 'true');
      return INITIAL_DEMO_STUDENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_STUDENTS;
  }
}

export function saveStoredStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
      return INITIAL_DEMO_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function getStoredSettings(): SchoolSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: SchoolSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getStoredAcademicYears(): AcademicYear[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEARS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEARS, JSON.stringify(DEFAULT_ACADEMIC_YEARS));
      return DEFAULT_ACADEMIC_YEARS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ACADEMIC_YEARS;
  }
}

export function saveStoredAcademicYears(years: AcademicYear[]): void {
  localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEARS, JSON.stringify(years));
}

export function getStoredAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function appendAuditLog(
  userName: string,
  role: 'ADMIN' | 'PETUGAS' | 'KEPALA_SEKOLAH',
  action: string,
  details: string,
  targetId?: string
): void {
  try {
    const current = getStoredAuditLogs();
    const newEntry: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      userName,
      role,
      action,
      targetId,
      details,
    };
    const updated = [newEntry, ...current].slice(0, 500);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to log audit:', e);
  }
}

export function getStoredDistributions(): DistributionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DISTRIBUTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredDistributions(dists: DistributionRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.DISTRIBUTIONS, JSON.stringify(dists));
}

export function isDemoModeActive(): boolean {
  return localStorage.getItem(STORAGE_KEYS.IS_DEMO_ACTIVE) !== 'false';
}

export function setDemoModeActive(active: boolean): void {
  localStorage.setItem(STORAGE_KEYS.IS_DEMO_ACTIVE, active ? 'true' : 'false');
}

export function resetToEmptyState(): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.DISTRIBUTIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.IS_DEMO_ACTIVE, 'false');
}

export function reloadDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_DEMO_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.DISTRIBUTIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.IS_DEMO_ACTIVE, 'true');
}

/**
 * Calculation Core Rules (Section 34)
 */
export function recalculateStudentBalance(studentId: string, transactions: Transaction[]): number {
  const studentTrx = transactions.filter((t) => t.studentId === studentId && t.status === 'VALID');
  let balance = 0;
  const sorted = [...studentTrx].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  for (const t of sorted) {
    if (t.type === 'SETORAN' || t.type === 'SALDO_AWAL') {
      balance += t.amount;
    } else if (t.type === 'PENARIKAN') {
      balance -= t.amount;
    }
  }
  return balance;
}

export function calculateSavingDays(
  studentId: string,
  transactions: Transaction[],
  startDate?: string,
  endDate?: string
): { daysCount: number; totalDeposit: number; totalWithdrawal: number; distinctDates: string[] } {
  const validDeposits = transactions.filter((t) => {
    if (t.studentId !== studentId) return false;
    if (t.status !== 'VALID') return false;
    if (t.type !== 'SETORAN') return false;
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  });

  const validWithdrawals = transactions.filter((t) => {
    if (t.studentId !== studentId) return false;
    if (t.status !== 'VALID') return false;
    if (t.type !== 'PENARIKAN') return false;
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  });

  const uniqueDateSet = new Set<string>();
  let totalDeposit = 0;
  for (const t of validDeposits) {
    uniqueDateSet.add(t.date);
    totalDeposit += t.amount;
  }

  let totalWithdrawal = 0;
  for (const t of validWithdrawals) {
    totalWithdrawal += t.amount;
  }

  return {
    daysCount: uniqueDateSet.size,
    totalDeposit,
    totalWithdrawal,
    distinctDates: Array.from(uniqueDateSet).sort(),
  };
}

export function calculateChampions(
  students: Student[],
  transactions: Transaction[],
  startDate?: string,
  endDate?: string
): ChampionRecord[] {
  const records = students.map((student) => {
    const stats = calculateSavingDays(student.id, transactions, startDate, endDate);

    const allStudentDeposits = transactions
      .filter((t) => t.studentId === student.id && t.status === 'VALID' && t.type === 'SETORAN')
      .sort((a, b) => (a.date > b.date ? 1 : -1));

    const firstDepositDate = allStudentDeposits.length > 0 ? allStudentDeposits[0].date : undefined;

    return {
      rank: 0,
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      savingDaysCount: stats.daysCount,
      totalDeposit: stats.totalDeposit,
      totalWithdrawal: stats.totalWithdrawal,
      finalBalance: student.balance,
      firstDepositDate,
    };
  });

  records.sort((a, b) => {
    // 1. Jumlah hari menabung (DESC)
    if (b.savingDaysCount !== a.savingDaysCount) {
      return b.savingDaysCount - a.savingDaysCount;
    }
    // 2. Total setoran (DESC)
    if (b.totalDeposit !== a.totalDeposit) {
      return b.totalDeposit - a.totalDeposit;
    }
    // 3. Tanggal setoran pertama (ASC)
    const dateA = a.firstDepositDate || '9999-12-31';
    const dateB = b.firstDepositDate || '9999-12-31';
    return dateA.localeCompare(dateB);
  });

  return records.map((rec, index) => ({
    ...rec,
    rank: index + 1,
  }));
}

export function calculateClassRecaps(
  students: Student[],
  transactions: Transaction[]
): Record<string, {
  studentCount: number;
  activeCount: number;
  totalBalance: number;
  totalDeposit: number;
  totalWithdraw: number;
  transactionCount: number;
}> {
  const validTrx = transactions.filter((t) => t.status === 'VALID');
  const result: Record<string, {
    studentCount: number;
    activeCount: number;
    totalBalance: number;
    totalDeposit: number;
    totalWithdraw: number;
    transactionCount: number;
  }> = {};

  ['1', '2', '3', '4', '5', '6'].forEach((cls) => {
    result[cls] = {
      studentCount: 0,
      activeCount: 0,
      totalBalance: 0,
      totalDeposit: 0,
      totalWithdraw: 0,
      transactionCount: 0,
    };
  });

  for (const s of students) {
    if (!result[s.class]) {
      result[s.class] = {
        studentCount: 0,
        activeCount: 0,
        totalBalance: 0,
        totalDeposit: 0,
        totalWithdraw: 0,
        transactionCount: 0,
      };
    }
    result[s.class].studentCount += 1;
    if (s.status === 'Aktif') {
      result[s.class].activeCount += 1;
    }
    result[s.class].totalBalance += s.balance;
  }

  for (const t of validTrx) {
    if (!result[t.class]) {
      result[t.class] = {
        studentCount: 0,
        activeCount: 0,
        totalBalance: 0,
        totalDeposit: 0,
        totalWithdraw: 0,
        transactionCount: 0,
      };
    }
    result[t.class].transactionCount += 1;
    if (t.type === 'SETORAN') {
      result[t.class].totalDeposit += t.amount;
    } else if (t.type === 'PENARIKAN') {
      result[t.class].totalWithdraw += t.amount;
    }
  }

  return result;
}
