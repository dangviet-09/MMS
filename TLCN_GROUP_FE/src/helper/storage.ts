type StorageAdapter = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

class TokenStorage {
  private adapter: StorageAdapter;
  private keys = { access: "accessToken", refresh: "refreshToken" };

  constructor(adapter: StorageAdapter = new LocalStorageAdapter()) {
    this.adapter = adapter;
  }

  getAccessToken(): string | null {
    return this.adapter.getItem(this.keys.access);
  }

  getRefreshToken(): string | null {
    return this.adapter.getItem(this.keys.refresh);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.adapter.setItem(this.keys.access, accessToken);
    this.adapter.setItem(this.keys.refresh, refreshToken);
  }

  clear(): void {
    this.adapter.removeItem(this.keys.access);
    this.adapter.removeItem(this.keys.refresh);
  }
}

class UserStorage {
  private adapter: StorageAdapter;
  private key = "user";

  constructor(adapter: StorageAdapter = new LocalStorageAdapter()) {
    this.adapter = adapter;
  }

  getUser<T>(): T | null {
    const data = this.adapter.getItem(this.key);
    return data ? JSON.parse(data) : null;
  }

  setUser<T>(user: T): void {
    this.adapter.setItem(this.key, JSON.stringify(user));
  }

  clear(): void {
    this.adapter.removeItem(this.key);
  }
}

export const tokenStorage = new TokenStorage();
export const userStorage = new UserStorage();