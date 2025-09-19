# Copilot Instructions for Cribxpert-Admin

## Project Overview

- **Stack:** React + TypeScript + Vite, modular structure under `src/features/`
- **Purpose:** Admin dashboard for property management, with performance-optimized UI for large datasets (e.g., listings)

## Architecture & Patterns

- **Feature-based organization:** Each domain (e.g., `listingmgmt`, `usermgmt`, `analytics`) is a folder in `src/features/` with its own `components/`, `containers/`, `modals/`, and `utils/`.
- **Performance:** Use `OptimizedListingGrid` and `VirtualizedListingGrid` for large lists; `OptimizedListingImage` for images. See `src/features/listingmgmt/README.md` for details.
- **Barrel exports:** Each feature has an `index.ts` for simplified imports.
- **Utilities:** Shared logic in `src/utils/` and feature-specific logic in `src/features/<feature>/utils/`.
- **State management:** Centralized in `src/store/` (see `enhancedStore.ts`, `slices/`, and `hooks.ts`).
- **Context:** Use React Context for cross-cutting concerns (e.g., `NotificationContext.tsx`).

## Developer Workflows

- **Start dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint` (uses ESLint with TypeScript and React plugins)
- **Test:** (Add details if/when test setup is present)
- **Debug:** Use Vite's HMR and browser devtools; inspect feature-specific containers for data flow.

## Conventions & Best Practices

- **Import aliases:** Prefer `@/` for root imports (see Vite config).
- **Component structure:** Keep UI logic in `components/`, data-fetching and orchestration in `containers/`.
- **Performance:** Always use virtualized/lazy components for large lists/images.
- **Error handling:** Use skeleton loaders and error states for async UI (see `OptimizedListingImage`).
- **Barrel exports:** Import from feature `index.ts` for clarity and maintainability.

## Integration & Dependencies

- **Vite plugins:** Uses `@vitejs/plugin-react` or `@vitejs/plugin-react-swc` for fast refresh.
- **ESLint:** Configured for strict type checking and React best practices (see `eslint.config.js`).
- **Assets:** Static assets in `public/` and `src/assets/`.

## Key References

- `src/features/listingmgmt/README.md`: Performance and structure patterns
- `src/store/`: State management
- `src/utils/`: Shared utilities
- `vite.config.ts`, `eslint.config.js`: Tooling and config

---

**For AI agents:**

- Follow feature boundaries and use existing patterns for new code.
- Reference feature `README.md` files for domain-specific conventions.
- Prefer performance-optimized components/utilities for any list/image-heavy UI.
- Use barrel exports and import aliases for maintainability.
