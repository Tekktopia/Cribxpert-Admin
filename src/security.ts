/**
 * Initialize Security for Cribxpert Admin Dashboard
 * This file should be imported and called early in the application lifecycle
 */

import SecurityManager from "./utils/securityManager";
import type { SecurityConfig } from "./utils/securityManager";

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
    reportingEndpoint: "/api/security/rate-limit-violations",
  },
  csp: {
    enabled: true,
    reportingEndpoint: "/api/security/csp-violations",
    customPolicy: {
      "default-src": ["'self'"],
      "script-src": [
        "'self'",
        "'unsafe-inline'", // Remove in production
        "'unsafe-eval'", // Remove in production
        "https://cdn.jsdelivr.net", // For any CDN scripts
      ],
      "style-src": [
        "'self'",
        "'unsafe-inline'", // For CSS-in-JS libraries
        "https://fonts.googleapis.com",
      ],
      "img-src": [
        "'self'",
        "data:", // For base64 images
        "https:", // Allow external images
        "blob:", // For generated images
      ],
      "connect-src": [
        "'self'",
        "ws:", // For WebSocket connections
        "wss:", // For secure WebSocket connections
        "https://api.cribxpert.com", // Your API domain
      ],
      "font-src": [
        "'self'",
        "https://fonts.gstatic.com",
        "data:", // For base64 fonts
      ],
      "object-src": ["'none'"], // Disable plugins
      "media-src": ["'self'"],
      "frame-src": ["'none'"], // Disable iframes
      "base-uri": ["'self'"], // Restrict base URI
      "form-action": ["'self'"], // Restrict form submissions
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
    reportingEndpoint: undefined, // Don't report in development
  },
  csp: {
    enabled: false, // Disable CSP in development for easier debugging
    reportingEndpoint: undefined,
  },
  tokenStorage: {
    useSessionStorage: true,
  },
};

/**
 * Initialize security based on environment
 */
export function initializeSecurity(): void {
  const isDevelopment = process.env.NODE_ENV === "development";
  const config = isDevelopment ? DEVELOPMENT_CONFIG : PRODUCTION_CONFIG;

  try {
    SecurityManager.initialize(config);

    console.log(
      `🔒 Security initialized for ${
        isDevelopment ? "development" : "production"
      } environment`
    );

    // Log security status
    const status = SecurityManager.getSecurityStatus();
    console.log("Security Status:", status);

    // Set up periodic security status logging
    if (!isDevelopment) {
      setInterval(() => {
        const currentStatus = SecurityManager.getSecurityStatus();
        if (currentStatus.csp.violations > 0) {
          console.warn(
            `⚠️ CSP violations detected: ${currentStatus.csp.violations}`
          );
        }
      }, 5 * 60 * 1000); // Check every 5 minutes
    }
  } catch (error) {
    console.error("❌ Failed to initialize security:", error);

    // In production, you might want to prevent app startup
    if (!isDevelopment) {
      throw new Error(
        "Security initialization failed. Cannot start application."
      );
    }
  }
}

/**
 * Get current security configuration
 */
export function getSecurityConfig(): SecurityConfig {
  const isDevelopment = process.env.NODE_ENV === "development";
  return isDevelopment ? DEVELOPMENT_CONFIG : PRODUCTION_CONFIG;
}

/**
 * Enhanced fetch function that should be used throughout the app
 */
export const secureFetch = SecurityManager.secureFetch;

/**
 * Form validation function that should be used for all form submissions
 */
export const validateFormData = SecurityManager.validateFormData;

export default {
  initializeSecurity,
  getSecurityConfig,
  secureFetch,
  validateFormData,
};
