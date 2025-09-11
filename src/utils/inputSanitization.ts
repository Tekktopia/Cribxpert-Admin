/**
 * Input sanitization and validation utilities
 * Provides secure methods for handling user input to prevent injection attacks
 */

import DOMPurify from "isomorphic-dompurify";

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
}

export interface ValidationOptions {
  maxLength?: number;
  minLength?: number;
  allowHtml?: boolean;
  allowedTags?: string[];
  pattern?: RegExp;
  required?: boolean;
}

/**
 * Input sanitization utility class
 */
export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(
    input: string,
    options: { allowedTags?: string[] } = {}
  ): string {
    if (!input || typeof input !== "string") {
      return "";
    }

    const config = {
      ALLOWED_TAGS: options.allowedTags || [
        "b",
        "i",
        "em",
        "strong",
        "p",
        "br",
      ],
      ALLOWED_ATTR: ["href", "title", "alt"],
      FORBID_SCRIPTS: true,
      FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input"],
      FORBID_ATTR: [
        "onload",
        "onerror",
        "onclick",
        "onmouseover",
        "onfocus",
        "onblur",
        "onchange",
        "onsubmit",
      ],
    };

    return DOMPurify.sanitize(input, config);
  }

  /**
   * Sanitize plain text input (strip all HTML)
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== "string") {
      return "";
    }

    // Remove all HTML tags and decode entities
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = "";

    if (!email || typeof email !== "string") {
      errors.push("Email is required");
      return { isValid: false, sanitizedValue: "", errors };
    }

    // Basic sanitization
    sanitizedValue = email.trim().toLowerCase();

    // Remove any HTML tags
    sanitizedValue = this.sanitizeText(sanitizedValue);

    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(sanitizedValue)) {
      errors.push("Invalid email format");
    }

    if (sanitizedValue.length > 254) {
      errors.push("Email too long (max 254 characters)");
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
    };
  }

  /**
   * Sanitize phone number input
   */
  static sanitizePhoneNumber(phone: string): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = "";

    if (!phone || typeof phone !== "string") {
      errors.push("Phone number is required");
      return { isValid: false, sanitizedValue: "", errors };
    }

    // Remove all non-digit characters except + and spaces
    sanitizedValue = phone.replace(/[^\d+\s()-]/g, "");

    // Remove HTML tags
    sanitizedValue = this.sanitizeText(sanitizedValue);

    // Basic phone validation (international format)
    const phoneRegex = /^[+]?[1-9][\d\s-()]{7,15}$/;

    if (!phoneRegex.test(sanitizedValue.replace(/[\s-()]/g, ""))) {
      errors.push("Invalid phone number format");
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
    };
  }

  /**
   * Sanitize name input (person names, company names, etc.)
   */
  static sanitizeName(
    name: string,
    options: ValidationOptions = {}
  ): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = "";

    if (!name || typeof name !== "string") {
      if (options.required) {
        errors.push("Name is required");
      }
      return { isValid: !options.required, sanitizedValue: "", errors };
    }

    // Remove HTML tags and trim whitespace
    sanitizedValue = this.sanitizeText(name).trim();

    // Remove potentially dangerous characters but keep letters, spaces, hyphens, apostrophes
    sanitizedValue = sanitizedValue.replace(/[^a-zA-Z\s-'.]/g, "");

    // Check length constraints
    if (options.minLength && sanitizedValue.length < options.minLength) {
      errors.push(`Name must be at least ${options.minLength} characters`);
    }

    if (options.maxLength && sanitizedValue.length > options.maxLength) {
      errors.push(`Name must not exceed ${options.maxLength} characters`);
      sanitizedValue = sanitizedValue.substring(0, options.maxLength);
    }

    // Check for suspicious patterns
    if (sanitizedValue.match(/(.)\1{4,}/)) {
      errors.push("Name contains suspicious repeated characters");
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
    };
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(
    input: string | number,
    options: { min?: number; max?: number; integer?: boolean } = {}
  ): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = "";

    if (input === null || input === undefined || input === "") {
      errors.push("Number is required");
      return { isValid: false, sanitizedValue: "", errors };
    }

    // Convert to string and sanitize
    const stringInput = String(input);
    const cleanInput = this.sanitizeText(stringInput);

    // Parse number
    const parsedNumber = options.integer
      ? parseInt(cleanInput, 10)
      : parseFloat(cleanInput);

    if (isNaN(parsedNumber)) {
      errors.push("Invalid number format");
      return { isValid: false, sanitizedValue: "", errors };
    }

    // Check constraints
    if (options.min !== undefined && parsedNumber < options.min) {
      errors.push(`Number must be at least ${options.min}`);
    }

    if (options.max !== undefined && parsedNumber > options.max) {
      errors.push(`Number must not exceed ${options.max}`);
    }

    sanitizedValue = String(parsedNumber);

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
    };
  }

  /**
   * Sanitize URL input
   */
  static sanitizeUrl(url: string): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = "";

    if (!url || typeof url !== "string") {
      errors.push("URL is required");
      return { isValid: false, sanitizedValue: "", errors };
    }

    // Remove HTML tags and trim
    sanitizedValue = this.sanitizeText(url).trim();

    try {
      // Use URL constructor for validation
      const urlObj = new URL(sanitizedValue);

      // Only allow http and https protocols
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        errors.push("Only HTTP and HTTPS URLs are allowed");
      }

      // Check for suspicious patterns
      if (sanitizedValue.match(/javascript:|data:|vbscript:/i)) {
        errors.push("URL contains prohibited protocols");
      }

      sanitizedValue = urlObj.toString();
    } catch {
      errors.push("Invalid URL format");
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
    };
  }

  /**
   * Sanitize general text input with customizable options
   */
  static sanitizeGeneralInput(
    input: string,
    options: ValidationOptions = {}
  ): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = "";

    if (!input || typeof input !== "string") {
      if (options.required) {
        errors.push("Input is required");
      }
      return { isValid: !options.required, sanitizedValue: "", errors };
    }

    // Sanitize based on HTML allowance
    if (options.allowHtml) {
      sanitizedValue = this.sanitizeHtml(input, {
        allowedTags: options.allowedTags,
      });
    } else {
      sanitizedValue = this.sanitizeText(input);
    }

    // Trim whitespace
    sanitizedValue = sanitizedValue.trim();

    // Check length constraints
    if (options.minLength && sanitizedValue.length < options.minLength) {
      errors.push(`Input must be at least ${options.minLength} characters`);
    }

    if (options.maxLength && sanitizedValue.length > options.maxLength) {
      errors.push(`Input must not exceed ${options.maxLength} characters`);
      sanitizedValue = sanitizedValue.substring(0, options.maxLength);
    }

    // Check pattern if provided
    if (options.pattern && !options.pattern.test(sanitizedValue)) {
      errors.push("Input format is invalid");
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
    };
  }

  /**
   * Sanitize SQL-like input to prevent injection
   */
  static sanitizeSqlInput(input: string): string {
    if (!input || typeof input !== "string") {
      return "";
    }

    // Remove HTML first
    let sanitized = this.sanitizeText(input);

    // Escape single quotes and remove dangerous SQL keywords
    sanitized = sanitized.replace(/'/g, "''");

    // Remove or escape dangerous SQL patterns
    const dangerousPatterns = [
      /;\s*(drop|delete|insert|update|create|alter|exec|execute|sp_|xp_)/gi,
      /union\s+select/gi,
      /select\s+.*from/gi,
      /--|\/\*|\*\//g,
    ];

    dangerousPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "");
    });

    return sanitized;
  }

  /**
   * Sanitize file name input
   */
  static sanitizeFileName(fileName: string): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = "";

    if (!fileName || typeof fileName !== "string") {
      errors.push("File name is required");
      return { isValid: false, sanitizedValue: "", errors };
    }

    // Remove HTML tags
    sanitizedValue = this.sanitizeText(fileName).trim();

    // Remove dangerous characters (control characters handled separately)
    sanitizedValue = sanitizedValue.replace(/[<>:"/\\|?*]/g, "");

    // Remove control characters (0x00-0x1f)
    // eslint-disable-next-line no-control-regex
    sanitizedValue = sanitizedValue.replace(/[\x00-\x1f]/g, "");

    // Remove leading/trailing dots and spaces
    sanitizedValue = sanitizedValue.replace(/^[.\s]+|[.\s]+$/g, "");

    // Check for reserved Windows names
    const reservedNames = [
      "CON",
      "PRN",
      "AUX",
      "NUL",
      "COM1",
      "COM2",
      "COM3",
      "COM4",
      "COM5",
      "COM6",
      "COM7",
      "COM8",
      "COM9",
      "LPT1",
      "LPT2",
      "LPT3",
      "LPT4",
      "LPT5",
      "LPT6",
      "LPT7",
      "LPT8",
      "LPT9",
    ];

    if (reservedNames.includes(sanitizedValue.toUpperCase())) {
      errors.push("File name uses a reserved system name");
    }

    // Check length
    if (sanitizedValue.length === 0) {
      errors.push("File name cannot be empty");
    } else if (sanitizedValue.length > 255) {
      errors.push("File name too long (max 255 characters)");
      sanitizedValue = sanitizedValue.substring(0, 255);
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
    };
  }
}

/**
 * Quick sanitization functions for common use cases
 */
export const sanitize = {
  text: (input: string) => InputSanitizer.sanitizeText(input),
  html: (input: string, allowedTags?: string[]) =>
    InputSanitizer.sanitizeHtml(input, { allowedTags }),
  email: (input: string) => InputSanitizer.sanitizeEmail(input),
  phone: (input: string) => InputSanitizer.sanitizePhoneNumber(input),
  name: (input: string, options?: ValidationOptions) =>
    InputSanitizer.sanitizeName(input, options),
  number: (
    input: string | number,
    options?: { min?: number; max?: number; integer?: boolean }
  ) => InputSanitizer.sanitizeNumber(input, options),
  url: (input: string) => InputSanitizer.sanitizeUrl(input),
  fileName: (input: string) => InputSanitizer.sanitizeFileName(input),
  sql: (input: string) => InputSanitizer.sanitizeSqlInput(input),
};

export default InputSanitizer;
