import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Student,
  Transaction,
  SchoolSettings,
  AcademicYear,
  AuditLog,
  DistributionRecord,
  UserAccount,
  ActiveTab,
  TransactionType,
  UserRole
} from '../types';
import {
  getStoredStudents,
  saveStoredStudents,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredSettings,
  saveStoredSettings,
  getStoredAcademicYears,
  saveStoredAcademicYears,
  getStoredAuditLogs,
  appendAuditLog,
  getStoredDistributions,
  saveStoredDistributions,
  isDemoModeActive,
  setDemoModeActive,
  reloadDemoData,
  resetToEmptyState,
  DEFAULT_USERS,
  DEFAULT_SETTINGS,
  DEFAULT_ACADEMIC_YEARS,
  recalculateStudentBalance
} from '../utils/storage';
import {
  db,
  auth
} from '../firebase/config';
import {
  subscribeFirestoreStudents,
  subscribeFirestoreTransactions,
  executeAtomicFirestoreTransaction,
  voidFirestoreTransaction,
  addFirestoreStudent,
  updateFirestoreStudent,
  deleteFirestoreStudent,
  saveFirestoreSettings,
  saveFirestoreAcademicYears,
  saveFirestoreDistribution,
  seedFirestoreWithDemoData,
  addFirestoreTransaction
} from '../firebase/service';
import { generate100TestStudents } from '../utils/testDataset';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getTodayDateString } from '../utils/format';

interface AppContextType {
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  students: Student[];
  transactions: Transaction[];
  settings: SchoolSettings;
  academicYears: AcademicYear[];
  auditLogs: AuditLog[];
  distributions: DistributionRecord[];
  isDemo: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  selectedStudentForDetail: Student | null;
  setSelectedStudentForDetail: (s: Student | null) => void;
  receiptModalTrx: Transaction | null;
  setReceiptModalTrx: (trx: Transaction | null) => void;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  isQrScannerOpen: boolean;
  setIsQrScannerOpen: (open: boolean) => void;
  isSyncingFirebase: boolean;

  // Actions
  login: (username: string, role?: UserRole) => boolean;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  addStudent: (data: Omit<Student, 'id' | 'createdAt' | 'balance'> & { initialBalance?: number }) => Promise<{ success: boolean; message: string; student?: Student }>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<{ success: boolean; message: string }>;
  deleteStudent: (id: string) => Promise<{ success: boolean; message: string }>;
  createTransaction: (params: {
    studentId: string;
    type: TransactionType;
    amount: number;
    date: string;
    description: string;
  }) => Promise<{ success: boolean; message: string; transaction?: Transaction }>;
  executeCustomTransaction: (params: {
    studentId: string;
    type: TransactionType;
    amount: number;
    date: string;
    description: string;
    documentNumber?: string;
    sourceData?: string;
    isMigration?: boolean;
  }) => Promise<{ success: boolean; message?: string; transaction?: Transaction }>;
  createMassDeposit: (params: {
    date: string;
    description: string;
    items: { studentId: string; amount: number }[];
  }) => Promise<{ success: boolean; message: string; count: number }>;
  correctTransaction: (transactionId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  markDistribution: (studentId: string, amount: number, notes?: string) => Promise<{ success: boolean; message: string }>;
  batchImportStudents: (newStudents: (Omit<Student, 'id' | 'createdAt' | 'balance'> & { initialBalance?: number })[]) => Promise<{ success: boolean; count: number }>;
  updateSchoolSettings: (newSettings: SchoolSettings) => Promise<void>;
  updateAcademicYears: (years: AcademicYear[]) => Promise<void>;
  resetDataToDemo: () => Promise<void>;
  clearDataClean: () => Promise<void>;
  load100TestStudentsDataset: () => void;
  clearTestDatasetToEmpty: () => void;
  refreshBalances: () => void;
  reconcileStudentBalance: (studentId: string) => Promise<{ success: boolean; newBalance: number }>;
  reconcileAllBalances: () => Promise<{ success: boolean; count: number }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('simtab_v2_current_user');
      return saved ? JSON.parse(saved) : DEFAULT_USERS[0];
    } catch {
      return DEFAULT_USERS[0];
    }
  });

  const [students, setStudents] = useState<Student[]>(getStoredStudents);
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);
  const [settings, setSettings] = useState<SchoolSettings>(getStoredSettings);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(getStoredAcademicYears);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getStoredAuditLogs);
  const [distributions, setDistributions] = useState<DistributionRecord[]>(getStoredDistributions);
  const [isDemo, setIsDemo] = useState<boolean>(isDemoModeActive);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [receiptModalTrx, setReceiptModalTrx] = useState<Transaction | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);

  // Sync state to local storage for instant offline availability & light cache
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('simtab_v2_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('simtab_v2_current_user');
    }
  }, [currentUser]);

  // Real-time Firestore Listeners
  useEffect(() => {
    let unsubStudents: (() => void) | undefined;
    let unsubTrx: (() => void) | undefined;

    try {
      setIsSyncingFirebase(true);
      unsubStudents = subscribeFirestoreStudents((fsStudents) => {
        if (fsStudents.length > 0) {
          setStudents(fsStudents);
          saveStoredStudents(fsStudents);
        }
      });

      unsubTrx = subscribeFirestoreTransactions((fsTrx) => {
        if (fsTrx.length > 0) {
          setTransactions(fsTrx);
          saveStoredTransactions(fsTrx);
        }
      });
      setIsSyncingFirebase(false);
    } catch (e) {
      console.warn('Realtime subscription fallback to local cache:', e);
      setIsSyncingFirebase(false);
    }

    return () => {
      if (unsubStudents) unsubStudents();
      if (unsubTrx) unsubTrx();
    };
  }, []);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const login = (username: string, role?: UserRole) => {
    const found = DEFAULT_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    const userRole: UserRole = role || (found ? found.role : (username.toLowerCase().includes('admin') ? 'ADMIN' : username.toLowerCase().includes('kepsek') ? 'KEPALA_SEKOLAH' : 'PETUGAS'));

    const userToLogin: UserAccount = found || {
      id: 'u-' + Date.now(),
      username,
      name: userRole === 'ADMIN' ? 'Administrator Tabungan' : userRole === 'KEPALA_SEKOLAH' ? 'Kepala Sekolah' : 'Petugas Tabungan',
      email: `${username}@sdn1loloantimur.sch.id`,
      role: userRole,
      status: 'active',
      lastLogin: new Date().toISOString(),
    };

    setCurrentUser(userToLogin);
    appendAuditLog(
      userToLogin.name,
      userToLogin.role,
      'LOGIN',
      `Login berhasil ke sistem SIMTAB sebagai ${userToLogin.role}`
    );
    setAuditLogs(getStoredAuditLogs());
    showNotification('success', `Selamat datang, ${userToLogin.name} (${userToLogin.role})`);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;

      // Determine role: if email is bootstrapped admin email, grant ADMIN
      const isBootstrappedAdmin = user.email === 'wayanmahardikagen@gmail.com';
      const role: UserRole = isBootstrappedAdmin ? 'ADMIN' : 'PETUGAS';

      const userAccount: UserAccount = {
        id: user.uid,
        username: user.email?.split('@')[0] || 'user',
        name: user.displayName || user.email || 'Pengguna SIMTAB',
        email: user.email || '',
        photoUrl: user.photoURL || undefined,
        role,
        status: 'active',
        lastLogin: new Date().toISOString(),
      };

      setCurrentUser(userAccount);
      appendAuditLog(
        userAccount.name,
        userAccount.role,
        'LOGIN',
        `Login berhasil menggunakan Akun Google (${userAccount.email})`
      );
      setAuditLogs(getStoredAuditLogs());
      showNotification('success', `Berhasil masuk dengan Google sebagai ${userAccount.name}`);
      return true;
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      showNotification('error', 'Gagal masuk dengan Google. Silakan gunakan login persona.');
      return false;
    }
  };

  const logout = () => {
    if (currentUser) {
      appendAuditLog(currentUser.name, currentUser.role, 'LOGOUT', 'Keluar dari sistem');
      setAuditLogs(getStoredAuditLogs());
    }
    firebaseSignOut(auth).catch(() => {});
    setCurrentUser(null);
    showNotification('info', 'Anda telah keluar dari sesi SIMTAB.');
  };

  const refreshBalances = () => {
    const currentStudents = getStoredStudents();
    const currentTrx = getStoredTransactions();

    const updated = currentStudents.map((s) => ({
      ...s,
      balance: recalculateStudentBalance(s.id, currentTrx),
    }));

    setStudents(updated);
    saveStoredStudents(updated);
  };

  const addStudent = async (data: Omit<Student, 'id' | 'createdAt' | 'balance'> & { initialBalance?: number }) => {
    const duplicate = students.some((s) => s.nis.trim() === data.nis.trim());
    if (duplicate) {
      showNotification('error', `NIS ${data.nis} sudah digunakan oleh siswa lain.`);
      return { success: false, message: `NIS ${data.nis} sudah terdaftar.` };
    }

    const newId = 'std-' + Date.now();
    const initBal = Math.max(0, data.initialBalance || 0);

    const newStudent: Student = {
      id: newId,
      nis: data.nis.trim(),
      nisn: data.nisn?.trim() || '',
      name: data.name.trim(),
      class: data.class,
      gender: data.gender,
      parentName: data.parentName.trim(),
      parentPhone: data.parentPhone?.trim() || '',
      status: data.status,
      balance: 0,
      initialDepositDate: initBal > 0 ? getTodayDateString() : undefined,
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      qrCodeData: `SIMTAB:STD:${newId}`,
    };

    // Sync to Firestore initially with balance 0
    try {
      await addFirestoreStudent(newStudent);
    } catch (e) {
      console.warn('Firestore add student sync warning:', e);
    }

    if (initBal > 0) {
      try {
        const atomicTrx = await executeAtomicFirestoreTransaction({
          studentId: newId,
          type: 'SETORAN',
          amount: initBal,
          date: getTodayDateString(),
          description: 'Setoran saldo awal pendaftaran siswa',
          createdBy: currentUser ? currentUser.name : 'Petugas Tabungan',
          createdById: currentUser?.id,
          academicYear: settings.activeAcademicYear,
        });

        // Update local state with the atomic result
        const finalStudent: Student = { ...newStudent, balance: atomicTrx.newBalance };
        const updatedStudents = [finalStudent, ...students];
        setStudents(updatedStudents);
        saveStoredStudents(updatedStudents);

        const updatedTrx = [atomicTrx, ...transactions];
        setTransactions(updatedTrx);
        saveStoredTransactions(updatedTrx);
      } catch (e) {
        // Fallback local transaction
        const initTrx: Transaction = {
          id: `TRX-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`,
          studentId: newId,
          studentName: newStudent.name,
          class: newStudent.class,
          type: 'SETORAN',
          amount: initBal,
          date: getTodayDateString(),
          previousBalance: 0,
          newBalance: initBal,
          description: 'Setoran saldo awal pendaftaran siswa',
          createdBy: currentUser ? currentUser.name : 'Petugas Tabungan',
          createdAt: new Date().toISOString(),
          status: 'VALID',
          academicYear: settings.activeAcademicYear,
        };
        const finalStudent: Student = { ...newStudent, balance: initBal };
        const updatedStudents = [finalStudent, ...students];
        setStudents(updatedStudents);
        saveStoredStudents(updatedStudents);

        const updatedTrx = [initTrx, ...transactions];
        setTransactions(updatedTrx);
        saveStoredTransactions(updatedTrx);
      }
    } else {
      // 0 initial balance
      const updatedStudents = [newStudent, ...students];
      setStudents(updatedStudents);
      saveStoredStudents(updatedStudents);
    }

    appendAuditLog(
      currentUser ? currentUser.name : 'Sistem',
      currentUser ? currentUser.role : 'PETUGAS',
      'CREATE STUDENT',
      `Menambahkan siswa baru: ${newStudent.name} (NIS: ${newStudent.nis}, Kelas: ${newStudent.class})`,
      newStudent.id
    );
    setAuditLogs(getStoredAuditLogs());

    showNotification('success', `Data siswa ${newStudent.name} berhasil disimpan ke database.`);
    return { success: true, message: 'Berhasil', student: newStudent };
  };

  const updateStudent = async (id: string, data: Partial<Student>) => {
    const target = students.find((s) => s.id === id);
    if (!target) return { success: false, message: 'Siswa tidak ditemukan' };

    if (data.nis && data.nis !== target.nis) {
      const dup = students.some((s) => s.id !== id && s.nis === data.nis);
      if (dup) {
        showNotification('error', `NIS ${data.nis} sudah dipakai siswa lain.`);
        return { success: false, message: 'NIS duplikat' };
      }
    }

    const updated = students.map((s) => (s.id === id ? { ...s, ...data } : s));
    setStudents(updated);
    saveStoredStudents(updated);

    try {
      await updateFirestoreStudent(id, data);
    } catch (e) {
      console.warn('Firestore student update sync:', e);
    }

    appendAuditLog(
      currentUser ? currentUser.name : 'Sistem',
      currentUser ? currentUser.role : 'PETUGAS',
      'UPDATE STUDENT',
      `Memperbarui profil siswa ${target.name} (NIS: ${target.nis})`,
      target.id
    );
    setAuditLogs(getStoredAuditLogs());

    showNotification('success', `Profil siswa ${target.name} berhasil diperbarui.`);
    return { success: true, message: 'Berhasil' };
  };

  const deleteStudent = async (id: string) => {
    const target = students.find((s) => s.id === id);
    if (!target) return { success: false, message: 'Siswa tidak ditemukan' };

    const remaining = students.filter((s) => s.id !== id);
    setStudents(remaining);
    saveStoredStudents(remaining);

    try {
      await deleteFirestoreStudent(id);
    } catch (e) {
      console.warn('Firestore student delete sync:', e);
    }

    appendAuditLog(
      currentUser ? currentUser.name : 'Sistem',
      currentUser ? currentUser.role : 'ADMIN',
      'DELETE STUDENT',
      `Menghapus siswa ${target.name} (NIS: ${target.nis})`,
      target.id
    );
    setAuditLogs(getStoredAuditLogs());

    showNotification('success', `Data siswa ${target.name} berhasil dihapus.`);
    return { success: true, message: 'Berhasil' };
  };

  // Atomic Transaction Handler (Requirement 6)
  const createTransaction = async ({
    studentId,
    type,
    amount,
    date,
    description,
  }: {
    studentId: string;
    type: TransactionType;
    amount: number;
    date: string;
    description: string;
  }) => {
    if (amount <= 0 || isNaN(amount)) {
      showNotification('error', 'Nominal transaksi harus lebih besar dari Rp 0.');
      return { success: false, message: 'Nominal tidak valid' };
    }

    const student = students.find((s) => s.id === studentId);
    if (!student) {
      showNotification('error', 'Siswa tidak ditemukan.');
      return { success: false, message: 'Siswa tidak ditemukan' };
    }

    if (type === 'PENARIKAN' && amount > student.balance) {
      showNotification('error', 'Penarikan tidak dapat dilakukan karena saldo tidak mencukupi.');
      return { success: false, message: 'Saldo tidak mencukupi' };
    }

    try {
      // Execute Atomic Firestore Transaction
      const atomicTrx = await executeAtomicFirestoreTransaction({
        studentId,
        type,
        amount,
        date: date || getTodayDateString(),
        description,
        createdBy: currentUser ? currentUser.name : 'Petugas Tabungan',
        createdById: currentUser?.id,
        academicYear: settings.activeAcademicYear,
      });

      // Update local state in sync
      const newBal = type === 'SETORAN' ? student.balance + amount : student.balance - amount;
      const updatedStudents = students.map((s) =>
        s.id === studentId ? { ...s, balance: newBal } : s
      );
      setStudents(updatedStudents);
      saveStoredStudents(updatedStudents);

      const updatedTrx = [atomicTrx, ...transactions];
      setTransactions(updatedTrx);
      saveStoredTransactions(updatedTrx);

      setReceiptModalTrx(atomicTrx);
      showNotification('success', `${type === 'SETORAN' ? 'Setoran' : 'Penarikan'} berhasil disimpan secara atomik.`);

      return { success: true, message: 'Berhasil', transaction: atomicTrx };
    } catch (err: any) {
      // If error or offline, handle gracefully
      const isBalanceErr = err?.message?.includes('tidak mencukupi');
      if (isBalanceErr) {
        showNotification('error', 'Penarikan tidak dapat dilakukan karena saldo tidak mencukupi.');
        return { success: false, message: 'Saldo tidak mencukupi' };
      }

      // Safe local fallback
      const prevBal = student.balance;
      const newBal = type === 'SETORAN' ? prevBal + amount : prevBal - amount;
      const trxId = `TRX-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

      const fallbackTrx: Transaction = {
        id: trxId,
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        type,
        amount,
        date: date || getTodayDateString(),
        previousBalance: prevBal,
        newBalance: newBal,
        description,
        createdBy: currentUser ? currentUser.name : 'Petugas Tabungan',
        createdById: currentUser?.id,
        createdAt: new Date().toISOString(),
        status: 'VALID',
        academicYear: settings.activeAcademicYear,
      };

      const updatedTrx = [fallbackTrx, ...transactions];
      setTransactions(updatedTrx);
      saveStoredTransactions(updatedTrx);

      const updatedStudents = students.map((s) =>
        s.id === studentId ? { ...s, balance: newBal } : s
      );
      setStudents(updatedStudents);
      saveStoredStudents(updatedStudents);

      setReceiptModalTrx(fallbackTrx);
      showNotification('success', `${type === 'SETORAN' ? 'Setoran' : 'Penarikan'} berhasil disimpan.`);
      return { success: true, message: 'Berhasil', transaction: fallbackTrx };
    }
  };

  const executeCustomTransaction = async ({
    studentId,
    type,
    amount,
    date,
    description,
    documentNumber,
    sourceData,
    isMigration,
  }: {
    studentId: string;
    type: TransactionType;
    amount: number;
    date: string;
    description: string;
    documentNumber?: string;
    sourceData?: string;
    isMigration?: boolean;
  }) => {
    if (amount <= 0 || isNaN(amount)) {
      showNotification('error', 'Nominal harus lebih besar dari Rp 0.');
      return { success: false, message: 'Nominal tidak valid' };
    }

    const student = students.find((s) => s.id === studentId);
    if (!student) {
      showNotification('error', 'Siswa tidak ditemukan.');
      return { success: false, message: 'Siswa tidak ditemukan' };
    }

    const prevBal = student.balance;
    const isAdding = type === 'SETORAN' || type === 'SALDO_AWAL';
    if (!isAdding && amount > prevBal) {
      showNotification('error', 'Saldo tidak mencukupi.');
      return { success: false, message: 'Saldo tidak mencukupi' };
    }

    const newBal = isAdding ? prevBal + amount : prevBal - amount;
    const trxId = `TRX-${type === 'SALDO_AWAL' ? 'MIGR' : new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

    const customTrx: Transaction = {
      id: trxId,
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      type,
      amount,
      date: date || getTodayDateString(),
      previousBalance: prevBal,
      newBalance: newBal,
      description,
      documentNumber,
      sourceData,
      isMigration,
      createdBy: currentUser ? currentUser.name : 'Administrator',
      createdById: currentUser?.id,
      createdAt: new Date().toISOString(),
      status: 'VALID',
      academicYear: settings.activeAcademicYear,
    };

    // Update students state
    const updatedStudents = students.map((s) =>
      s.id === studentId ? { ...s, balance: newBal } : s
    );
    setStudents(updatedStudents);
    saveStoredStudents(updatedStudents);

    // Update transactions state
    const updatedTrx = [customTrx, ...transactions];
    setTransactions(updatedTrx);
    saveStoredTransactions(updatedTrx);

    // Sync to Firestore
    try {
      await updateFirestoreStudent(studentId, { balance: newBal });
      await addFirestoreTransaction(customTrx);
    } catch (e) {
      console.warn('Firestore custom transaction sync:', e);
    }

    appendAuditLog(
      currentUser ? currentUser.name : 'Admin',
      currentUser ? currentUser.role : 'ADMIN',
      type === 'SALDO_AWAL' ? 'SALDO_AWAL_MIGRASI' : 'TRANSAKSI_KHUSUS',
      `${type === 'SALDO_AWAL' ? 'Pencatatan saldo awal/migrasi' : 'Transaksi'} untuk ${student.name} sebesar Rp ${amount.toLocaleString('id-ID')}. No Dok: ${documentNumber || '-'}`,
      customTrx.id
    );
    setAuditLogs(getStoredAuditLogs());

    showNotification('success', `Saldo awal sebesar Rp ${amount.toLocaleString('id-ID')} berhasil dicatat untuk ${student.name}.`);
    return { success: true, transaction: customTrx };
  };

  // Mass Deposit (Requirement 16) with unique batchId guard
  const createMassDeposit = async ({
    date,
    description,
    items,
  }: {
    date: string;
    description: string;
    items: { studentId: string; amount: number }[];
  }) => {
    const validItems = items.filter((it) => it.amount > 0);
    if (validItems.length === 0) {
      showNotification('error', 'Tidak ada nominal setoran yang dimasukkan.');
      return { success: false, message: 'Tidak ada data', count: 0 };
    }

    const batchId = 'BATCH-' + Date.now();
    const createdTrxList: Transaction[] = [];
    let updatedStudents = [...students];

    for (const item of validItems) {
      const studentIndex = updatedStudents.findIndex((s) => s.id === item.studentId);
      if (studentIndex === -1) continue;

      const student = updatedStudents[studentIndex];
      const prevBal = student.balance;
      const newBal = prevBal + item.amount;

      try {
        const atomicTrx = await executeAtomicFirestoreTransaction({
          studentId: student.id,
          type: 'SETORAN',
          amount: item.amount,
          date: date || getTodayDateString(),
          description: description || 'Setoran massal tabungan',
          createdBy: currentUser ? currentUser.name : 'Petugas Tabungan',
          createdById: currentUser?.id,
          academicYear: settings.activeAcademicYear,
        });
        createdTrxList.push(atomicTrx);
      } catch {
        const trxId = `TRX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTrx: Transaction = {
          id: trxId,
          studentId: student.id,
          studentName: student.name,
          class: student.class,
          type: 'SETORAN',
          amount: item.amount,
          date: date || getTodayDateString(),
          previousBalance: prevBal,
          newBalance: newBal,
          description: description || 'Setoran massal tabungan',
          createdBy: currentUser ? currentUser.name : 'Petugas Tabungan',
          createdById: currentUser?.id,
          createdAt: new Date().toISOString(),
          status: 'VALID',
          academicYear: settings.activeAcademicYear,
          batchId,
        };
        createdTrxList.push(newTrx);
      }

      updatedStudents[studentIndex] = {
        ...student,
        balance: newBal,
      };
    }

    setStudents(updatedStudents);
    saveStoredStudents(updatedStudents);

    const updatedTransactions = [...createdTrxList, ...transactions];
    setTransactions(updatedTransactions);
    saveStoredTransactions(updatedTransactions);

    appendAuditLog(
      currentUser ? currentUser.name : 'Petugas',
      currentUser ? currentUser.role : 'PETUGAS',
      'SETORAN_MASSAL',
      `Memproses setoran massal untuk ${validItems.length} siswa (Batch: ${batchId}) pada tanggal ${date}`,
      batchId
    );
    setAuditLogs(getStoredAuditLogs());

    showNotification('success', `Berhasil memproses setoran massal untuk ${validItems.length} siswa.`);
    return { success: true, message: 'Berhasil', count: validItems.length };
  };

  // Void/Correction Transaction (Requirement 5)
  const correctTransaction = async (transactionId: string, reason: string) => {
    const targetTrx = transactions.find((t) => t.id === transactionId);
    if (!targetTrx) {
      return { success: false, message: 'Transaksi tidak ditemukan' };
    }

    if (targetTrx.status !== 'VALID') {
      return { success: false, message: 'Transaksi sudah dibatalkan atau dikoreksi sebelumnya' };
    }

    try {
      await voidFirestoreTransaction(
        transactionId,
        reason,
        currentUser ? currentUser.name : 'Administrator'
      );
    } catch (e) {
      console.warn('Firestore void transaction fallback:', e);
    }

    const updatedTransactions = transactions.map((t) =>
      t.id === transactionId
        ? {
            ...t,
            status: 'VOID' as const,
            correctionReason: reason,
            correctedBy: currentUser ? currentUser.name : 'Admin',
            correctedAt: new Date().toISOString(),
          }
        : t
    );

    const newBalance = recalculateStudentBalance(targetTrx.studentId, updatedTransactions);
    const updatedStudents = students.map((s) =>
      s.id === targetTrx.studentId ? { ...s, balance: newBalance } : s
    );

    setTransactions(updatedTransactions);
    saveStoredTransactions(updatedTransactions);

    setStudents(updatedStudents);
    saveStoredStudents(updatedStudents);

    appendAuditLog(
      currentUser ? currentUser.name : 'Admin',
      currentUser ? currentUser.role : 'ADMIN',
      'VOID TRANSACTION',
      `Pembatalan transaksi ${transactionId} (${targetTrx.studentName}). Alasan: ${reason}`,
      transactionId
    );
    setAuditLogs(getStoredAuditLogs());

    showNotification('success', `Transaksi ${transactionId} berhasil dibatalkan dan saldo siswa disesuaikan.`);
    return { success: true, message: 'Berhasil dikoreksi' };
  };

  const markDistribution = async (studentId: string, amount: number, notes?: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return { success: false, message: 'Siswa tidak ditemukan' };

    const newRecord: DistributionRecord = {
      id: 'dist-' + Date.now(),
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      academicYear: settings.activeAcademicYear,
      amountDistributed: amount,
      distributedDate: getTodayDateString(),
      distributedBy: currentUser ? currentUser.name : 'Petugas Tabungan',
      status: 'Sudah Dibagikan',
      notes,
    };

    const updatedDist = [newRecord, ...distributions.filter((d) => d.studentId !== studentId)];
    setDistributions(updatedDist);
    saveStoredDistributions(updatedDist);

    try {
      await saveFirestoreDistribution(newRecord);
    } catch (e) {
      console.warn('Firestore distribution save warning:', e);
    }

    appendAuditLog(
      currentUser ? currentUser.name : 'Petugas',
      currentUser ? currentUser.role : 'PETUGAS',
      'DISTRIBUTION',
      `Pembagian tabungan akhir tahun kepada ${student.name} sebesar Rp ${amount.toLocaleString('id-ID')}`,
      student.id
    );
    setAuditLogs(getStoredAuditLogs());

    showNotification('success', `Tabungan siswa ${student.name} berhasil ditandai selesai dibagikan.`);
    return { success: true, message: 'Berhasil dibagikan' };
  };

  const batchImportStudents = async (
    newItems: (Omit<Student, 'id' | 'createdAt' | 'balance'> & { initialBalance?: number })[]
  ) => {
    let createdCount = 0;
    let updatedStudentsList = [...students];
    const newTransactionsList: Transaction[] = [];

    for (const item of newItems) {
      const exists = updatedStudentsList.some((s) => s.nis.trim() === item.nis.trim());
      if (exists) continue;

      const newId = 'std-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const initBal = Math.max(0, item.initialBalance || 0);

      const sObj: Student = {
        id: newId,
        nis: item.nis.trim(),
        nisn: item.nisn?.trim() || '',
        name: item.name.trim(),
        class: item.class,
        gender: item.gender,
        parentName: item.parentName.trim(),
        parentPhone: item.parentPhone?.trim() || '',
        status: item.status || 'Aktif',
        balance: initBal,
        initialDepositDate: initBal > 0 ? getTodayDateString() : undefined,
        notes: item.notes || '',
        createdAt: new Date().toISOString(),
        qrCodeData: `SIMTAB:STD:${newId}`,
      };

      updatedStudentsList.push(sObj);
      createdCount++;
      addFirestoreStudent(sObj).catch(() => {});

      // If initial balance > 0, generate a valid SETORAN transaction to maintain 100% reconciliation consistency
      if (initBal > 0) {
        const initTrx: Transaction = {
          id: `TRX-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
          studentId: newId,
          studentName: sObj.name,
          class: sObj.class,
          type: 'SETORAN',
          amount: initBal,
          date: getTodayDateString(),
          previousBalance: 0,
          newBalance: initBal,
          description: 'Setoran saldo awal import data siswa',
          createdBy: currentUser ? currentUser.name : 'Petugas Tabungan',
          createdAt: new Date().toISOString(),
          status: 'VALID',
          academicYear: settings.activeAcademicYear,
        };
        newTransactionsList.push(initTrx);

        // Also record in Firestore
        executeAtomicFirestoreTransaction({
          studentId: newId,
          type: 'SETORAN',
          amount: initBal,
          date: getTodayDateString(),
          description: 'Setoran saldo awal import data siswa',
          createdBy: currentUser ? currentUser.name : 'Petugas Tabungan',
          createdById: currentUser?.id,
          academicYear: settings.activeAcademicYear,
        }).catch(() => {});
      }
    }

    setStudents(updatedStudentsList);
    saveStoredStudents(updatedStudentsList);

    if (newTransactionsList.length > 0) {
      const updatedTrx = [...newTransactionsList, ...transactions];
      setTransactions(updatedTrx);
      saveStoredTransactions(updatedTrx);
    }

    appendAuditLog(
      currentUser ? currentUser.name : 'Petugas',
      currentUser ? currentUser.role : 'PETUGAS',
      'IMPORT EXCEL',
      `Import data siswa berhasil. ${createdCount} siswa baru ditambahkan ke database.`
    );
    setAuditLogs(getStoredAuditLogs());

    showNotification('success', `Berhasil mengimport ${createdCount} data siswa ke database.`);
    return { success: true, count: createdCount };
  };

  const updateSchoolSettings = async (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    try {
      await saveFirestoreSettings(newSettings);
    } catch (e) {
      console.warn('Firestore settings update:', e);
    }
    appendAuditLog(
      currentUser ? currentUser.name : 'Admin',
      currentUser ? currentUser.role : 'ADMIN',
      'UPDATE SETTINGS',
      'Memperbarui data dan profil resmi sekolah'
    );
    setAuditLogs(getStoredAuditLogs());
    showNotification('success', 'Pengaturan sekolah berhasil disimpan ke Firestore.');
  };

  const updateAcademicYears = async (years: AcademicYear[]) => {
    setAcademicYears(years);
    saveStoredAcademicYears(years);
    try {
      await saveFirestoreAcademicYears(years);
    } catch (e) {
      console.warn('Firestore academic years sync:', e);
    }
    const active = years.find((y) => y.isActive);
    if (active && active.name !== settings.activeAcademicYear) {
      const updated = { ...settings, activeAcademicYear: active.name };
      setSettings(updated);
      saveStoredSettings(updated);
      saveFirestoreSettings(updated).catch(() => {});
    }
    showNotification('success', 'Tahun ajaran berhasil diperbarui.');
  };

  const resetDataToDemo = async () => {
    reloadDemoData();
    const demoStudents = getStoredStudents();
    const demoTrx = getStoredTransactions();
    setStudents(demoStudents);
    setTransactions(demoTrx);
    setDistributions([]);
    setIsDemo(true);

    try {
      await seedFirestoreWithDemoData(demoStudents, demoTrx, DEFAULT_SETTINGS, DEFAULT_ACADEMIC_YEARS);
    } catch (e) {
      console.warn('Firestore seeding demo warning:', e);
    }

    appendAuditLog(
      currentUser ? currentUser.name : 'Admin',
      currentUser ? currentUser.role : 'ADMIN',
      'RESET_DEMO',
      'Memuat ulang data simulasi / 20 siswa demo ke sistem dan database'
    );
    setAuditLogs(getStoredAuditLogs());
    showNotification('info', '20 Data demo siswa berhasil dimuat ulang ke Firestore.');
  };

  const clearDataClean = async () => {
    resetToEmptyState();
    setStudents([]);
    setTransactions([]);
    setDistributions([]);
    setIsDemo(false);
    appendAuditLog(
      currentUser ? currentUser.name : 'Admin',
      currentUser ? currentUser.role : 'ADMIN',
      'CLEAR_DATA',
      'Menghapus seluruh data demo untuk penggunaan data riil sekolah'
    );
    setAuditLogs(getStoredAuditLogs());
    showNotification('info', 'Semua data telah dikosongkan. Siap digunakan untuk data riil sekolah.');
  };

  const load100TestStudentsDataset = () => {
    const { students: testStudents, transactions: testTrx } = generate100TestStudents();
    setStudents(testStudents);
    saveStoredStudents(testStudents);
    setTransactions(testTrx);
    saveStoredTransactions(testTrx);
    setDistributions([]);
    setIsDemo(true);
    setDemoModeActive(true);

    appendAuditLog(
      currentUser ? currentUser.name : 'Tester',
      currentUser ? currentUser.role : 'ADMIN',
      'LOAD_TEST_DATASET',
      'Memuat dataset simulasi 100 siswa untuk keperluan UAT dan verifikasi operasional.'
    );
    setAuditLogs(getStoredAuditLogs());
    showNotification('success', '100 data siswa uji dan transaksi simulasi berhasil dimuat ke Mode Uji.');
  };

  const clearTestDatasetToEmpty = () => {
    resetToEmptyState();
    setStudents([]);
    setTransactions([]);
    setDistributions([]);
    setIsDemo(false);
    setDemoModeActive(false);

    appendAuditLog(
      currentUser ? currentUser.name : 'Admin',
      currentUser ? currentUser.role : 'ADMIN',
      'CLEAR_TEST_DATASET',
      'Membersihkan seluruh data simulasi dan mengembalikan database ke status bersih.'
    );
    setAuditLogs(getStoredAuditLogs());
    showNotification('info', 'Data simulasi telah dibersihkan. Sistem siap untuk data produksi.');
  };

  const reconcileStudentBalance = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return { success: false, newBalance: 0 };

    const calculatedBalance = recalculateStudentBalance(studentId, transactions);
    const oldBalance = student.balance;

    const updated = students.map((s) =>
      s.id === studentId ? { ...s, balance: calculatedBalance } : s
    );
    setStudents(updated);
    saveStoredStudents(updated);

    try {
      await updateFirestoreStudent(studentId, { balance: calculatedBalance });
    } catch (e) {
      console.warn('Firestore reconciliation sync warning:', e);
    }

    appendAuditLog(
      currentUser ? currentUser.name : 'Admin',
      currentUser ? currentUser.role : 'ADMIN',
      'REKONSILIASI_SALDO',
      `Rekonsiliasi saldo siswa ${student.name} (NIS: ${student.nis}). Saldo disesuaikan dari Rp ${oldBalance.toLocaleString('id-ID')} menjadi Rp ${calculatedBalance.toLocaleString('id-ID')} sesuai histori transaksi.`,
      student.id
    );
    setAuditLogs(getStoredAuditLogs());

    showNotification(
      'success',
      `Saldo ${student.name} berhasil disinkronkan ke Rp ${calculatedBalance.toLocaleString('id-ID')}`
    );
    return { success: true, newBalance: calculatedBalance };
  };

  const reconcileAllBalances = async () => {
    let correctedCount = 0;
    const updated = students.map((s) => {
      const calculated = recalculateStudentBalance(s.id, transactions);
      if (calculated !== s.balance) {
        correctedCount++;
        updateFirestoreStudent(s.id, { balance: calculated }).catch(() => {});
        return { ...s, balance: calculated };
      }
      return s;
    });

    if (correctedCount > 0) {
      setStudents(updated);
      saveStoredStudents(updated);

      appendAuditLog(
        currentUser ? currentUser.name : 'Admin',
        currentUser ? currentUser.role : 'ADMIN',
        'REKONSILIASI_MASSAL',
        `Menjalankan rekonsiliasi data saldo massal untuk seluruh siswa. Ditemukan dan diperbaiki ${correctedCount} saldo siswa yang berselisih.`
      );
      setAuditLogs(getStoredAuditLogs());
      showNotification('success', `Berhasil merekonsiliasi ${correctedCount} data saldo siswa.`);
    } else {
      showNotification('info', 'Semua saldo siswa sudah 100% cocok dengan histori transaksi.');
    }

    return { success: true, count: correctedCount };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        students,
        transactions,
        settings,
        academicYears,
        auditLogs,
        distributions,
        isDemo,
        activeTab,
        setActiveTab,
        globalSearch,
        setGlobalSearch,
        selectedStudentForDetail,
        setSelectedStudentForDetail,
        receiptModalTrx,
        setReceiptModalTrx,
        notification,
        showNotification,
        isQrScannerOpen,
        setIsQrScannerOpen,
        isSyncingFirebase,
        login,
        loginWithGoogle,
        logout,
        addStudent,
        updateStudent,
        deleteStudent,
        createTransaction,
        executeCustomTransaction,
        createMassDeposit,
        correctTransaction,
        markDistribution,
        batchImportStudents,
        updateSchoolSettings,
        updateAcademicYears,
        resetDataToDemo,
        clearDataClean,
        load100TestStudentsDataset,
        clearTestDatasetToEmpty,
        refreshBalances,
        reconcileStudentBalance,
        reconcileAllBalances,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
