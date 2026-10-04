import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { NotificationToast } from './components/common/NotificationToast';
import { ReceiptModal } from './components/common/ReceiptModal';
import { HelpGuideModal } from './components/common/HelpGuideModal';
import { AboutModal } from './components/common/AboutModal';
import { LoginView } from './components/auth/LoginView';
import { Dashboard } from './components/dashboard/Dashboard';
import { StudentsView } from './components/students/StudentsView';
import { TransactionDeposit } from './components/transactions/TransactionDeposit';
import { TransactionWithdraw } from './components/transactions/TransactionWithdraw';
import { MassDeposit } from './components/transactions/MassDeposit';
import { TransactionHistory } from './components/transactions/TransactionHistory';
import { RecapSavings } from './components/recap/RecapSavings';
import { RecapClass } from './components/recap/RecapClass';
import { SavingChampions } from './components/awards/SavingChampions';
import { SavingsDistribution } from './components/distribution/SavingsDistribution';
import { StudentReport } from './components/reports/StudentReport';
import { PassbookPrint } from './components/reports/PassbookPrint';
import { YearEndReport } from './components/reports/YearEndReport';
import { ExportHub } from './components/export/ExportHub';
import { SettingsView } from './components/settings/SettingsView';
import { AuditLogView } from './components/audit/AuditLogView';
import { ReconciliationView } from './components/admin/ReconciliationView';
import { CashReconciliationView } from './components/admin/CashReconciliationView';
import { InitialBalanceMigrationView } from './components/admin/InitialBalanceMigrationView';
import { SystemHealthView } from './components/admin/SystemHealthView';
import { UatChecklistView } from './components/admin/UatChecklistView';

const MainLayout: React.FC = () => {
  const { currentUser, activeTab } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  if (!currentUser) {
    return <LoginView />;
  }

  const isAdmin = currentUser.role === 'ADMIN';
  const isKepalaSekolah = currentUser.role === 'KEPALA_SEKOLAH';

  const renderContent = () => {
    // Role-based protection check (Requirement 30 & 35)
    if (isKepalaSekolah && (activeTab === 'deposit' || activeTab === 'withdraw' || activeTab === 'mass-deposit')) {
      return <Dashboard />;
    }

    if (!isAdmin && (activeTab === 'settings' || activeTab === 'reconciliation' || activeTab === 'system-health')) {
      return <Dashboard />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
      case 'import-excel':
        return <StudentsView />;
      case 'deposit':
        return <TransactionDeposit />;
      case 'withdraw':
        return <TransactionWithdraw />;
      case 'mass-deposit':
        return <MassDeposit />;
      case 'transactions':
        return <TransactionHistory />;
      case 'recap':
        return <RecapSavings />;
      case 'recap-class':
        return <RecapClass />;
      case 'champions':
        return <SavingChampions />;
      case 'distribution':
        return <SavingsDistribution />;
      case 'report-student':
        return <StudentReport />;
      case 'report-passbook':
        return <PassbookPrint />;
      case 'report-yearend':
        return <YearEndReport />;
      case 'export-excel':
        return <ExportHub />;
      case 'settings':
        return <SettingsView />;
      case 'audit-log':
        return <AuditLogView />;
      case 'reconciliation':
        return <ReconciliationView />;
      case 'cash-reconciliation':
        return <CashReconciliationView />;
      case 'initial-balance':
        return <InitialBalanceMigrationView />;
      case 'system-health':
        return <SystemHealthView />;
      case 'uat-checklist':
        return <UatChecklistView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 lg:p-8 min-w-0 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ReceiptModal />
      <NotificationToast />
      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        defaultRoleTab={isAdmin ? 'ADMIN' : 'PETUGAS'}
      />
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
