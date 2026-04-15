import React, { ReactNode } from "react";
import AdminOnly from "../../atoms/AdminOnly/AdminOnly";

type AdminGuardProps = {
  children: ReactNode;
  requireAdmin?: boolean;
  showMessage?: boolean;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  requireAdmin = true,
  showMessage = true
}) => {
  if (!requireAdmin) {
    return <>{children}</>;
  }

  return (
    <AdminOnly
      fallback={
        showMessage ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-yellow-800">
              Admin Access Required
            </h3>
            <p className="mt-2 text-sm text-yellow-600">
              You need administrator privileges to access this content.
            </p>
          </div>
        ) : null
      }
    >
      {children}
    </AdminOnly>
  );
};

export default AdminGuard;
