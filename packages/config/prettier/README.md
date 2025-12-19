# @swissgeo/config-prettier

Shared Prettier configuration for SWISSGEO projects.

## Overview

This package provides a standardized Prettier configuration for SWISSGEO projects, ensuring consistent code formatting across the organization.

This configuration is exported as a JavaScript module (ESM). It now exposes a function that lets you opt‑in to the plugins you want to use.

## Monorepo Usage

**Recommended approach**: In a monorepo setup, it's best to install this package and its peer dependencies at the **root level** of your monorepo, rather than in each individual package. This ensures consistent formatting across all packages and simplifies dependency management.

This differs from ESLint configuration, which is typically added to each package individually due to its more granular, project-specific nature.

## Installation

```bash
pnpm install --workspace-root --save-dev @swissgeo/config-prettier prettier
```

Then, install whichever Prettier plugins you want to enable in your project (optional — pick only what you need):

```bash
pnpm install --workspace-root --save-dev @prettier/plugin-xml prettier-plugin-jsdoc prettier-plugin-packagejson prettier-plugin-tailwindcss
```

## Usage

### Basic Configuration

Create a `prettier.config.js` (or `prettier.config.ts`) file in your project root (or monorepo root) and call the exported `defineConfig` function:

```javascript
import defineConfig from '@swissgeo/config-prettier'

// No extra plugins
export default defineConfig()
```

To enable plugins, pass them as arguments (make sure they are installed in your project):

```javascript
import defineConfig from '@swissgeo/config-prettier'

export default defineConfig(
  '@prettier/plugin-xml',
  'prettier-plugin-jsdoc',
  'prettier-plugin-packagejson',
  'prettier-plugin-tailwindcss'
)
```

### Extending the Configuration

You can extend or override the resulting configuration:

```javascript
import defineConfig from '@swissgeo/config-prettier'

const base = defineConfig('prettier-plugin-jsdoc')

export default {
  ...base,
  // Your custom overrides
  printWidth: 120,
}
```

## Configuration Details

The default configuration includes:

- **Print Width**: 100 characters
- **Quotes**: Single quotes for JavaScript/TypeScript
- **Semicolons**: No trailing semicolons
- **Trailing Commas**: ES5-compatible
- **Tab Width**: 4 spaces (2 spaces for Markdown files)
- **Single Attribute Per Line**: Enabled for better readability

### Plugins

This package supports the following Prettier plugins (they are not bundled — install and opt‑in via `defineConfig`):

- **@prettier/plugin-xml**: Format XML files
- **prettier-plugin-jsdoc**: Format JSDoc comments
- **prettier-plugin-packagejson**: Format `package.json` files
- **prettier-plugin-tailwindcss**: Sort Tailwind CSS classes

## Overrides

Special formatting rules for specific file types:

- **Markdown files** (`.md`): Use 2-space indentation instead of 4

## Peer Dependencies

This package requires:

- `prettier`

Optional (install only the ones you use and pass them to `defineConfig`):

- `@prettier/plugin-xml`
- `prettier-plugin-jsdoc`
- `prettier-plugin-packagejson`
- `prettier-plugin-tailwindcss`

## License

BSD-3-Clause

## Repository

[https://github.com/geoadmin/web-mapviewer](https://github.com/geoadmin/web-mapviewer)
