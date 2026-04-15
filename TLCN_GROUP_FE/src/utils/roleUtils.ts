import { User } from "../types/types";

export const ROLES = {
  ADMIN: "ADMIN",
  STUDENT: "STUDENT",
  COMPANY: "COMPANY",
  GUEST: null,
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<string, number> = {
  ADMIN: 3,
  COMPANY: 2,
  STUDENT: 1,
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === ROLES.ADMIN;
};

export const isStudent = (user: User | null): boolean => {
  return user?.role === ROLES.STUDENT;
};

export const isCompany = (user: User | null): boolean => {
  return user?.role === ROLES.COMPANY;
};

export const hasRole = (user: User | null, role: Role): boolean => {
  return user?.role === role;
};

export const hasAnyRole = (user: User | null, roles: Role[]): boolean => {
  if (!user?.role) return false;
  return roles.includes(user.role);
};

// export const hasMinimumRole = (user: User | null, minimumRole: string): boolean => {
//   if (!user?.role) return false;
//   const userLevel = ROLE_HIERARCHY[user.role] || 0;
//   const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;
//   return userLevel >= requiredLevel;
// };

// export const getRoleDisplayName = (role: Role): string => {
//   const displayNames: Record<string, string> = {
//     ADMIN: "Administrator",
//     STUDENT: "Student",
//     COMPANY: "Company",
//   };
//   return displayNames[role as string] || "Guest";
// };

// export const getRoleColor = (role: Role): string => {
//   const colors: Record<string, string> = {
//     ADMIN: "bg-red-100 text-red-800 border-red-200",
//     STUDENT: "bg-blue-100 text-blue-800 border-blue-200",
//     COMPANY: "bg-green-100 text-green-800 border-green-200",
//   };
//   return colors[role as string] || "bg-gray-100 text-gray-800 border-gray-200";
// };

// export const getRoleIcon = (role: Role): string => {
//   const icons: Record<string, string> = {
//     ADMIN: "shield-check",
//     STUDENT: "academic-cap",
//     COMPANY: "building-office",
//   };
//   return icons[role as string] || "user";
// };
