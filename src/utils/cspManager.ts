/**
 * Content Security Policy (CSP) Utility
 * Client-side CSP meta-tag management + optional violation collection (local).
 *
 * Notes:
 * - Browsers ignore `report-uri` when CSP is delivered via a <meta> tag.
 * - If you need reporting, do it via server headers (Netlify headers / backend).
 */

/* eslint-disable security/detect-object-injection */
/* eslint-disable security/detect-non-literal-regexp */

export interface CSPDirective {
  "default-src"?: string[];
  "script-src"?: string[];
  "style-src"?: string[];
  "img-src"?: string[];
  "connect-src"?: string[];
  "font-src"?: string[];
  "object-src"?: string[];
  "media-src"?: string[];
  "frame-src"?: string[];
  "base-uri"?: string[];
  "form-action"?: string[];
  "frame-ancestors"?: string[];
  "plugin-types"?: string[];
  sandbox?: string[];
  "upgrade-insecure-requests"?: string[];
  "block-all-mixed-content"?: string[];
  "require-sri-for"?: string[];
  "report-uri"?: string[];
  "report-to"?: string[];
}

interface CSPViolation {
  "document-uri": string;
  referrer: string;
  "violated-directive": string;
  "effective-directive": string;
  "original-policy": string;
  "blocked-uri": string;
  "line-number": number;
  "column-number": number;
  "source-file": string;
  "status-code": number;
  "script-sample": string;
}

class CSPManager {
  private static policy: CSPDirective = {};
  private static violations: CSPViolation[] = [];
  private static reportingEnabled = false;

  /**
   * Set the CSP policy configuration
   */
  static setPolicy(policy: CSPDirective): void {
    CSPManager.policy = { ...policy };
    CSPManager.updateMetaTag();
  }

  /**
   * Get current CSP policy
   */
  static getPolicy(): CSPDirective {
    return { ...CSPManager.policy };
  }

  /**
   * Add sources to a directive
   */
  static addSources(directive: keyof CSPDirective, sources: string[]): void {
    if (!CSPManager.policy[directive]) {
      CSPManager.policy[directive] = [];
    }

    const currentSources = CSPManager.policy[directive] || [];
    const newSources = sources.filter(
      (source) => !currentSources.includes(source)
    );

    CSPManager.policy[directive] = [...currentSources, ...newSources];
    CSPManager.updateMetaTag();
  }

  /**
   * Remove sources from a directive
   */
  static removeSources(directive: keyof CSPDirective, sources: string[]): void {
    if (!CSPManager.policy[directive]) return;

    CSPManager.policy[directive] = CSPManager.policy[directive]!.filter(
      (source) => !sources.includes(source)
    );

    CSPManager.updateMetaTag();
  }

  /**
   * Generate CSP string from policy object
   */
  private static generatePolicyString(): string {
    const directives: string[] = [];

    Object.entries(CSPManager.policy).forEach(([directive, sources]) => {
      if (sources && sources.length > 0) {
        directives.push(`${directive} ${sources.join(" ")}`);
      }
    });

    return directives.join("; ");
  }

  /**
   * Update CSP meta tag in document head
   */
  private static updateMetaTag(): void {
    const existingTag = document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]'
    );
    if (existingTag) existingTag.remove();

    const policyString = CSPManager.generatePolicyString();
    if (!policyString) return;

    const metaTag = document.createElement("meta");
    metaTag.setAttribute("http-equiv", "Content-Security-Policy");
    metaTag.setAttribute("content", policyString);
    document.head.appendChild(metaTag);
  }

  /**
   * Set up CSP violation capture (client-side only).
   * NOTE: We do NOT add `report-uri` because browsers ignore it in meta CSP.
   */
  static setupReporting(): void {
    if (CSPManager.reportingEnabled) return;
    CSPManager.reportingEnabled = true;

    document.addEventListener("securitypolicyviolation", (event) => {
      CSPManager.handleViolation(event as SecurityPolicyViolationEvent);
    });
  }

  private static handleViolation(event: SecurityPolicyViolationEvent): void {
    const violation: CSPViolation = {
      "document-uri": event.documentURI,
      referrer: event.referrer,
      "violated-directive": event.violatedDirective,
      "effective-directive": event.effectiveDirective,
      "original-policy": event.originalPolicy,
      "blocked-uri": event.blockedURI,
      "line-number": event.lineNumber,
      "column-number": event.columnNumber,
      "source-file": event.sourceFile,
      "status-code": event.statusCode,
      "script-sample": event.sample,
    };

    CSPManager.violations.push(violation);
    console.warn("CSP Violation:", violation);
  }

  static getViolations(): CSPViolation[] {
    return [...CSPManager.violations];
  }

  static clearViolations(): void {
    CSPManager.violations = [];
  }

  /**
   * Initialize with secure default policy
   */
  static initializeDefaults(): void {
    const defaultPolicy: CSPDirective = {
      "default-src": ["'self'"],
      "script-src": [
        "'self'",
        "'unsafe-inline'", // TODO: remove when you can
        "'unsafe-eval'", // TODO: remove when you can
        "https://cdn.jsdelivr.net",
      ],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "img-src": ["'self'", "data:", "https:", "blob:"],
      "connect-src": [
        "'self'",
        "ws:",
        "wss:",
        "https://cribxpert-backend.onrender.com",
        "https://api.emailjs.com",
      ],
      "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
      "object-src": ["'none'"],
      "media-src": ["'self'"],
      "frame-src": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
    };

    CSPManager.setPolicy(defaultPolicy);
  }

  static isSourceAllowed(directive: keyof CSPDirective, source: string): boolean {
    const sources =
      CSPManager.policy[directive] || CSPManager.policy["default-src"] || [];

    if (sources.includes(source)) return true;

    if (sources.includes("'self'") && CSPManager.isSelfSource(source)) {
      return true;
    }

    return sources.some((allowedSource) => {
      if (allowedSource.includes("*")) {
        const regex = new RegExp(
          "^" + allowedSource.replace(/\*/g, ".*") + "$"
        );
        return regex.test(source);
      }
      return false;
    });
  }

  private static isSelfSource(source: string): boolean {
    try {
      const sourceUrl = new URL(source, window.location.origin);
      const currentUrl = new URL(window.location.href);
      return sourceUrl.origin === currentUrl.origin;
    } catch {
      return false;
    }
  }

  static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  static addNonce(directive: "script-src" | "style-src", nonce: string): void {
    CSPManager.addSources(directive, [`'nonce-${nonce}'`]);
  }
}

export default CSPManager;