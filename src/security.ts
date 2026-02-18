/**
 * Initialize Security for Cribxpert Admin Dashboard
 * Import and call initializeSecurity() early in app startup.
 */

import SecurityManager from "./utils/securityManager";
import type { SecurityConfig } from "./utils/securityManager";

const BACKEND_ORIGIN =
  import.meta.env.VITE_API_BASE_URL || "https://cribxpert-backend.onrender.com";

/**
 * Production security configuration
 */
const PRODUCTION_CONFIG: SecurityConfig = {
  csrf: {
    tokenHeaderName: "X-CSRF-Token",
    tokenCookieName: "cribxpert_csrf_token",
    tokenExpiration: 30 * 60 * 1000, // 30 minutes
  },
  rateLimit: {
    enabled: true,
    // If you don't have this endpoint on your backend, set to undefined
    reportingEndpoint: undefined,
  },
  csp: {
    enabled: true,
    // Meta CSP cannot use report-uri reliably. Disable to avoid 404 spam.
    reportingEndpoint: undefined,
    customPolicy: {
      "default-src": ["'self'"],
      "script-src": [
        "'self'",
        "'unsafe-inline'", // TODO: remove when you can
        "'unsafe-eval'", // TODO: remove when you can
        "https://cdn.jsdelivr.net",
      ],
      "style-src": [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
      ],
      "img-src": ["'self'", "data:", "https:", "blob:"],
      "connect-src": ["'self'", "ws:", "wss:", BACKEND_ORIGIN],
      "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
      "object-src": ["'none'"],
      "media-src": ["'self'"],
      "frame-src": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
    },
  },
  tokenStorage: {
    useSessionStorage: true,
  },
};

/**
 * Development security configuration (more permissive)
 */
const DEVELOPMENT_CONFIG: SecurityConfig = {
  csrf: {
    tokenHeaderName: "X-CSRF-Token",
    tokenCookieName: "cribxpert_csrf_token_dev",
    tokenExpiration: 60 * 60 * 1000, // 1 hour
  },
  rateLimit: {
    enabled: true,
    reportingEndpoint: undefined,
  },
  csp: {
    enabled: false,
    reportingEndpoint: undefined,
  },
  tokenStorage: {
    useSessionStorage: true,
  },
};

export function initializeSecurity(): void {
  const isDevelopment = import.meta.env.DEV;
  const config = isDevelopment ? DEVELOPMENT_CONFIG : PRODUCTION_CONFIG;

  try {
    SecurityManager.initialize(config);

    console.log(
      `🔒 Security initialized for ${isDevelopment ? "development" : "production"} environment`
    );

    const status = SecurityManager.getSecurityStatus();
    console.log("Security Status:", status);

    if (!isDevelopment) {
      setInterval(() => {
        const currentStatus = SecurityManager.getSecurityStatus();
        if (currentStatus.csp.violations > 0) {
          console.warn(
            `⚠️ CSP violations detected: ${currentStatus.csp.violations}`
          );
        }
      }, 5 * 60 * 1000);
    }
  } catch (error) {
    console.error("❌ Failed to initialize security:", error);
    if (!isDevelopment) {
      throw new Error("Security initialization failed. Cannot start application.");
    }
  }
}

export function getSecurityConfig(): SecurityConfig {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? DEVELOPMENT_CONFIG : PRODUCTION_CONFIG;
}

export const secureFetch = SecurityManager.secureFetch;
export const validateFormData = SecurityManager.validateFormData;

export default {
  initializeSecurity,
  getSecurityConfig,
  secureFetch,
  validateFormData,
};