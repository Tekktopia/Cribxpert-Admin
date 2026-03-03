/**
 * Secure token storage utility
 * Provides secure methods for handling authentication tokens
 */

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  fullName?: string;
  roles?: Record<string, number>;
  [key: string]: string | number | boolean | Record<string, number> | undefined;
}

interface TokenData {
  token: string;
  refreshToken?: string;
  expiresAt?: number;
  userData?: UserData;
}

class SecureTokenStorage {
  private static readonly TOKEN_KEY = "app_token";
  private static readonly REFRESH_KEY = "app_refresh_token";
  private static readonly USER_KEY = "app_user_data";

  /**
   * Store authentication token securely
   * Uses sessionStorage for better security than localStorage
   */
  static setToken(token: string, expiresIn?: number): void {
    try {
      const tokenData: TokenData = {
        token,
        expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
      };

      // Use sessionStorage for better security (cleared when tab closes)
      sessionStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.error("Error storing token:", error);
    }
  }

  /**
   * Retrieve authentication token
   */
  static getToken(): string | null {
    try {
      const stored = sessionStorage.getItem(this.TOKEN_KEY);
      if (!stored) return null;

      const tokenData: TokenData = JSON.parse(stored);

      // Check if token is expired
      if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        this.clearToken();
        return null;
      }

      return tokenData.token;
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  }

  /**
   * Store refresh token
   */
  static setRefreshToken(refreshToken: string): void {
    try {
      sessionStorage.setItem(this.REFRESH_KEY, refreshToken);
    } catch (error) {
      console.error("Error storing refresh token:", error);
    }
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    try {
      return sessionStorage.getItem(this.REFRESH_KEY);
    } catch (error) {
      console.error("Error retrieving refresh token:", error);
      return null;
    }
  }

  /**
   * Store user data securely
   */
  static setUserData(userData: UserData): void {
    try {
      // Store non-sensitive user data including role/roles for correct display after refresh
      const safeUserData: UserData = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        fullName: userData.fullName,
        roles: userData.roles,
      };

      sessionStorage.setItem(this.USER_KEY, JSON.stringify(safeUserData));
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  }

  /**
   * Get user data
   */
  static getUserData(): UserData | null {
    try {
      const stored = sessionStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error retrieving user data:", error);
      return null;
    }
  }

  /**
   * Clear all authentication data
   */
  static clearToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.REFRESH_KEY);
      sessionStorage.removeItem(this.USER_KEY);

      // Also clear any localStorage data for security
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("access_token");

      // Clear all sessionStorage to be thorough
      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Get authorization header for API requests
   */
  static getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default SecureTokenStorage;
