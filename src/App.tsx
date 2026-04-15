import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin / Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import OverviewPage from './pages/dashboard/OverviewPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes inside PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Internal Shared Dashboard Routes (Player, Coach, Club) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              {/* Placeholders for upcoming features */}
              <Route path="profile" element={<div className="p-6 text-white">Perfil (En construcció)</div>} />
              <Route path="opportunities" element={<div className="p-6 text-white">Oportunitats (En construcció)</div>} />
              <Route path="analytics" element={<div className="p-6 text-white">Analítiques (En construcció)</div>} />
            </Route>
          </Route>

          {/* Admin Routes inside AdminLayout (Protected) */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<div className="p-4"><p>Admin Users placeholder</p></div>} />
            </Route>
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
