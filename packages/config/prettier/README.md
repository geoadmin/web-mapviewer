# @swissgeo/config-prettier

Shared Prettier configuration for SWISSGEO projects.

## Overview

This package provides a standardized Prettier configuration for SWISSGEO projects, ensuring consistent code formatting across the organization.

## Installation

```bash
npm install --save-dev @swissgeo/config-prettier prettier
```

You'll also need to install the peer dependencies:

```bash
npm install --save-dev @prettier/plugin-xml prettier-plugin-jsdoc prettier-plugin-packagejson prettier-plugin-tailwindcss
```

## Usage

### Basic Configuration

Create a `prettier.config.js` (or `.prettierrc.js`) file in your project root:

```javascript
import prettierConfig from '@swissgeo/config-prettier'

export default prettierConfig
```

Or reference it directly in your `package.json`:

```json
{
  "prettier": "@swissgeo/config-prettier"
}
```

### Extending the Configuration

You can extend or override the default configuration:

```javascript
import prettierConfig from '@swissgeo/config-prettier'

export default {
  ...prettierConfig,
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

This configuration includes the following Prettier plugins:

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
- `@prettier/plugin-xml`
- `prettier-plugin-jsdoc`
- `prettier-plugin-packagejson`
- `prettier-plugin-tailwindcss`

## License

BSD-3-Clause

## Repository

[https://github.com/geoadmin/web-mapviewer](https://github.com/geoadmin/web-mapviewer)
