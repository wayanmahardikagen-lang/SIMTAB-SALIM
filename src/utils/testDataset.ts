import { Student, Transaction } from '../types';

/**
 * SIMTAB Test & Simulation Dataset Generator
 * Generates 100 test students with diverse financial and activity profiles
 * to satisfy UAT, Operational Simulation, and Balance Integrity audits.
 */
export function generate100TestStudents(): { students: Student[]; transactions: Transaction[] } {
  const students: Student[] = [];
  const transactions: Transaction[] = [];

  const classes = ['1', '2', '3', '4', '5', '6'];
  const today = '2026-10-04';
  const pastDates = [
    '2026-08-01',
    '2026-08-05',
    '2026-08-12',
    '2026-08-20',
    '2026-09-02',
    '2026-09-10',
    '2026-09-15',
    '2026-09-22',
    '2026-10-01',
    '2026-10-04'
  ];

  let trxCounter = 1;

  for (let i = 1; i <= 100; i++) {
    const padNumber = i.toString().padStart(3, '0');
    const studentId = `test-std-${padNumber}`;
    const assignedClass = classes[(i - 1) % classes.length];
    const isInactive = i === 99 || i === 100; // 2 inactive students for filter testing
    const gender = i % 2 === 0 ? 'P' : 'L';

    // Different student behaviors:
    // Profile A (1-10): Champion frequent savers (high saving days)
    // Profile B (11-20): Multiple deposits on same day (test saving days = 1 day rule)
    // Profile C (21-40): Mixed deposits & withdrawals
    // Profile D (41-60): Moderate regular savers
    // Profile E (61-80): Low frequency savers
    // Profile F (81-90): Zero balance (never saved or withdrew all)
    // Profile G (91-98): Initial balance migration + deposits
    // Profile H (99-100): Inactive students

    let studentBalance = 0;
    const studentTrxList: Transaction[] = [];

    if (i >= 1 && i <= 10) {
      // Frequent savers: 8-10 distinct saving days
      const daysCount = 6 + (i % 5);
      for (let d = 0; d < daysCount; d++) {
        const date = pastDates[d];
        const amount = 10000 + (i * 2000);
        const prevBal = studentBalance;
        studentBalance += amount;
        const trxId = `TRX-TEST-${trxCounter.toString().padStart(5, '0')}`;
        trxCounter++;

        studentTrxList.push({
          id: trxId,
          studentId,
          studentName: `Siswa Test ${padNumber}`,
          class: assignedClass,
          type: 'SETORAN',
          amount,
          date,
          previousBalance: prevBal,
          newBalance: studentBalance,
          description: `Setoran rutin hari ke-${d + 1}`,
          createdBy: 'Petugas Test',
          createdAt: `${date}T08:${10 + d}:00Z`,
          status: 'VALID',
          academicYear: '2026/2027',
        });
      }
    } else if (i >= 11 && i <= 20) {
      // Multiple deposits on the SAME DAY (pagi, siang, sore)
      // To strictly test that 3 transactions on same day = 1 saving day!
      const testDate = pastDates[2]; // '2026-08-12'
      const morningAmt = 10000;
      const noonAmt = 20000;
      const afternoonAmt = 30000;

      // Trx 1: Pagi
      let prevBal = studentBalance;
      studentBalance += morningAmt;
      studentTrxList.push({
        id: `TRX-TEST-${trxCounter.toString().padStart(5, '0')}`,
        studentId,
        studentName: `Siswa Test ${padNumber}`,
        class: assignedClass,
        type: 'SETORAN',
        amount: morningAmt,
        date: testDate,
        previousBalance: prevBal,
        newBalance: studentBalance,
        description: 'Setoran pagi',
        createdBy: 'Petugas Test',
        createdAt: `${testDate}T07:30:00Z`,
        status: 'VALID',
        academicYear: '2026/2027',
      });
      trxCounter++;

      // Trx 2: Siang
      prevBal = studentBalance;
      studentBalance += noonAmt;
      studentTrxList.push({
        id: `TRX-TEST-${trxCounter.toString().padStart(5, '0')}`,
        studentId,
        studentName: `Siswa Test ${padNumber}`,
        class: assignedClass,
        type: 'SETORAN',
        amount: noonAmt,
        date: testDate,
        previousBalance: prevBal,
        newBalance: studentBalance,
        description: 'Setoran siang',
        createdBy: 'Petugas Test',
        createdAt: `${testDate}T11:45:00Z`,
        status: 'VALID',
        academicYear: '2026/2027',
      });
      trxCounter++;

      // Trx 3: Sore
      prevBal = studentBalance;
      studentBalance += afternoonAmt;
      studentTrxList.push({
        id: `TRX-TEST-${trxCounter.toString().padStart(5, '0')}`,
        studentId,
        studentName: `Siswa Test ${padNumber}`,
        class: assignedClass,
        type: 'SETORAN',
        amount: afternoonAmt,
        date: testDate,
        previousBalance: prevBal,
        newBalance: studentBalance,
        description: 'Setoran sore',
        createdBy: 'Petugas Test',
        createdAt: `${testDate}T15:00:00Z`,
        status: 'VALID',
        academicYear: '2026/2027',
      });
      trxCounter++;
    } else if (i >= 21 && i <= 40) {
      // Mixed deposits and withdrawals
      // Dep 1: 100.000
      let prevBal = studentBalance;
      studentBalance += 100000;
      studentTrxList.push({
        id: `TRX-TEST-${trxCounter.toString().padStart(5, '0')}`,
        studentId,
        studentName: `Siswa Test ${padNumber}`,
        class: assignedClass,
        type: 'SETORAN',
        amount: 100000,
        date: pastDates[1],
        previousBalance: prevBal,
        newBalance: studentBalance,
        description: 'Setoran awal semester',
        createdBy: 'Petugas Test',
        createdAt: `${pastDates[1]}T08:00:00Z`,
        status: 'VALID',
        academicYear: '2026/2027',
      });
      trxCounter++;

      // Withdrawal: 25.000 (leaves 75.000)
      prevBal = studentBalance;
      studentBalance -= 25000;
      studentTrxList.push({
        id: `TRX-TEST-${trxCounter.toString().padStart(5, '0')}`,
        studentId,
        studentName: `Siswa Test ${padNumber}`,
        class: assignedClass,
        type: 'PENARIKAN',
        amount: 25000,
        date: pastDates[4],
        previousBalance: prevBal,
        newBalance: studentBalance,
        description: 'Penarikan beli seragam pramuka',
        createdBy: 'Petugas Test',
        createdAt: `${pastDates[4]}T09:30:00Z`,
        status: 'VALID',
        academicYear: '2026/2027',
      });
      trxCounter++;

      // Another deposit: 15.000 (leaves 90.000)
      prevBal = studentBalance;
      studentBalance += 15000;
      studentTrxList.push({
        id: `TRX-TEST-${trxCounter.toString().padStart(5, '0')}`,
        studentId,
        studentName: `Siswa Test ${padNumber}`,
        class: assignedClass,
        type: 'SETORAN',
        amount: 15000,
        date: pastDates[6],
        previousBalance: prevBal,
        newBalance: studentBalance,
        description: 'Setoran mingguan',
        createdBy: 'Petugas Test',
        createdAt: `${pastDates[6]}T08:15:00Z`,
        status: 'VALID',
        academicYear: '2026/2027',
      });
      trxCounter++;
    } else if (i >= 41 && i <= 80) {
      // Regular moderate savers
      const amt = 20000 + ((i % 5) * 5000);
      const prevBal = studentBalance;
      studentBalance += amt;
      studentTrxList.push({
        id: `TRX-TEST-${trxCounter.toString().padStart(5, '0')}`,
        studentId,
        studentName: `Siswa Test ${padNumber}`,
        class: assignedClass,
        type: 'SETORAN',
        amount: amt,
        date: pastDates[i % pastDates.length],
        previousBalance: prevBal,
        newBalance: studentBalance,
        description: 'Setoran tabungan berkala',
        createdBy: 'Petugas Test',
        createdAt: `${pastDates[i % pastDates.length]}T08:20:00Z`,
        status: 'VALID',
        academicYear: '2026/2027',
      });
      trxCounter++;
    } else if (i >= 91 && i <= 98) {
      // Initial migration balance + deposit
      const migrationAmt = 150000;
      let prevBal = studentBalance;
      studentBalance += migrationAmt;
      studentTrxList.push({
        id: `TRX-TEST-${trxCounter.toString().padStart(5, '0')}`,
        studentId,
        studentName: `Siswa Test ${padNumber}`,
        class: assignedClass,
        type: 'SALDO_AWAL',
        amount: migrationAmt,
        date: '2026-07-15',
        previousBalance: prevBal,
        newBalance: studentBalance,
        description: 'Migrasi Saldo Awal Pembukuan Manual TA 2025/2026',
        createdBy: 'Administrator (Admin)',
        documentNumber: `DOC-MIGRASI-2026-${padNumber}`,
        sourceData: 'Buku Kas Tabungan Fisik Halaman 12',
        isMigration: true,
        createdAt: '2026-07-15T08:00:00Z',
        status: 'VALID',
        academicYear: '2026/2027',
      });
      trxCounter++;

      // Additional normal deposit
      prevBal = studentBalance;
      studentBalance += 20000;
      studentTrxList.push({
        id: `TRX-TEST-${trxCounter.toString().padStart(5, '0')}`,
        studentId,
        studentName: `Siswa Test ${padNumber}`,
        class: assignedClass,
        type: 'SETORAN',
        amount: 20000,
        date: pastDates[3],
        previousBalance: prevBal,
        newBalance: studentBalance,
        description: 'Setoran tambahan semester ganjil',
        createdBy: 'Petugas Test',
        createdAt: `${pastDates[3]}T08:30:00Z`,
        status: 'VALID',
        academicYear: '2026/2027',
      });
      trxCounter++;
    }

    const firstValidDeposit = studentTrxList.find(t => t.type === 'SETORAN' && t.status === 'VALID');

    students.push({
      id: studentId,
      nis: `10${padNumber}`,
      nisn: `0089${padNumber}123`,
      name: `Siswa Test ${padNumber}`,
      class: assignedClass,
      gender,
      parentName: `Orang Tua Test ${padNumber}`,
      parentPhone: `081234567${padNumber}`,
      status: isInactive ? 'Pindah' : 'Aktif',
      balance: studentBalance,
      initialDepositDate: firstValidDeposit?.date,
      notes: isInactive ? 'Siswa pindah sekolah per September 2026' : 'Data simulasi UAT',
      createdAt: '2026-08-01T07:00:00Z',
      qrCodeData: `SIMTAB:STD:${studentId}`,
    });

    transactions.push(...studentTrxList);
  }

  return { students, transactions };
}
