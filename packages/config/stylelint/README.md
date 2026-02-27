# @swissgeo/config-stylelint

Shared Stylelint configuration for SWISSGEO projects.

## Overview

This package provides a standardized Stylelint configuration for SWISSGEO projects, with support for:

- SCSS/Sass
- Vue Single File Components (SFC)
- CSS Modules
- Property ordering

## Installation

```bash
npm install --save-dev @swissgeo/config-stylelint stylelint postcss-html
```

## Usage

### Basic Configuration

Create a `stylelint.config.js` file in your project root:

```javascript
import stylelintConfig from '@swissgeo/config-stylelint'

export default stylelintConfig
```

Or reference it in your `package.json`:

```json
{
  "stylelint": {
    "extends": "@swissgeo/config-stylelint"
  }
}
```

### Extending the Configuration

You can extend or override the default configuration:

```javascript
import stylelintConfig from '@swissgeo/config-stylelint'

export default {
  ...stylelintConfig,
  rules: {
    // Your custom rules
    'color-hex-length': 'long',
  },
}
```

## Features

### Vue SFC Support

Automatically uses `postcss-html` custom syntax for `.vue` files to properly parse and lint styles within Vue Single File Components.

### SCSS/Sass Support

Extends `stylelint-config-recommended-scss` for comprehensive SCSS linting with `stylelint-scss` plugin.

### Property Ordering

Includes `stylelint-order` plugin for consistent CSS property ordering.

### Ignore Files

By default, the configuration ignores all files in `**/dist/*.*`.

### Custom Rules

- **Duplicate Selectors**: Disabled to follow Sass mixin expected behavior
- **Unknown Properties**: Allowed in `:export` selectors (CSS Modules)
- **Variable Support**: Ignores SCSS variables (starting with `$`)
- **Pseudo-class Support**: Allows `:global`, `:export`, and `:deep` pseudo-classes

## Peer Dependencies

This package requires:

- `stylelint`
- `postcss-html`

## License

BSD-3-Clause

## Repository

[https://github.com/geoadmin/web-mapviewer](https://github.com/geoadmin/web-mapviewer)
