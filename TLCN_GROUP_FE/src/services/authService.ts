import { apiClient } from "./apiClient";
import { tokenStorage, userStorage } from "../helper/storage";
import { User, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/types";

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const data = await apiClient.post<LoginResponse>("/auth", credentials);
    this.setSession(data);
    return data;
  }

  async register(credentials: RegisterRequest): Promise<RegisterResponse> {
    const payload = {
      email: credentials.email,
      username: credentials.username,
      fullName: credentials.username,
      role: credentials.role ?? null,
      password: credentials.password,
      provider: "LOCAL",
    };

    try {
      await apiClient.post("/users", payload);
    } catch (error) {
      console.error('Registration error details:', error);
      throw error;
    }

    return this.login({
      username: credentials.username,
      password: credentials.password,
    });
  }

  async logout(): Promise<void> {
    try {
      if (this.isAuthenticated()) {
        await apiClient.post("/auth/logout");
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearSession();
    }
  }

  async resetPassword(username: string, newPassword: string, confirmNewPassword: string) {
    return apiClient.post<{ message: string }>("/auth/reset-password", {
      username,
      newPassword,
      confirmNewPassword,
    });
  }

  async verifyOTP(username: string, otp: string) {
    return apiClient.post<{ message: string }>("/auth/verify-otp", { username, otp });
  }

  async verifyUsername(username: string) {
    return apiClient.post<{ message: string }>("/auth/verify-username", { username });
  }

  // OAuth
  initiateGoogleLogin(): void {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
    window.location.href = `${baseUrl}/auth/google`;
  }

  handleOAuthCallback(): { accessToken: string; refreshToken: string } | null {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      this.setSession({ accessToken, refreshToken, user: userStorage.getUser()! });
      // Don't clear URL here - let AuthContext handle it after successful fetch
      return { accessToken, refreshToken };
    }
    return null;
  }

  // Session helpers
  private setSession({ accessToken, refreshToken, user }: LoginResponse) {
    apiClient.setAuthTokens(accessToken, refreshToken);
    if (user) userStorage.setUser(user);
  }

  clearSession(): void {
    apiClient.clearAuthTokens();
    userStorage.clear();
  }

  getCurrentUser(): User | null {
    return userStorage.getUser<User>();
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated() && !!this.getCurrentUser();
  }

  getAccessToken(): string | null {
    return tokenStorage.getAccessToken();
  }

  getRefreshToken(): string | null {
    return tokenStorage.getRefreshToken();
  }
}

export const authService = new AuthService();
