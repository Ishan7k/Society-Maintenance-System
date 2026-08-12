import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppNavbar from "./components/Navbar";

import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFlats from "./pages/admin/AdminFlats";
import AdminBills from "./pages/admin/AdminBills";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminSettings from "./pages/admin/AdminSettings";
import ResidentDashboard from "./pages/resident/ResidentDashboard";
import ResidentBills from "./pages/resident/ResidentBills";
import ResidentComplaints from "./pages/resident/ResidentComplaints";
import ResidentAnnouncements from "./pages/resident/ResidentAnnouncements";

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/resident/dashboard"} replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      {user && <AppNavbar />}
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/flats" element={<ProtectedRoute allowedRoles={["admin"]}><AdminFlats /></ProtectedRoute>} />
        <Route path="/admin/bills" element={<ProtectedRoute allowedRoles={["admin"]}><AdminBills /></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={["admin"]}><AdminComplaints /></ProtectedRoute>} />
        <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAnnouncements /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={["admin", "resident"]}><Profile /></ProtectedRoute>} />

        <Route path="/resident/dashboard" element={<ProtectedRoute allowedRoles={["resident"]}><ResidentDashboard /></ProtectedRoute>} />
        <Route path="/resident/bills" element={<ProtectedRoute allowedRoles={["resident"]}><ResidentBills /></ProtectedRoute>} />
        <Route path="/resident/complaints" element={<ProtectedRoute allowedRoles={["resident"]}><ResidentComplaints /></ProtectedRoute>} />
        <Route path="/resident/announcements" element={<ProtectedRoute allowedRoles={["resident"]}><ResidentAnnouncements /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
