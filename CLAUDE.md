# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Nuxt 4 e-commerce application** (SilkShop) built with a **feature-based architecture**. The project uses:
- **Nuxt 4** with Vue 3 Composition API
- **Pinia** for state management
- **@nuxt/ui** for UI components
- **Tailwind CSS v4** for styling
- TypeScript throughout
- Feature-based auto-import system (custom modules)

The project appears to be a bilingual (Turkish/Russian) e-commerce platform with products, cart, orders, wishlist, user authentication, and order tracking features.

---

## Common Development Commands

```bash
# Development
npm run dev              # Start development server on port 3000
npm run build            # Build for production
npm run generate        # Generate static site
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Run ESLint with auto-fixes
npm run format          # Format code with Prettier
npm run format:check    # Check formatting

# Scaffolding
npm run create:feature <name>  # Generate new feature structure
```

**Single test execution**: No test framework is currently configured.

---

## Architecture & Structure

### Feature-Based Architecture

The app uses a **feature-based organization** under `app/features/`. Each feature is self-contained:

```
app/features/[feature]/
├── components/    # Vue components (auto-registered as <f-[feature]-[name]>)
├── composables/   # Composable functions (auto-imported globally)
├── stores/        # Pinia stores (auto-imported globally)
├── utils/         # Utility functions (auto-imported globally)
├── types/         # TypeScript types (explicit imports only)
└── pages/         # Route pages (auto-registered routes)
```

**Key Imports** (defined in `nuxt.config.ts`):
- `config/hooks/components.hooks.ts` - Auto-registers feature components with `F` prefix
- `config/hooks/imports.hooks.ts` - Auto-imports composables/stores/utils
- `config/hooks/pages.hooks.ts` - Auto-registers feature pages as routes

### Auto-Import Conventions

**Components**: Scan `features/[name]/components/` and register globally:
- `features/todo/components/Item.vue` → `<f-todo-item />`
- Nested: `features/todo/components/ui/Button.vue` → `<f-todo-ui-button />`

**Composables/Stores/Utils**: Entire directories are auto-imported:
- `features/todo/composables/useTodo.ts` → `useTodo()` (no import needed)
- `features/cart/stores/cart.store.ts` → `useCartStore()` (no import needed)

**Types**: Must be imported explicitly:
```ts
import type { Product } from '~/features/products/types/product'
```

**Pages**: Automatically create routes:
- `features/products/pages/index.vue` → `/products`
- `features/products/pages/[id].vue` → `/products/:id`

### Routing

Pages are auto-discovered from feature directories. The custom `pages:extend` hook in `config/hooks/pages.hooks.ts` scans all `features/*/pages/` and registers routes.

### State Management

Pinia stores are used extensively. All stores in `features/*/stores/` are auto-imported. Example structure from `app/features/cart/stores/cart.store.ts`:
- Uses `defineStore` with Options or Setup API
- Persists cart to `localStorage` (client-side)
- Handles authentication with token refresh on 401 errors

### API Integration

The app uses `$fetch` with a local API at `http://localhost:3001/api/v1`. API responses typically include:
- Products with nested categories and options
- Customer authentication with access/refresh tokens
- Order creation with cart checkout

Example: `app/features/products/pages/index.vue` shows:
- Pagination with server-side params
- Real-time search with debouncing
- Category filtering and sorting
- Quick-add modal for products with options

### Internationalization

Bilingual support for Turkish (`tk`) and Russian (`ru`):
- Language stored in `localStorage` key `silkshop_lang`
- Current language tracked in reactive `lang` ref
- Template conditionals: `lang === 'tk' ? 'Türkmen' : 'Русский'`

---

## Important Patterns

### Feature Naming
- Feature directories: lowercase, kebab-case (`user-profile`, `order-history`)
- PascalCase conversion for store/composable names (`useUserProfileStore`)
- Component prefix: `f-[feature]-[name]` in templates

### Component Structure
- SFCs with `<script setup lang="ts">`
- Scoped styles with Tailwind utility classes
- Some shared components in `app/shared/components/` and `app/components/layout/`

### Auto-Import Watch Paths

Custom watch paths in `nuxt.config.ts` ensure HMR works when adding new feature files:
```ts
watch: [
  ...getFeaturePagesWatchPaths(),
  ...getFeatureComponentsWatchPaths(),
  ...getFeatureImportsWatchPaths(),
],
```

### Layouts

Defined in `app/layouts/`:
- `default.vue` - Main layout with `LayoutHeader` and `LayoutFooter`
- `auth.vue` - Authentication pages (signin/signup)

Global components used in layouts are in `app/components/layout/header/` subdirectory.

---

## Styling

- **Tailwind CSS v4** with custom CSS variables in `app/assets/index.css`
- Color scheme: gold accent (`#E8A020`) with dark/neutral palette
- Component styles typically scoped, using CSS variables for theming

---

## Notes for Contributors

1. **Feature isolation**: Features should not import deeply from other features. Use auto-imports within your feature; if cross-feature sharing is needed, extract to `shared/` or reconsider architecture.

2. **No barrel exports**: The `types/index.ts` pattern exists, but rule states "no barrel exports" — import directly from the type file.

3. **Component registration**: Don't manually register feature components in `nuxt.config.ts`. The custom module handles it automatically.

4. **Type imports**: Types are explicit-only; do not expect auto-imports for TypeScript types.

5. **API base**: Hardcoded as `http://localhost:3001/api/v1`. For production, this should be configurable via environment variables (not yet implemented).

6. **Cart persistence**: Cart is stored in `localStorage` under `silkshop_cart`. The cart store restores on app mount (see `Header.vue` calling `cartStore.restoreCart()`).

7. **Authentication**: Token-based with `customer_access_token` and `customer_refresh_token` in localStorage. The `refreshCustomerToken()` helper in `cart.store.ts` handles 401 retry logic.

8. **Linting/formatting**: ESLint extends `@nuxt/eslint-config` with Prettier integration. Always run `npm run lint` before committing.

---

## Configuration Files

- `nuxt.config.ts` - Main Nuxt configuration with custom modules
- `eslint.config.mjs` - ESLint configuration (Nuxt + Prettier)
- `package.json` - Scripts and dependencies
- `app.config.ts` - App-level config (currently empty)
- `.prettierrc` - Prettier configuration (exists but not read yet)

---

## Known Gaps / TODOs

- No test setup configured (Vitest/Jest not present)
- API base URL is hardcoded; should use runtime config (`useRuntimeConfig()`)
- Some stores (products, todo, etc.) have placeholder fetch logic with "TODO" comments
- Environment-specific configuration (dev/prod) not fully defined

---

## Tool-Specific Guidance

### Using the `create:feature` script

```bash
npm run create:feature products
```

Generates:
- `app/features/products/types/index.ts`
- `app/features/products/composables/useProducts.ts`
- `app/features/products/stores/products.store.ts`
- `app/features/products/components/Empty.vue`
- `app/features/products/pages/index.vue`

The script enforces kebab-case feature names and avoids overwriting existing features.

---

## File Locations Reference

- **Global layout components**: `app/components/layout/`
- **Shared UI components**: `app/shared/components/`
- **Static assets**: `app/assets/` (index.css)
- **Pages**: `app/pages/` (only root `index.vue` likely exists)
- **Error handling**: `app/error.vue` (Nuxt error page)

---

## Debugging Tips

1. If a new feature component isn't recognized, ensure it's under `features/[name]/components/` and has a `.vue` extension.
2. If auto-imports aren't working, check that the composable/store/utils file is directly inside the feature's directory (no nested subdirectories other than components).
3. Route issues: Verify page file name in `features/[name]/pages/` (index.vue for list, [param].vue for dynamic).
4. For HMR issues with new files, restart dev server — the custom watch paths handle most cases, but new feature directories may need a restart.

---
