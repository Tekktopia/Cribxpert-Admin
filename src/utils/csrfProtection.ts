/**
 * CSRF Protection Utility
 * Provides Cross-Site Request Forgery protection for API requests
 *
 * Security note: This file uses controlled array access for cookie parsing.
 * Array bounds are checked before access.
 */

/* eslint-disable security/detect-object-injection */

import { v4 as uuidv4 } from "uuid";

interface CSRFConfig {
  tokenHeaderName: string;
  tokenCookieName: string;
  tokenExpiration: number; // in milliseconds
}

class CSRFProtection {
  private static readonly DEFAULT_CONFIG: CSRFConfig = {
    tokenHeaderName: "X-CSRF-Token",
    tokenCookieName: "csrf_token",
    tokenExpiration: 30 * 60 * 1000, // 30 minutes
  };

  private static config: CSRFConfig = CSRFProtection.DEFAULT_CONFIG;
  private static currentToken: string | null = null;
  private static tokenExpiry: number | null = null;

  /**
   * Configure CSRF protection settings
   */
  static configure(config: Partial<CSRFConfig>): void {
    CSRFProtection.config = { ...CSRFProtection.DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a new CSRF token
   */
  private static generateToken(): string {
    return uuidv4().replace(/-/g, "");
  }

  /**
   * Check if current token is valid and not expired
   */
  private static isTokenValid(): boolean {
    if (!CSRFProtection.currentToken || !CSRFProtection.tokenExpiry) {
      return false;
    }

    return Date.now() < CSRFProtection.tokenExpiry;
  }

  /**
   * Get or create a CSRF token
   */
  static getToken(): string {
    if (!CSRFProtection.isTokenValid()) {
      CSRFProtection.currentToken = CSRFProtection.generateToken();
      CSRFProtection.tokenExpiry =
        Date.now() + CSRFProtection.config.tokenExpiration;

      // Store in cookie for server verification
      CSRFProtection.setCookie();
    }

    return CSRFProtection.currentToken!;
  }

  /**
   * Get CSRF headers for API requests
   */
  static getHeaders(): Record<string, string> {
    const token = CSRFProtection.getToken();

    return {
      [CSRFProtection.config.tokenHeaderName]: token,
    };
  }

  /**
   * Validate CSRF token from response
   */
  static validateToken(token: string): boolean {
    if (!token || typeof token !== "string") {
      return false;
    }

    return (
      token === CSRFProtection.currentToken && CSRFProtection.isTokenValid()
    );
  }

  /**
   * Clear current CSRF token
   */
  static clearToken(): void {
    CSRFProtection.currentToken = null;
    CSRFProtection.tokenExpiry = null;
    CSRFProtection.clearCookie();
  }

  /**
   * Set CSRF token in cookie
   */
  private static setCookie(): void {
    if (!CSRFProtection.currentToken) return;

    const expires = new Date(
      Date.now() + CSRFProtection.config.tokenExpiration
    );
    const cookieValue = `${CSRFProtection.config.tokenCookieName}=${
      CSRFProtection.currentToken
    }; expires=${expires.toUTCString()}; path=/; samesite=strict; secure=${
      window.location.protocol === "https:"
    }`;

    document.cookie = cookieValue;
  }

  /**
   * Clear CSRF token cookie
   */
  private static clearCookie(): void {
    document.cookie = `${CSRFProtection.config.tokenCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=strict`;
  }

  /**
   * Get CSRF token from cookie
   */
  static getTokenFromCookie(): string | null {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i] ? cookies[i].trim() : "";
      const [name, value] = cookie.split("=");

      if (name === CSRFProtection.config.tokenCookieName) {
        return value || null;
      }
    }

    return null;
  }

  /**
   * Initialize CSRF protection (call on app startup)
   */
  static initialize(): void {
    // Try to restore token from cookie
    const cookieToken = CSRFProtection.getTokenFromCookie();

    if (cookieToken) {
      CSRFProtection.currentToken = cookieToken;
      // Set a reasonable expiry time for existing token
      CSRFProtection.tokenExpiry =
        Date.now() + CSRFProtection.config.tokenExpiration;
    }

    // Clear token on page unload for security
    window.addEventListener("beforeunload", () => {
      CSRFProtection.clearToken();
    });
  }

  /**
   * Middleware function for fetch requests
   */
  static enhanceRequest(url: string, options: RequestInit = {}): RequestInit {
    // Only add CSRF protection to non-GET requests to same origin
    const isGetRequest =
      !options.method || options.method.toUpperCase() === "GET";
    const isSameOrigin =
      !url.startsWith("http") || url.startsWith(window.location.origin);

    if (isGetRequest || !isSameOrigin) {
      return options;
    }

    const csrfHeaders = CSRFProtection.getHeaders();

    return {
      ...options,
      headers: {
        ...options.headers,
        ...csrfHeaders,
      },
    };
  }
}

export default CSRFProtection;
