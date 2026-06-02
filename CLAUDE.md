# CribXpert Admin Portal

## Project
Internal admin dashboard for the CribXpert platform. Separate repo from the guest/host frontend.

## Stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Redux Toolkit + RTK Query (store/api and store/slices)
- Supabase JS client (shared Supabase project with main frontend)
- Recharts for data visualisation

## Folder Structure
- src/features/ — feature modules (auth, dashboard, usermgmt, bookingmgmt, listingmgmt, kyc, financials, finance-admin, analytics, messaging, notifications, csr, groups, bookingmetrics, userdetails)
- src/components/ — shared UI (auth, charts, layout, ui)
- src/pages/ — page components (CSR, finance-admin)
- src/api/ — API layer and feature API slices
- src/store/ — Redux store, API config, and slices
- src/services/ — service layer
- src/hooks/ — custom hooks
- src/contexts/ — React context providers
- src/utils/ — utility functions
- src/lib/ — library configs
- src/types/ — TypeScript types
- src/config/ — app configuration
- src/data/ — static/seed data

## Deployment
- Netlify (separate from main frontend)
- Shared Supabase backend with main frontend

## Conventions
- Primary brand color: #1D5C5C
- Full rewritten files preferred over patch diffs
- Shared helpers go in src/utils/ or src/services/, not new files
- Follow existing shadcn/ui component patterns
- No duplicate utilities

## Key Features
- User management (hosts and guests)
- Booking management and metrics
- Listing management
- KYC review and approval
- Financials and finance admin
- Analytics and reporting
- CSR (customer support) dashboard
- Messaging and notifications
- Agent dashboard for Chatwoot handoff

## Do Not Touch
- dist/ (build output)
- public/ (static assets)