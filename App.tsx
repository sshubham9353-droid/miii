import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LibraryProvider } from '@/context/LibraryContext';
import AppLayout from '@/components/AppLayout';
import HomePage from '@/pages/HomePage';
import RegistrationPage from '@/pages/RegistrationPage';
import StudentDashboardPage from '@/pages/StudentDashboardPage';
import SeatManagementPage from '@/pages/SeatManagementPage';
import FeeDashboardPage from '@/pages/FeeDashboardPage';
import PendingFeesPage from '@/pages/PendingFeesPage';
import PaymentHistoryPage from '@/pages/PaymentHistoryPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';

function App() {
  return (
    <LibraryProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/students" element={<StudentDashboardPage />} />
            <Route path="/seats" element={<SeatManagementPage />} />
            <Route path="/fees" element={<FeeDashboardPage />} />
            <Route path="/pending-fees" element={<PendingFeesPage />} />
            <Route path="/payment-history" element={<PaymentHistoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </LibraryProvider>
  );
}

export default App;
