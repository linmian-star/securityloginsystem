import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import User from "../pages/User";
import AuditLogs from "../pages/AuditLogs";
import SecurityPolicy from "../pages/SecurityPolicy";
import Roles from "../pages/Roles";
import Settings from "../pages/Settings";
import MainLayout from "../layout/MainLayout";
import AuthRoute from "./AuthRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    element: <AuthRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/users",
            element: <User />,
          },
          {
            path: "/audit-logs",
            element: <AuditLogs />,
          },
          {
            path: "/security-policy",
            element: <SecurityPolicy />,
          },
          {
            path: "/roles",
            element: <Roles />,
          },
          {
            path: "/settings",
            element: <Settings />,
          },
        ],
      },
    ],
  },
]);

export default router;