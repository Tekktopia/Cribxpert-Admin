/**
 * Cribxpert Admin — Security Bootstrap
 * -----------------------------------
 * Import and call initializeSecurity() early in app startup (e.g. main.tsx).
 *
 * Goals:
 * - Keep production safe (CSP + reasonable defaults)
 * - Avoid CSP "report-uri via meta" warnings + 404 spam
 * - Use a single source of truth for backend origin (VITE_API_BASE_URL)
 */

import SecurityManager from "./utils/securityManager";
import type { SecurityConfig } from "./utils/securityManager";

/**
 * Backend origin used for API calls.
 * Example: https://cribxpert-backend.onrender.com
 */
export const BACKEND_ORIGIN: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  "https://cribxpert-backend.onrender.com";

/**
 * Optional: any other external origins your app legitimately connects to.
 * Add only what you need.
 */
const EXTRA_CONNECT_ORIGINS: string[] = ["https://api.emailjs.com"];

/**
 * Content Security Policy used in production.
 * NOTE:
 * - CSP applied via <meta> can’t reliably use report-uri/report-to. We disable reporting here.
 * - If you want server-enforced CSP with reporting, set headers at Netlify (recommended).
 */
const PRODUCTION_CSP_POLICY: NonNullable<SecurityConfig["csp"]>["customPolicy"] =
  {
    "default-src": ["'self'"],

    // React/Vite sometimes need eval in dev; in prod try to remove unsafe-eval/inline when you can.
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],

    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],

    "img-src": ["'self'", "data:", "https:", "blob:"],

    // ✅ Allow calls to your backend
    "connect-src": [
      "'self'",
      "ws:",
      "wss:",
      BACKEND_ORIGIN,
      ...EXTRA_CONNECT_ORIGINS,
    ],

    "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
    "object-src": ["'none'"],
    "media-src": ["'self'"],
    "frame-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };

/**
 * Production security config
 */
const PRODUCTION_CONFIG: SecurityConfig = {
  csrf: {
    tokenHeaderName: "X-CSRF-Token",
    tokenCookieName: "cribxpert_csrf_token",
    tokenExpiration: 30 * 60 * 1000, // 30 minutes
  },

  rateLimit: {
    enabled: true,
    // Only set this if your backend has it (otherwise you’ll get 404 noise)
    reportingEndpoint: undefined,
  },

  csp: {
    enabled: true,
    // Meta CSP reporting is unreliable; disable to avoid warnings/404s
    reportingEndpoint: undefined,
    customPolicy: PRODUCTION_CSP_POLICY,
  },

  tokenStorage: {
    useSessionStorage: true,
  },
};

/**
 * Development config (more permissive)
 * CSP is disabled to keep DX smooth.
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

/**
 * Returns the security config for the current environment.
 */
export function getSecurityConfig(): SecurityConfig {
  return import.meta.env.DEV ? DEVELOPMENT_CONFIG : PRODUCTION_CONFIG;
}

/**
 * Initialize security based on environment.
 */
export function initializeSecurity(): void {
  const isDev = import.meta.env.DEV;
  const config = getSecurityConfig();

  try {
    SecurityManager.initialize(config);

    // Helpful logs (keep them, they save lives)
    console.log(`🔒 Security initialized for ${isDev ? "development" : "production"} environment`);
    console.log("Security Status:", SecurityManager.getSecurityStatus());

    // Light monitoring in prod
    if (!isDev) {
      window.setInterval(() => {
        const status = SecurityManager.getSecurityStatus();
        if (status?.csp?.violations && status.csp.violations > 0) {
          console.warn(`⚠️ CSP violations detected: ${status.csp.violations}`);
        }
      }, 5 * 60 * 1000);
    }
  } catch (err) {
    console.error("❌ Failed to initialize security:", err);

    // In prod: fail fast (your choice)
    if (!isDev) {
      throw new Error("Security initialization failed. Cannot start application.");
    }
  }
}

/**
 * Re-export the secured helpers so the app imports from one place.
 */
export const secureFetch = SecurityManager.secureFetch;
export const validateFormData = SecurityManager.validateFormData;

/**
 * Default export for convenience.
 */
export default {
  BACKEND_ORIGIN,
  initializeSecurity,
  getSecurityConfig,
  secureFetch,
  validateFormData,
};
