import { apiClient } from "./apiClient";
import { userStorage } from "../helper/storage";
import { User } from "../types/types";

export const updateUserRole = async (userId: string, role: string): Promise<User> => {
  const updatedUser = await apiClient.put<User>(`/users/${userId}/role`, { role });

  // Update local user if current
  const currentUser = userStorage.getUser<User>();
  if (currentUser && currentUser.id === userId) {
    userStorage.setUser({ ...currentUser, role });
  }

  return updatedUser;
};

export const getUserProfile = async (userId: string): Promise<User> => {
  return apiClient.get<User>(`/users/${userId}`);
};

export const updateUserProfile = async (userId: string, payload: Partial<User>): Promise<User> => {
  return apiClient.put<User>(`/users/${userId}`, payload);
};
