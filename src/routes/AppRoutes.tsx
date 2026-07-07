import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import AuthLayout from "../components/layout/AuthLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Profile from "../pages/auth/Profile";
import Dashboard from "../pages/dashboard/Dashboard";
import ManagerHome from "../pages/manager/ManagerHome";
import Board from "../pages/boards/Board";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

function RoleHomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "MANAGER") {
    return <Navigate to="/manager" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<RoleHomeRedirect />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/manager" element={<ManagerHome />} />
            <Route path="/board" element={<Board />} />
            <Route path="/me" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
