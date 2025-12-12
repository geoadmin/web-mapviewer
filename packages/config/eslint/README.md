# @swissgeo/config-eslint

Shared ESLint configuration for SWISSGEO projects.

## Overview

This package provides a comprehensive ESLint flat config setup for SWISSGEO projects, with built-in support for:

- TypeScript
- Vue 3
- JavaScript (ES6+)
- Markdown files
- Unit tests (Mocha, Chai)
- Cypress E2E tests

## Installation

```bash
npm install --save-dev @swissgeo/config-eslint eslint
```

## Usage

### Basic Configuration

Create an `eslint.config.mts` file in your project root:

```typescript
import eslintConfig from '@swissgeo/config-eslint'

export default eslintConfig
```

### With Cypress Tests

If your project includes Cypress tests, use the `cypressConfig` function:

```typescript
import eslintConfig, { cypressConfig } from '@swissgeo/config-eslint'

export default [
  ...eslintConfig,
  ...cypressConfig('tests/cypress/'), // Specify your Cypress root directory
]
```

### Custom Configuration

You can extend or override the default configuration:

```typescript
import eslintConfig from '@swissgeo/config-eslint'

export default [
  ...eslintConfig,
  {
    rules: {
      // Your custom rules
    },
  },
]
```

## Features

### TypeScript Support

- Full TypeScript linting with `@typescript-eslint`
- Consistent type exports enforcement
- No import type side-effects

### Vue 3 Support

- Vue 3 ESLint rules with TypeScript integration
- 4-space HTML indentation
- Alphabetical import sorting

### Import Sorting

Automatic alphabetical import sorting with `eslint-plugin-perfectionist`, treating `@/*` imports as internal.

### Code Style

- Enforced curly braces for all control statements
- Consistent brace style (1tbs)
- No console statements in production code (except tests)

### Test Support

- **Unit Tests**: Mocha and Chai-friendly rules for `*.spec.{js,ts}` files
- **Cypress Tests**: Cypress-recommended rules with custom configuration

### Markdown Linting

Support for linting code blocks in Markdown files.

## Peer Dependencies

This package requires:

- `eslint`
- `@swissgeo/config-prettier`
- `@swissgeo/config-stylelint`

## License

BSD-3-Clause

## Repository

[https://github.com/geoadmin/web-mapviewer](https://github.com/geoadmin/web-mapviewer)
