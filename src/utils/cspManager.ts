/**
 * Content Security Policy (CSP) Utility
 * Provides client-side CSP management and violation reporting
 *
 * Security note: This file uses dynamic object access for CSP directive management.
 * All directive names are validated against known CSP directives.
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
  private static reportEndpoint: string | null = null;

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
    if (!CSPManager.policy[directive]) {
      return;
    }

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
    // Remove existing CSP meta tag
    const existingTag = document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]'
    );
    if (existingTag) {
      existingTag.remove();
    }

    // Add new CSP meta tag
    const policyString = CSPManager.generatePolicyString();
    if (policyString) {
      const metaTag = document.createElement("meta");
      metaTag.setAttribute("http-equiv", "Content-Security-Policy");
      metaTag.setAttribute("content", policyString);
      document.head.appendChild(metaTag);
    }
  }

  /**
   * Set the reporting endpoint (call before setupReporting if using custom endpoint).
   */
  static setReportEndpoint(endpoint: string): void {
    CSPManager.reportEndpoint = endpoint;
    CSPManager.addSources("report-uri", [endpoint]);
  }

  /**
   * Set up CSP violation reporting. Call setReportEndpoint(endpoint) first if using a custom endpoint.
   */
  static setupReporting(): void {
    if (!CSPManager.reportEndpoint) {
      return;
    }

    // Listen for CSP violations
    document.addEventListener("securitypolicyviolation", (event) => {
      CSPManager.handleViolation(event as SecurityPolicyViolationEvent);
    });
  }

  /**
   * Handle CSP violation events
   */
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
    CSPManager.reportViolation(violation);

    // Log violation for debugging
    console.warn("CSP Violation:", violation);
  }

  /**
   * Report violation to endpoint
   */
  private static async reportViolation(violation: CSPViolation): Promise<void> {
    if (!CSPManager.reportEndpoint) {
      return;
    }

    try {
      await fetch(CSPManager.reportEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "csp-report": violation,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error("Failed to report CSP violation:", error);
    }
  }

  /**
   * Get recorded violations
   */
  static getViolations(): CSPViolation[] {
    return [...CSPManager.violations];
  }

  /**
   * Clear recorded violations
   */
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
        "'unsafe-inline'", // For React inline styles - consider removing in production
        "'unsafe-eval'", // For development - remove in production
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
      ],
      "connect-src": [
        "'self'",
        "ws:", // For WebSocket connections
        "wss:", // For secure WebSocket connections
      ],
      "font-src": [
        "'self'",
        "https://fonts.gstatic.com",
        "data:", // For base64 fonts
      ],
      "object-src": ["'none'"], // Disable plugins
      "media-src": ["'self'"],
      "frame-src": ["'none'"], // Disable iframes
    };

    CSPManager.setPolicy(defaultPolicy);
  }

  /**
   * Validate if a source would be allowed by current policy
   */
  static isSourceAllowed(
    directive: keyof CSPDirective,
    source: string
  ): boolean {
    const sources =
      CSPManager.policy[directive] || CSPManager.policy["default-src"] || [];

    // Check exact match
    if (sources.includes(source)) {
      return true;
    }

    // Check for 'self' directive
    if (sources.includes("'self'") && CSPManager.isSelfSource(source)) {
      return true;
    }

    // Check for wildcard matches
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

  /**
   * Check if source is considered 'self'
   */
  private static isSelfSource(source: string): boolean {
    try {
      const sourceUrl = new URL(source, window.location.origin);
      const currentUrl = new URL(window.location.href);

      return sourceUrl.origin === currentUrl.origin;
    } catch {
      return false;
    }
  }

  /**
   * Generate nonce for inline scripts/styles
   */
  static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  /**
   * Add nonce to CSP policy
   */
  static addNonce(directive: "script-src" | "style-src", nonce: string): void {
    CSPManager.addSources(directive, [`'nonce-${nonce}'`]);
  }
}

export default CSPManager;
