import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import {
  Student,
  Transaction,
  SchoolSettings,
  AcademicYear,
  AuditLog,
  DistributionRecord,
  UserAccount,
  TransactionType
} from '../types';
import { getTodayDateString } from '../utils/format';

/**
 * Service to interact with Cloud Firestore with atomic transactions
 */

// --- STUDENTS ---
export async function getFirestoreStudents(): Promise<Student[]> {
  try {
    const snap = await getDocs(collection(db, 'students'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'students', auth.currentUser);
  }
}

export function subscribeFirestoreStudents(
  onUpdate: (students: Student[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, 'students'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student));
      onUpdate(list);
    },
    (err) => {
      if (onError) onError(err);
      console.warn('Students subscription error:', err);
    }
  );
}

export async function addFirestoreStudent(student: Student): Promise<void> {
  try {
    await setDoc(doc(db, 'students', student.id), {
      ...student,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `students/${student.id}`, auth.currentUser);
  }
}

export async function updateFirestoreStudent(id: string, updates: Partial<Student>): Promise<void> {
  try {
    await updateDoc(doc(db, 'students', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `students/${id}`, auth.currentUser);
  }
}

export async function deleteFirestoreStudent(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'students', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `students/${id}`, auth.currentUser);
  }
}

// --- TRANSACTIONS (ATOMIC TRANSACTION WITH FIRESTORE) ---
export async function getFirestoreTransactions(): Promise<Transaction[]> {
  try {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'transactions', auth.currentUser);
  }
}

export function subscribeFirestoreTransactions(
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
      onUpdate(list);
    },
    (err) => {
      if (onError) onError(err);
      console.warn('Transactions subscription error:', err);
    }
  );
}

/**
 * Execute an atomic transaction in Firestore (Requirement 6):
 * Guarantees that concurrent deposits/withdrawals calculate balances safely without race condition.
 */
export async function executeAtomicFirestoreTransaction(params: {
  studentId: string;
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
  createdBy: string;
  createdById?: string;
  academicYear: string;
  trxId?: string;
}): Promise<Transaction> {
  const { studentId, type, amount, date, description, createdBy, createdById, academicYear } = params;

  try {
    return await runTransaction(db, async (firestoreTx) => {
      const studentRef = doc(db, 'students', studentId);
      const studentDoc = await firestoreTx.get(studentRef);

      if (!studentDoc.exists()) {
        throw new Error('Data siswa tidak ditemukan di database.');
      }

      const studentData = studentDoc.data() as Student;
      const currentBalance = studentData.balance || 0;

      if (type === 'PENARIKAN' && amount > currentBalance) {
        throw new Error('Penarikan tidak dapat dilakukan karena saldo tidak mencukupi.');
      }

      const isDepositOrInitial = type === 'SETORAN' || type === 'SALDO_AWAL';
      const newBalance = isDepositOrInitial ? currentBalance + amount : currentBalance - amount;
      const trxId = params.trxId || `TRX-${type === 'SALDO_AWAL' ? 'MIGR' : new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

      const newTrx: Transaction = {
        id: trxId,
        studentId: studentData.id,
        studentName: studentData.name,
        class: studentData.class,
        type,
        amount,
        date: date || getTodayDateString(),
        previousBalance: currentBalance,
        newBalance,
        description: description || (type === 'SETORAN' ? 'Setoran tabungan' : type === 'SALDO_AWAL' ? 'Saldo awal / migrasi data' : 'Penarikan tabungan'),
        createdBy,
        createdById: createdById || auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
        status: 'VALID',
        academicYear,
      };

      // 1. Update Student Balance
      firestoreTx.update(studentRef, {
        balance: newBalance,
        initialDepositDate: studentData.initialDepositDate || newTrx.date,
        updatedAt: serverTimestamp(),
      });

      // 2. Insert Transaction Record
      const trxRef = doc(db, 'transactions', trxId);
      firestoreTx.set(trxRef, newTrx);

      // 3. Append to Audit Log inside atomic transaction
      const logId = 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const logRef = doc(db, 'audit_logs', logId);
      firestoreTx.set(logRef, {
        id: logId,
        timestamp: new Date().toISOString(),
        userId: createdById || auth.currentUser?.uid || 'petugas',
        userName: createdBy,
        role: 'PETUGAS',
        action: type === 'SETORAN' ? 'TRANSAKSI_SETORAN' : 'TRANSAKSI_PENARIKAN',
        targetId: trxId,
        details: `${type} untuk ${studentData.name} sebesar Rp ${amount.toLocaleString('id-ID')}. No: ${trxId}`,
      });

      return newTrx;
    });
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `transactions/${params.studentId}`, auth.currentUser);
  }
}

export async function addFirestoreTransaction(trx: Transaction): Promise<void> {
  try {
    await setDoc(doc(db, 'transactions', trx.id), trx);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `transactions/${trx.id}`, auth.currentUser);
  }
}

/**
 * Void/Correct an existing transaction (Requirement 5)
 */
export async function voidFirestoreTransaction(
  transactionId: string,
  reason: string,
  correctedBy: string
): Promise<void> {
  try {
    await runTransaction(db, async (firestoreTx) => {
      const trxRef = doc(db, 'transactions', transactionId);
      const trxDoc = await firestoreTx.get(trxRef);

      if (!trxDoc.exists()) {
        throw new Error('Transaksi tidak ditemukan.');
      }

      const trxData = trxDoc.data() as Transaction;
      if (trxData.status === 'VOID' || trxData.status === 'DIKOREKSI') {
        throw new Error('Transaksi sudah dibatalkan sebelumnya.');
      }

      const studentRef = doc(db, 'students', trxData.studentId);
      const studentDoc = await firestoreTx.get(studentRef);

      if (studentDoc.exists()) {
        const studentData = studentDoc.data() as Student;
        // Revert balance: if voided transaction was SETORAN, decrease; if PENARIKAN, increase
        const balanceAdjustment = trxData.type === 'SETORAN' ? -trxData.amount : trxData.amount;
        const adjustedBalance = studentData.balance + balanceAdjustment;

        firestoreTx.update(studentRef, {
          balance: adjustedBalance,
          updatedAt: serverTimestamp(),
        });
      }

      // Mark transaction status as VOID
      firestoreTx.update(trxRef, {
        status: 'VOID',
        correctionReason: reason,
        correctedBy,
        correctedAt: new Date().toISOString(),
      });

      // Audit Log
      const logId = 'log-' + Date.now();
      const logRef = doc(db, 'audit_logs', logId);
      firestoreTx.set(logRef, {
        id: logId,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser?.uid || 'admin',
        userName: correctedBy,
        role: 'ADMIN',
        action: 'VOID_TRANSACTION',
        targetId: transactionId,
        details: `Pembatalan transaksi ${transactionId} (${trxData.studentName}). Alasan: ${reason}`,
      });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `transactions/${transactionId}`, auth.currentUser);
  }
}

// --- SETTINGS ---
export async function getFirestoreSettings(): Promise<SchoolSettings | null> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'main'));
    return snap.exists() ? (snap.data() as SchoolSettings) : null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'settings/main', auth.currentUser);
  }
}

export async function saveFirestoreSettings(settings: SchoolSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'main'), settings);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/main', auth.currentUser);
  }
}

// --- ACADEMIC YEARS ---
export async function getFirestoreAcademicYears(): Promise<AcademicYear[]> {
  try {
    const snap = await getDocs(collection(db, 'academic_years'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AcademicYear));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'academic_years', auth.currentUser);
  }
}

export async function saveFirestoreAcademicYears(years: AcademicYear[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    years.forEach((y) => {
      batch.set(doc(db, 'academic_years', y.id), y);
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'academic_years', auth.currentUser);
  }
}

// --- AUDIT LOGS ---
export async function getFirestoreAuditLogs(): Promise<AuditLog[]> {
  try {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'audit_logs', auth.currentUser);
  }
}

export async function addFirestoreAuditLog(log: AuditLog): Promise<void> {
  try {
    await setDoc(doc(db, 'audit_logs', log.id), log);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `audit_logs/${log.id}`, auth.currentUser);
  }
}

// --- DISTRIBUTIONS ---
export async function getFirestoreDistributions(): Promise<DistributionRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'distribution_records'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DistributionRecord));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'distribution_records', auth.currentUser);
  }
}

export async function saveFirestoreDistribution(record: DistributionRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'distribution_records', record.id), record);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `distribution_records/${record.id}`, auth.currentUser);
  }
}

// --- SEED INITIAL FIRESTORE DATA ---
export async function seedFirestoreWithDemoData(
  demoStudents: Student[],
  demoTransactions: Transaction[],
  defaultSettings: SchoolSettings,
  defaultYears: AcademicYear[]
): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Settings
    batch.set(doc(db, 'settings', 'main'), defaultSettings);

    // Academic Years
    defaultYears.forEach((y) => {
      batch.set(doc(db, 'academic_years', y.id), y);
    });

    // Students
    demoStudents.forEach((s) => {
      batch.set(doc(db, 'students', s.id), s);
    });

    // Transactions
    demoTransactions.forEach((t) => {
      batch.set(doc(db, 'transactions', t.id), t);
    });

    // Initial log
    const initLog: AuditLog = {
      id: 'log-seed-' + Date.now(),
      timestamp: new Date().toISOString(),
      userName: 'Sistem SIMTAB',
      role: 'ADMIN',
      action: 'INISIALISASI_DATABASE',
      details: 'Inisialisasi koleksi Cloud Firestore SIMTAB SDN 1 Loloan Timur',
    };
    batch.set(doc(db, 'audit_logs', initLog.id), initLog);

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'seed_data', auth.currentUser);
  }
}
