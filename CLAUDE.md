# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- **Development**: `npm run dev` - Starts development server with host binding for local network access
- **Build**: `npm run build` - Creates production build
- **Preview**: `npm run preview` - Preview production build locally
- **Dependencies**: `npm install` - Install all project dependencies

### System Requirements
- Node.js ≥20.9.0
- npm ≥8.0.0

## Architecture Overview

### Technology Stack
- **Framework**: Nuxt 3 (SSR disabled, SPA mode)
- **Frontend**: Vue 3 with Composition API
- **Styling**: Tailwind CSS with dark mode support
- **Charts**: Chart.js with vue-chartjs integration
- **Storage**: Client-side localStorage with AES-GCM encryption
- **API**: Server-side endpoints for Taiwan stock data (FinMind API)

### Core Data Model
The application revolves around three main data entities:

1. **Transactions** (`Transaction` interface):
   - Financial transactions (buy/sell) with metadata
   - Supports multiple asset types: `tw_stock`, `us_stock`, `crypto`, `bond`, `financial_product`
   - Includes pricing, fees, and calculated totals

2. **Asset History**:
   - Periodic snapshots of portfolio state
   - Tracks cash balance and investment values over time
   - Used for trend analysis and historical chart generation

3. **Portfolio State**:
   - Real-time calculated view of current holdings
   - Aggregates transactions to show current positions
   - Includes unrealized gains/losses when stock prices available

### Composables Architecture
The application uses Vue 3 composables for state management and business logic:

#### Core Business Logic
- **`useTransactions`**: Global transaction state, CRUD operations, and portfolio calculations
- **`useAssetHistory`**: Historical asset tracking and trend analysis
- **`useStockPrice`**: Taiwan stock data fetching and caching (FinMind API integration)

#### Infrastructure
- **`useSecureStorage`**: Encrypted localStorage wrapper for sensitive data
- **`useCrypto`**: AES-GCM encryption/decryption for financial data
- **`useTheme`**: Dark/light mode management with system preference detection

### Security Implementation
The application implements comprehensive client-side encryption:

- **Encryption**: AES-GCM with 256-bit keys
- **Key Management**: PBKDF2 key derivation with unique salts
- **Data Protection**: All sensitive financial data encrypted at rest
- **Migration**: Automatic migration from unencrypted to encrypted storage
- **Backward Compatibility**: Graceful handling of legacy unencrypted data

Sensitive data keys that are automatically encrypted: `transactions`, `asset_history`, `initial_setup`

### API Endpoints
Server-side APIs located in `/server/api/`:

- **`GET /api/stock?symbol=XXXX`**: Fetch Taiwan stock information
  - Validates 4-6 digit stock codes
  - Queries both TWSE (listed) and OTC (over-the-counter) markets
  - Returns stock name, current price, and price change data
  
- **`GET /api/stock-list`**: Retrieve Taiwan stock listing
- **`POST /api/clear-cache`**: Clear server-side cache

### Page Structure and Routing
- **`/`** (index.vue): Dashboard with portfolio overview and recent transactions
- **`/add`**: Transaction entry form with asset type selection and real-time validation
- **`/portfolio`**: Portfolio analysis with charts (pie chart with date picker, area chart, asset trend chart)
- **`/transactions`**: Transaction listing with CSV import/export functionality
- **`/analysis`**: Trading behavior analysis and performance metrics
- **`/settings`**: Application configuration and data management
- **`/setup`**: Initial setup wizard for new users
- **`/stock/[symbol]`**: Individual stock detail view

### Chart Implementation
Uses Chart.js with vue-chartjs for data visualization:

- **Pie Charts**: Portfolio allocation with date-specific views using date picker
- **Area Charts**: Stacked area charts for portfolio value over time
- **Line Charts**: Asset trend analysis with configurable time ranges
- **Theme Integration**: Charts automatically adapt to dark/light mode

### Data Flow Patterns
1. **Transaction Entry**: Form → Validation → useTransactions → Encrypted Storage → Portfolio Recalculation
2. **Chart Data**: Historical Data → Date Filtering → Chart.js Datasets → Reactive Updates
3. **Stock Data**: User Input → API Validation → Cache → Real-time Updates

### Theme System
Implements a modern slate-blue theme with:
- **Primary**: `bg-slate-900` (dark), `bg-slate-800` (secondary)
- **Accent**: `bg-blue-600` with hover states
- **Text**: `text-slate-100` (primary), `text-slate-400` (muted)
- **Success/Error**: `text-emerald-400`, `text-red-400`
- **Buttons**: Low-key styling with `rounded-lg`, `shadow-md`, `font-medium`

### Common Development Patterns

#### Adding New Encrypted Data Types
1. Add key to `SENSITIVE_KEYS` in useSecureStorage
2. Use `getItem/setItem` from `useSecureStorage()` composable
3. Handle migration in data loading functions

#### Creating New Charts
1. Import Chart.js components and register required elements
2. Use computed properties for reactive data
3. Implement theme-aware color schemes
4. Add time range controls where appropriate

#### Working with Transactions
- Always use the global `useTransactions()` composable
- Call `initialize()` before accessing transaction data
- Use `addTransaction()` for single entries, `addTransactions()` for bulk operations

#### Asset History Integration
- Use `useAssetHistory()` for time-series data
- Call `addAssetSnapshot()` after significant portfolio changes
- Historical charts require asset history data to function properly

### Configuration Files
- **`nuxt.config.ts`**: SSR disabled, Tailwind integration, meta tags, Google Fonts
- **Tailwind**: Class-based dark mode, content scanning for all Vue files
- **TypeScript**: Enabled throughout with strict typing for financial data

This codebase prioritizes data security, user privacy (local-only storage), and comprehensive financial tracking for personal investment management.