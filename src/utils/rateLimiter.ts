/**
 * Client-side Rate Limiting Utility
 * Provides protection against excessive API requests
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RequestRecord {
  count: number;
  windowStart: number;
  blockedUntil?: number;
}

interface RateLimitError extends Error {
  retryAfter: number | null;
  rateLimitKey: string;
}

class RateLimiter {
  private static readonly DEFAULT_CONFIG: RateLimitConfig = {
    maxRequests: 100, // requests per window
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  };

  private static configs: Map<string, RateLimitConfig> = new Map();
  private static records: Map<string, RequestRecord> = new Map();

  /**
   * Configure rate limiting for a specific endpoint or type
   */
  static configure(key: string, config: Partial<RateLimitConfig>): void {
    RateLimiter.configs.set(key, { ...RateLimiter.DEFAULT_CONFIG, ...config });
  }

  /**
   * Get configuration for a key
   */
  private static getConfig(key: string): RateLimitConfig {
    return RateLimiter.configs.get(key) || RateLimiter.DEFAULT_CONFIG;
  }

  /**
   * Check if request is allowed
   */
  static isAllowed(key: string): boolean {
    const now = Date.now();
    const config = RateLimiter.getConfig(key);
    const record = RateLimiter.records.get(key) || {
      count: 0,
      windowStart: now,
    };

    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return false;
    }

    // Reset window if expired
    if (now - record.windowStart >= config.windowMs) {
      record.count = 0;
      record.windowStart = now;
      record.blockedUntil = undefined;
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      record.blockedUntil = now + config.blockDurationMs;
      RateLimiter.records.set(key, record);
      return false;
    }

    return true;
  }

  /**
   * Record a request
   */
  static recordRequest(key: string): void {
    const now = Date.now();
    const config = RateLimiter.getConfig(key);
    const record = RateLimiter.records.get(key) || {
      count: 0,
      windowStart: now,
    };

    // Reset window if expired
    if (now - record.windowStart >= config.windowMs) {
      record.count = 0;
      record.windowStart = now;
      record.blockedUntil = undefined;
    }

    record.count++;
    RateLimiter.records.set(key, record);
  }

  /**
   * Get remaining requests in current window
   */
  static getRemainingRequests(key: string): number {
    const config = RateLimiter.getConfig(key);
    const record = RateLimiter.records.get(key);

    if (!record) {
      return config.maxRequests;
    }

    const now = Date.now();

    // If window expired, full limit available
    if (now - record.windowStart >= config.windowMs) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - record.count);
  }

  /**
   * Get time until next request allowed (if blocked)
   */
  static getRetryAfter(key: string): number | null {
    const record = RateLimiter.records.get(key);

    if (!record || !record.blockedUntil) {
      return null;
    }

    const now = Date.now();
    const retryAfter = record.blockedUntil - now;

    return retryAfter > 0 ? retryAfter : null;
  }

  /**
   * Clear rate limiting data for a key
   */
  static clear(key: string): void {
    RateLimiter.records.delete(key);
  }

  /**
   * Clear all rate limiting data
   */
  static clearAll(): void {
    RateLimiter.records.clear();
  }

  /**
   * Get rate limiting info for a key
   */
  static getInfo(key: string): {
    isAllowed: boolean;
    remainingRequests: number;
    retryAfter: number | null;
    config: RateLimitConfig;
  } {
    return {
      isAllowed: RateLimiter.isAllowed(key),
      remainingRequests: RateLimiter.getRemainingRequests(key),
      retryAfter: RateLimiter.getRetryAfter(key),
      config: RateLimiter.getConfig(key),
    };
  }

  /**
   * Middleware function for fetch requests
   */
  static enhanceRequest(
    url: string,
    options: RequestInit = {},
    rateLimitKey?: string
  ): Promise<RequestInit> {
    const key = rateLimitKey || RateLimiter.getKeyFromUrl(url);

    return new Promise((resolve, reject) => {
      if (!RateLimiter.isAllowed(key)) {
        const retryAfter = RateLimiter.getRetryAfter(key);
        const error = new Error("Rate limit exceeded") as RateLimitError;
        error.retryAfter = retryAfter;
        error.rateLimitKey = key;
        reject(error);
        return;
      }

      RateLimiter.recordRequest(key);
      resolve(options);
    });
  }

  /**
   * Generate rate limit key from URL
   */
  private static getKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);
      // Group by path without query parameters
      return `${urlObj.pathname}`;
    } catch {
      // Fallback for relative URLs
      const path = url.split("?")[0];
      return path;
    }
  }

  /**
   * Initialize default rate limits for common endpoints
   */
  static initializeDefaults(): void {
    // More restrictive limits for auth endpoints
    RateLimiter.configure("/api/auth/login", {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 30 * 60 * 1000, // 30 minutes
    });

    // Moderate limits for data modification
    RateLimiter.configure("/api/users", {
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 5 * 60 * 1000, // 5 minutes
    });

    // Generous limits for read operations
    RateLimiter.configure("/api/dashboard", {
      maxRequests: 200,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 2 * 60 * 1000, // 2 minutes
    });
  }
}

export default RateLimiter;
