export type UserRole = 'ADMIN' | 'PETUGAS' | 'KEPALA_SEKOLAH';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  lastLogin?: string;
}

export type StudentStatus = 'Aktif' | 'Lulus' | 'Pindah';
export type Gender = 'L' | 'P';

export interface Student {
  id: string;
  nis: string;
  nisn?: string;
  name: string;
  class: string; // '1', '2', '3', '4', '5', '6'
  gender: Gender;
  parentName: string;
  parentPhone?: string;
  status: StudentStatus;
  balance: number;
  initialDepositDate?: string;
  notes?: string;
  createdAt: string;
  qrCodeData?: string;
}

export type TransactionType = 'SETORAN' | 'PENARIKAN' | 'SALDO_AWAL';
export type TransactionStatus = 'VALID' | 'VOID' | 'DIKOREKSI';

export interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  previousBalance: number;
  newBalance: number;
  description: string;
  createdBy: string;
  createdById?: string;
  createdAt: string; // ISO String
  status: TransactionStatus;
  academicYear: string;
  batchId?: string;
  documentNumber?: string;
  sourceData?: string;
  isMigration?: boolean;
  originalTransactionId?: string;
  correctionTransactionId?: string;
  correctionReason?: string;
  correctedBy?: string;
  correctedAt?: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026/2027"
  isActive: boolean;
}

export interface SchoolSettings {
  schoolName: string;
  npsn: string;
  address: string;
  village?: string;
  district?: string;
  regency?: string;
  province?: string;
  headmasterName: string;
  headmasterNip: string;
  treasurerName: string;
  treasurerNip: string;
  activeAcademicYear: string;
  logoUrl: string;
  minSavingsAmount: number;
  lowBalanceThreshold: number; // e.g. 10000
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO
  userId?: string;
  userName: string;
  role: UserRole;
  action: string;
  targetId?: string;
  details: string;
}

export interface DistributionRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  academicYear: string;
  amountDistributed: number;
  distributedDate: string;
  distributedBy: string;
  status: 'Belum Dibagikan' | 'Sudah Dibagikan';
  notes?: string;
}

export interface ChampionRecord {
  rank: number;
  studentId: string;
  studentName: string;
  class: string;
  savingDaysCount: number;
  totalDeposit: number;
  totalWithdrawal: number;
  finalBalance: number;
  firstDepositDate?: string;
}

export interface ClassRecapItem {
  class: string;
  studentCount: number;
  activeStudentCount: number;
  totalBalance: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalTransactions: number;
  avgBalance: number;
}

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'deposit'
  | 'withdraw'
  | 'mass-deposit'
  | 'scan-qr'
  | 'transactions'
  | 'recap'
  | 'recap-class'
  | 'champions'
  | 'distribution'
  | 'minutes-distribution'
  | 'report-student'
  | 'report-passbook'
  | 'report-yearend'
  | 'import-excel'
  | 'export-excel'
  | 'settings'
  | 'audit-log'
  | 'reconciliation'
  | 'cash-reconciliation'
  | 'initial-balance'
  | 'system-health'
  | 'uat-checklist';
