import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { isAdmin } from "../../../utils/roleUtils";

type AdminRouteProps = {
  redirectTo?: string;
  children?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  redirectTo = "/unauthorized",
  children
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: window.location.pathname }} />;
  }

  // Redirect if not admin
  if (!isAdmin(user)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if provided, otherwise render Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute;
