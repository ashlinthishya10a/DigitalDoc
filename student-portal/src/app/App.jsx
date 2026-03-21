import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import StudentLayout from "../layouts/StudentLayout";
import DashboardPage from "../pages/DashboardPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import MyRequestsPage from "../pages/MyRequestsPage";
import NewRequestPage from "../pages/NewRequestPage";
import SignupPage from "../pages/SignupPage";

const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route
      path="/portal"
      element={
        <ProtectedRoute>
          <StudentLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="requests" element={<MyRequestsPage />} />
      <Route path="requests/new" element={<NewRequestPage />} />
    </Route>
    <Route path="/requests" element={<Navigate to="/portal/requests" replace />} />
    <Route path="/requests/new" element={<Navigate to="/portal/requests/new" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
