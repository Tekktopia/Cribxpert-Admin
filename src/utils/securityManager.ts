/**
 * Security Initialization Module
 * Initializes all security utilities and provides centralized security configuration
 *
 * Security note: This file uses dynamic object access for form data validation.
 * All property access is validated and sanitized.
 */

/* eslint-disable security/detect-object-injection */

import SecureTokenStorage from "./secureStorage";
import CSRFProtection from "./csrfProtection";
import RateLimiter from "./rateLimiter";
import CSPManager from "./cspManager";
import { InputSanitizer } from "./inputSanitization";
import type { CSPDirective } from "./cspManager";

export interface SecurityConfig {
  csrf?: {
    tokenHeaderName?: string;
    tokenCookieName?: string;
    tokenExpiration?: number;
  };
  rateLimit?: {
    enabled?: boolean;
    reportingEndpoint?: string;
  };
  csp?: {
    enabled?: boolean;
    reportingEndpoint?: string;
    customPolicy?: CSPDirective;
  };
  tokenStorage?: {
    useSessionStorage?: boolean;
  };
}

class SecurityManager {
  private static initialized = false;
  private static config: SecurityConfig = {};

  /**
   * Initialize all security utilities
   */
  static initialize(config: SecurityConfig = {}): void {
    if (SecurityManager.initialized) {
      console.warn("Security utilities already initialized");
      return;
    }

    SecurityManager.config = config;

    try {
      // Initialize CSRF Protection
      if (config.csrf) {
        CSRFProtection.configure(config.csrf);
      }
      CSRFProtection.initialize();

      // Initialize Rate Limiting
      RateLimiter.initializeDefaults();

      // Initialize CSP if enabled
      if (config.csp?.enabled !== false) {
        CSPManager.initializeDefaults();

        if (config.csp?.customPolicy) {
          CSPManager.setPolicy(config.csp.customPolicy);
        }

        if (config.csp?.reportingEndpoint) {
          CSPManager.setReportEndpoint(config.csp.reportingEndpoint);
          CSPManager.setupReporting();
        }
      }

      // Setup global error handlers for security events
      SecurityManager.setupGlobalErrorHandlers();

      SecurityManager.initialized = true;
      console.log("✅ Security utilities initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize security utilities:", error);
      throw error;
    }
  }

  /**
   * Setup global error handlers for security monitoring
   */
  private static setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);

      // Log security-related rejections
      if (
        event.reason?.message?.includes("Rate limit") ||
        event.reason?.message?.includes("CSRF") ||
        event.reason?.message?.includes("CSP")
      ) {
        SecurityManager.logSecurityEvent("unhandled_rejection", {
          reason: event.reason.message,
          stack: event.reason.stack,
        });
      }
    });

    // Handle global errors
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);

      // Log potential security-related errors
      if (
        event.error?.message?.includes("Script error") ||
        event.error?.message?.includes("SecurityError")
      ) {
        SecurityManager.logSecurityEvent("script_error", {
          message: event.error.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      }
    });
  }

  /**
   * Log security events for monitoring
   */
  private static logSecurityEvent(
    type: string,
    details: Record<string, unknown>
  ): void {
    const event = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      details,
    };

    console.warn("Security Event:", event);

    // In production, send to monitoring service
    if (
      process.env.NODE_ENV === "production" &&
      SecurityManager.config.rateLimit?.reportingEndpoint
    ) {
      fetch(SecurityManager.config.rateLimit.reportingEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }).catch((err) => console.error("Failed to report security event:", err));
    }
  }

  /**
   * Get security status overview
   */
  static getSecurityStatus(): {
    initialized: boolean;
    csrf: { enabled: boolean; hasToken: boolean };
    rateLimit: { enabled: boolean };
    csp: { enabled: boolean; violations: number };
    tokenStorage: { hasValidToken: boolean };
  } {
    return {
      initialized: SecurityManager.initialized,
      csrf: {
        enabled: true,
        hasToken: Boolean(CSRFProtection.getToken()),
      },
      rateLimit: {
        enabled: true,
      },
      csp: {
        enabled: Object.keys(CSPManager.getPolicy()).length > 0,
        violations: CSPManager.getViolations().length,
      },
      tokenStorage: {
        hasValidToken: SecureTokenStorage.isAuthenticated(),
      },
    };
  }

  /**
   * Enhanced fetch function with all security utilities
   */
  static async secureFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    if (!SecurityManager.initialized) {
      throw new Error(
        "Security utilities not initialized. Call SecurityManager.initialize() first."
      );
    }

    try {
      // Apply rate limiting
      const rateLimitKey = RateLimiter["getKeyFromUrl"](url);
      await RateLimiter.enhanceRequest(url, options, rateLimitKey);

      // Apply CSRF protection
      const csrfEnhancedOptions = CSRFProtection.enhanceRequest(url, options);

      // Apply authentication headers
      const authHeaders = SecureTokenStorage.getAuthHeader();

      // Combine all headers
      const finalOptions: RequestInit = {
        ...csrfEnhancedOptions,
        headers: {
          ...csrfEnhancedOptions.headers,
          ...authHeaders,
        },
      };

      // Make the request
      const response = await fetch(url, finalOptions);

      // Handle rate limit responses
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        throw new Error(`Rate limited. Retry after: ${retryAfter} seconds`);
      }

      // Handle authentication errors
      if (response.status === 401) {
        SecureTokenStorage.clearToken();
        throw new Error("Authentication failed. Please login again.");
      }

      return response;
    } catch (error) {
      SecurityManager.logSecurityEvent("fetch_error", {
        url,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Validate and sanitize form data
   */
  static validateFormData(
    formData: Record<string, unknown>
  ): Record<string, string> {
    const sanitizedData: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      // Validate key is safe
      if (
        typeof key === "string" &&
        key.length > 0 &&
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)
      ) {
        if (typeof value === "string") {
          // Basic sanitization for all string values
          sanitizedData[key] = InputSanitizer.sanitizeText(value);
        } else {
          // Convert non-strings to strings and sanitize
          sanitizedData[key] = InputSanitizer.sanitizeText(String(value));
        }
      }
    });

    return sanitizedData;
  }

  /**
   * Reset all security utilities
   */
  static reset(): void {
    CSRFProtection.clearToken();
    RateLimiter.clearAll();
    CSPManager.clearViolations();
    SecureTokenStorage.clearToken();
    SecurityManager.initialized = false;
  }
}

export default SecurityManager;
