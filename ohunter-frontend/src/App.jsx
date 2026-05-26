import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import EmployerDashboard from "./pages/EmployerDashboard";
import JobDetailPage from "./pages/JobDetailPage";
import JobListPage from "./pages/JobListPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import PostJobPage from "./pages/PostJobPage";
import RegisterPage from "./pages/RegisterPage";

function AppLayout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="page">
      {!hideNavbar ? <Navbar /> : null}
      <div key={location.pathname} className="page-transition">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute roles={["STUDENT_FRESHER", "STUDENT_EXPERIENCED"]}>
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute requiredRole="EMPLOYER">
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/post-job"
            element={
              <ProtectedRoute requiredRole="EMPLOYER">
                <PostJobPage />
              </ProtectedRoute>
            }
          />
          <Route path="/applications" element={<Navigate to="/my-applications" replace />} />
          <Route path="/jobs/new" element={<Navigate to="/employer/post-job" replace />} />
          <Route path="/my-jobs" element={<Navigate to="/employer/dashboard" replace />} />
          <Route path="/employer" element={<Navigate to="/employer/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
