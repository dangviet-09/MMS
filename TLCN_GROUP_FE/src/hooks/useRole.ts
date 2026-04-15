import { useAuth } from "../contexts/AuthContext";
import { isAdmin, isStudent, isCompany, hasRole, hasAnyRole } from "../utils/roleUtils";
import { User } from "../types/types";

/**
 * Custom hook to check if current user is admin
 */
export const useIsAdmin = (): boolean => {
  const { user } = useAuth();
  return isAdmin(user);
};

/**
 * Custom hook to check if current user is a student
 */
export const useIsStudent = (): boolean => {
  const { user } = useAuth();
  return isStudent(user);
};

/**
 * Custom hook to check if current user is a company
 */
export const useIsCompany = (): boolean => {
  const { user } = useAuth();
  return isCompany(user);
};

/**
 * Custom hook to check if user has a specific role
 */
export const useHasRole = (role: "ADMIN" | "STUDENT" | "COMPANY" | null): boolean => {
  const { user } = useAuth();
  return hasRole(user, role);
};

/**
 * Custom hook to check if user has any of the specified roles
 */
export const useHasAnyRole = (roles: ("ADMIN" | "STUDENT" | "COMPANY" | null)[]): boolean => {
  const { user } = useAuth();
  return hasAnyRole(user, roles);
};

/**
 * Custom hook to get current user with role information
 */
export const useCurrentUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

/**
 * Custom hook to get role-specific information
 */
export const useRoleInfo = () => {
  const { user } = useAuth();
  
  return {
    user,
    isAdmin: isAdmin(user),
    isStudent: isStudent(user),
    isCompany: isCompany(user),
    role: user?.role || null,
  };
};

export default {
  useIsAdmin,
  useIsStudent,
  useIsCompany,
  useHasRole,
  useHasAnyRole,
  useCurrentUser,
  useRoleInfo,
};
