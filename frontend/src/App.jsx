import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import ReportItem from './pages/ReportItem';
import Browse from './pages/Browse';
import ItemDetail from './pages/ItemDetail';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminItems from './pages/admin/AdminItems';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AdminRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return admin?.isAdmin ? children : <Navigate to="/admin/login" replace />;
};

const GuestAdminRoute = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : children;
};

// Admin section — completely separate, no Navbar/Footer
function AdminSection() {
  return (
    <Routes>
      <Route path="/login" element={<GuestAdminRoute><AdminLogin /></GuestAdminRoute>} />
      <Route path="/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/lost-items" element={<AdminRoute><AdminItems type="lost" /></AdminRoute>} />
      <Route path="/found-items" element={<AdminRoute><AdminItems type="found" /></AdminRoute>} />
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

// Public section — with Navbar and Footer
function PublicSection() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportItem /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/matches/:id" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Admin routes — own layout, no Navbar/Footer */}
            <Route path="/admin/*" element={<AdminSection />} />

            {/* All public routes — with Navbar/Footer */}
            <Route path="/*" element={<PublicSection />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{ className: 'font-body text-sm', duration: 4000 }}
          />
        </BrowserRouter>
      </AuthProvider>
    </AdminAuthProvider>
  );
}