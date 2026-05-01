import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import PricingPage from './pages/public/PricingPage';
import AboutPage from './pages/public/AboutPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';
import CookiesPage from './pages/public/CookiesPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AuthActionPage from './pages/auth/AuthActionPage';

// Admin / Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import OverviewPage from './pages/dashboard/OverviewPage';
import OpportunitiesPage from './pages/dashboard/OpportunitiesPage';
import OpportunityDetailPage from './pages/dashboard/OpportunityDetailPage';
import CreateOpportunityPage from './pages/dashboard/CreateOpportunityPage';
import EditOpportunityPage from './pages/dashboard/EditOpportunityPage';
import MyOpportunitiesPage from './pages/dashboard/MyOpportunitiesPage';
import ApplicationsPage from './pages/dashboard/ApplicationsPage';
import MessagesPage from './pages/dashboard/MessagesPage';
import MessageDetailPage from './pages/dashboard/MessageDetailPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import PublicProfilePage from './pages/dashboard/PublicProfilePage';
import CheckoutSuccessPage from './pages/dashboard/CheckoutSuccessPage';
import BillingPage from './pages/dashboard/BillingPage';
import PrelaunchPage from './pages/public/PrelaunchPage';
import { PRELAUNCH_MODE } from './config/site';

function App() {
  const publicFallback = PRELAUNCH_MODE ? <PrelaunchPage /> : <HomePage />;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes inside PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={publicFallback} />
            
            {/* Pricing (public) */}
            <Route path="/pricing" element={PRELAUNCH_MODE ? <Navigate to="/" replace /> : <PricingPage />} />
            
            {/* About (public) */}
            <Route path="/about" element={PRELAUNCH_MODE ? <Navigate to="/" replace /> : <AboutPage />} />

            {/* Legal (public) */}
            <Route path="/privacy" element={PRELAUNCH_MODE ? <Navigate to="/" replace /> : <PrivacyPage />} />
            <Route path="/terms" element={PRELAUNCH_MODE ? <Navigate to="/" replace /> : <TermsPage />} />
            <Route path="/cookies" element={PRELAUNCH_MODE ? <Navigate to="/" replace /> : <CookiesPage />} />
            <Route path="/contact" element={PRELAUNCH_MODE ? <Navigate to="/" replace /> : <ContactPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={PRELAUNCH_MODE ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/register" element={PRELAUNCH_MODE ? <Navigate to="/" replace /> : <RegisterPage />} />
            <Route path="/forgot-password" element={PRELAUNCH_MODE ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
            <Route path="/auth/action" element={PRELAUNCH_MODE ? <Navigate to="/" replace /> : <AuthActionPage />} />
          </Route>

          {/* Internal Shared Dashboard Routes (Player, Coach, Club) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              {/* Profile Route complet */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/:id" element={<PublicProfilePage />} />

              {/* Oportunitats niades clares */}
              <Route path="opportunities">
                <Route index element={<OpportunitiesPage />} />
                <Route path="mine" element={<MyOpportunitiesPage />} />
                <Route path="new" element={<CreateOpportunityPage />} />
                <Route path=":id" element={<OpportunityDetailPage />} />
                <Route path=":id/edit" element={<EditOpportunityPage />} />
              </Route>

              {/* Candidatures / Aplicacions */}
              <Route path="applications" element={<ApplicationsPage />} />

              {/* Checkout success (post-Stripe redirect) */}
              <Route path="checkout/success" element={<CheckoutSuccessPage />} />

              {/* Facturació (només Premium — la pàgina fa el guard intern) */}
              <Route path="billing" element={<BillingPage />} />

              {/* Missatgeria (Mock) */}
              <Route path="messages">
                <Route index element={<MessagesPage />} />
                <Route path=":id" element={<MessageDetailPage />} />
              </Route>
            </Route>
          </Route>

          {/* Admin Routes inside AdminLayout (Protected) */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
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
