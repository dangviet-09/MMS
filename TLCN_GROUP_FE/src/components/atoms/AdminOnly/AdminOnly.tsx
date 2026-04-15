import React, { ReactNode } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { isAdmin } from "../../../utils/roleUtils";

type AdminOnlyProps = {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback = null }) => {
  const { user } = useAuth();

  if (!isAdmin(user)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AdminOnly;
