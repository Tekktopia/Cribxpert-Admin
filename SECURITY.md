# Security Implementation Guide

This guide explains how our comprehensive security system works and how to use it effectively.

## 🛡️ Security Architecture Overview

Our security system has 5 main layers:

1. **Input Sanitization** - Cleans and validates all user inputs
2. **Secure Storage** - Safe token and user data management
3. **CSRF Protection** - Prevents cross-site request forgery
4. **Rate Limiting** - Controls API request frequency
5. **CSP Management** - Content Security Policy enforcement

## 📁 File Structure

```
src/
├── utils/
│   ├── inputSanitization.ts    # Input validation & sanitization
│   ├── secureStorage.ts        # Secure token storage
│   ├── csrfProtection.ts       # CSRF token management
│   ├── rateLimiter.ts          # API rate limiting
│   ├── cspManager.ts           # Content Security Policy
│   └── securityManager.ts      # Central security orchestration
├── store/
│   ├── enhancedStore.ts        # Redux store with security middleware
│   ├── securityHooks.ts        # React hooks for easy integration
│   └── slices/
│       ├── authSlice.ts        # Authentication state
│       ├── securitySlice.ts    # Security status
│       └── uiSlice.ts          # UI state
└── components/
    └── SecurityExample.tsx     # Example usage component
```

## 🚀 Quick Start

### 1. Basic Authentication

```typescript
import { useAuth } from "../store/securityHooks";

function LoginComponent() {
  const { login, logout, isAuthenticated, user, error } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      email: "user@example.com",
      password: "password123",
    });

    if (result.success) {
      console.log("Logged in!", result.user);
    } else {
      console.error("Login failed:", result.error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 2. Secure API Calls

```typescript
import { useSecureApi } from "../store/securityHooks";

function DataComponent() {
  const { secureApiCall, loading } = useSecureApi();

  const fetchData = async () => {
    const result = await secureApiCall("/api/dashboard/stats");

    if (result.error) {
      console.error("API Error:", result.error);
    } else {
      console.log("Data:", result.data);
    }
  };

  return (
    <button onClick={fetchData} disabled={loading}>
      {loading ? "Loading..." : "Fetch Data"}
    </button>
  );
}
```

### 3. Secure Form Submission

```typescript
import { useSecureFormSubmission } from "../store/securityHooks";

function ContactForm() {
  const { submitForm } = useSecureFormSubmission();

  const handleSubmit = async (formData: FormData) => {
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    const result = await submitForm("/api/contact", data);

    if (result.error) {
      console.error("Submission failed:", result.error);
    } else {
      console.log("Form submitted successfully!");
    }
  };

  // Form component with validation happens automatically
}
```

## 🔧 Advanced Usage

### Security Manager

The `SecurityManager` is the central coordinator for all security features:

```typescript
import SecurityManager from "../utils/securityManager";

// Initialize security system
SecurityManager.initialize();

// Get security status
const status = SecurityManager.getSecurityStatus();

// Make secure fetch calls
const response = await SecurityManager.secureFetch("/api/data", {
  method: "POST",
  body: JSON.stringify(data),
});

// Validate form data
const sanitizedData = SecurityManager.validateFormData(formData);
```

### Individual Security Utilities

You can also use individual security utilities directly:

```typescript
// Input sanitization
import {
  validateEmail,
  sanitizeHTML,
  sanitizeName,
} from "../utils/inputSanitization";

const email = validateEmail("user@example.com");
const cleanHTML = sanitizeHTML('<script>alert("xss")</script>Hello');
const safeName = sanitizeName("John Doe Jr.");

// Secure storage
import SecureTokenStorage from "../utils/secureStorage";

SecureTokenStorage.setToken("jwt-token-here", 3600); // 1 hour expiry
const token = SecureTokenStorage.getToken();
const isValid = SecureTokenStorage.isAuthenticated();

// CSRF protection
import CSRFProtection from "../utils/csrfProtection";

const token = CSRFProtection.getToken();
CSRFProtection.validateToken(token);

// Rate limiting
import RateLimiter from "../utils/rateLimiter";

const canProceed = RateLimiter.checkLimit("api-calls", 100); // 100 calls per window
```

## 🛠️ Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Security Settings
VITE_CSRF_TOKEN_NAME=_csrf_token
VITE_RATE_LIMIT_WINDOW=60000
VITE_RATE_LIMIT_MAX_REQUESTS=100
VITE_SESSION_TIMEOUT=3600000

# API Endpoints
VITE_API_BASE_URL=http://localhost:3001/api
VITE_AUTH_ENDPOINT=/auth/login
```

### CSP Configuration

Content Security Policy is automatically configured, but you can customize it:

```typescript
import CSPManager from "../utils/cspManager";

// Add custom script source
CSPManager.addScriptSrc("https://trusted-cdn.com");

// Add custom style source
CSPManager.addStyleSrc("https://fonts.googleapis.com");

// Apply the policy
CSPManager.applyPolicy();
```

## 🧪 Testing Security

### Example Test Cases

```typescript
// Test input sanitization
import { validateEmail } from "../utils/inputSanitization";

test("should validate legitimate email", () => {
  expect(validateEmail("user@example.com")).toBe("user@example.com");
});

test("should reject malicious email", () => {
  expect(() => validateEmail('<script>alert("xss")</script>@evil.com')).toThrow(
    "Invalid email format"
  );
});

// Test secure storage
import SecureTokenStorage from "../utils/secureStorage";

test("should store and retrieve token", () => {
  SecureTokenStorage.setToken("test-token", 3600);
  expect(SecureTokenStorage.getToken()).toBe("test-token");
});

test("should clear expired tokens", () => {
  SecureTokenStorage.setToken("expired-token", -1);
  expect(SecureTokenStorage.isAuthenticated()).toBe(false);
});
```

## 🔍 Security Monitoring

### Security Status Hook

```typescript
import { useSecurityStatus } from "../store/securityHooks";

function SecurityDashboard() {
  const { securityStatus, refreshSecurityStatus } = useSecurityStatus();

  return (
    <div>
      <h3>Security Status</h3>
      <p>CSRF Protected: {securityStatus.csrfProtected ? "✅" : "❌"}</p>
      <p>Rate Limited: {securityStatus.rateLimited ? "✅" : "❌"}</p>
      <p>CSP Enabled: {securityStatus.cspEnabled ? "✅" : "❌"}</p>
      <p>Token Valid: {securityStatus.tokenValid ? "✅" : "❌"}</p>
      <button onClick={refreshSecurityStatus}>Refresh</button>
    </div>
  );
}
```

## 🚨 Security Best Practices

### 1. Always Validate Input

```typescript
// ❌ BAD - Direct use of user input
const userMessage = formData.get("message");
await api.post("/api/messages", { message: userMessage });

// ✅ GOOD - Validate and sanitize first
const userMessage = sanitizeText(formData.get("message") as string);
await SecurityManager.secureFetch("/api/messages", {
  method: "POST",
  body: JSON.stringify({ message: userMessage }),
});
```

### 2. Use Secure API Calls

```typescript
// ❌ BAD - Direct fetch without security
const response = await fetch("/api/data");

// ✅ GOOD - Use SecurityManager for automatic protection
const response = await SecurityManager.secureFetch("/api/data");
```

### 3. Handle Authentication Properly

```typescript
// ❌ BAD - Manual token management
localStorage.setItem("token", userToken);

// ✅ GOOD - Use secure storage with expiry
SecureTokenStorage.setToken(userToken, 3600);
```

### 4. Monitor Security Status

```typescript
// ✅ GOOD - Regular security health checks
const { securityStatus } = useSecurityStatus();

if (!securityStatus.csrfProtected) {
  console.warn("CSRF protection is disabled!");
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"CSRF token missing" error**

   - Solution: Ensure `CSRFProtection.initialize()` is called before making requests

2. **"Rate limit exceeded" error**

   - Solution: Check your request frequency or adjust rate limits in configuration

3. **"Authentication expired" error**

   - Solution: Token has expired, user needs to login again

4. **TypeScript errors with hooks**
   - Solution: Ensure you have the proper type imports and Redux store setup

### Debug Mode

Enable debug logging by setting:

```typescript
// In your main.tsx or App.tsx
SecurityManager.enableDebugMode();
```

## 📚 Additional Resources

- [React Security Best Practices](https://reactjs.org/docs/cross-origin-errors.html)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Redux Security Patterns](https://redux.js.org/usage/security)

## 🆘 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your configuration in `.env` file
3. Test with the `SecurityExample.tsx` component
4. Review this documentation for proper usage patterns

Remember: Security is a shared responsibility. Always validate inputs, use HTTPS, and keep dependencies updated!
