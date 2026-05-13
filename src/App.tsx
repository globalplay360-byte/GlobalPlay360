import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';

// Layouts (sempre al chunk inicial — lleugers)
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { PRIVATE_PREVIEW_MODE, PUBLIC_REGISTRATION_ENABLED } from './config/site';

// Pàgines en chunks separats: redueix el JS inicial (crític per a Safari iOS amb monòlits ~10MB+)
const HomePage = lazy(() => import('./pages/public/HomePage'));
const PricingPage = lazy(() => import('./pages/public/PricingPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const PrivacyPage = lazy(() => import('./pages/public/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/public/TermsPage'));
const CookiesPage = lazy(() => import('./pages/public/CookiesPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const AuthActionPage = lazy(() => import('./pages/auth/AuthActionPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminOpportunitiesPage = lazy(() => import('./pages/admin/AdminOpportunitiesPage'));
const OverviewPage = lazy(() => import('./pages/dashboard/OverviewPage'));
const OpportunitiesPage = lazy(() => import('./pages/dashboard/OpportunitiesPage'));
const OpportunityDetailPage = lazy(() => import('./pages/dashboard/OpportunityDetailPage'));
const CreateOpportunityPage = lazy(() => import('./pages/dashboard/CreateOpportunityPage'));
const EditOpportunityPage = lazy(() => import('./pages/dashboard/EditOpportunityPage'));
const MyOpportunitiesPage = lazy(() => import('./pages/dashboard/MyOpportunitiesPage'));
const ApplicationsPage = lazy(() => import('./pages/dashboard/ApplicationsPage'));
const MessagesPage = lazy(() => import('./pages/dashboard/MessagesPage'));
const MessageDetailPage = lazy(() => import('./pages/dashboard/MessageDetailPage'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const PublicProfilePage = lazy(() => import('./pages/dashboard/PublicProfilePage'));
const CheckoutSuccessPage = lazy(() => import('./pages/dashboard/CheckoutSuccessPage'));
const BillingPage = lazy(() => import('./pages/dashboard/BillingPage'));

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-[#0B1120] text-gray-100">
      <div
        className="h-9 w-9 rounded-full border-2 border-slate-600 border-t-blue-500 animate-spin"
        role="status"
        aria-label="Carregant"
      />
    </div>
  );
}

function App() {
  const registrationEnabled = PUBLIC_REGISTRATION_ENABLED && !PRIVATE_PREVIEW_MODE;
  const dashboardRequiredRole = PRIVATE_PREVIEW_MODE ? 'admin' : undefined;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
          {/* Public Routes inside PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            
            {/* Pricing (public) */}
            <Route path="/pricing" element={<PricingPage />} />
            
            {/* About (public) */}
            <Route path="/about" element={<AboutPage />} />

            {/* Legal (public) */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={registrationEnabled ? <RegisterPage /> : <Navigate to="/login" replace />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/action" element={<AuthActionPage />} />
          </Route>

          {/* Internal Shared Dashboard Routes (Player, Coach, Club) */}
          <Route element={<ProtectedRoute requiredRole={dashboardRequiredRole} />}>
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
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="opportunities" element={<AdminOpportunitiesPage />} />
            </Route>
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
