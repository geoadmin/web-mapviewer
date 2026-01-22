# @swissgeo/theme

Shared SCSS variables, theme utilities, and styling helpers for SWISSGEO/geoadmin projects.

## Overview

This package provides a centralized location for design tokens, common SCSS styles, and OpenLayers styling utilities used across the web-mapviewer ecosystem. It integrates with Bootstrap and Tailwind CSS to ensure consistent UI across different modules.

## Features

- **Shared Design Tokens**: Consistent color palette and typography.
- **SCSS Utilities**: Mixins for media queries, transitions, and theme configuration.
- **OpenLayers Styling**: Ready-to-use OpenLayers style objects and utility functions for maps.
- **Fonts**: Bundled fonts including Noto Sans and Frutiger.
- **Integration**: Pre-configured for use with Bootstrap and Tailwind CSS.

## Installation

```bash
pnpm add @swissgeo/theme
```

## Usage

### SCSS

To use the theme variables and mixins in your SCSS files:

```scss
@import '@swissgeo/theme/scss/colors';
@import '@swissgeo/theme/scss/media-query.mixin';

.my-component {
  color: $red;

  @include respond-to(tablet) {
    font-size: 1.2rem;
  }
}
```

To include the full theme (including Bootstrap and basic resets):

```scss
@import '@swissgeo/theme/scss/index';
```

### TypeScript / JavaScript

#### Colors

Access design tokens directly in your code:

```typescript
import { colors } from '@swissgeo/theme';

console.log(colors.red); // #f7001d
```

#### OpenLayers Style Utilities

Use pre-defined styles or utility functions for OpenLayers:

```typescript
import { styleUtils } from '@swissgeo/theme';

const featureStyle = styleUtils.redCircleStyle;
const rgbaColor = styleUtils.hexToRgba('#ff0000', 0.5);
```

## Available Scripts

- `pnpm run build`: Build the package (Vite).
- `pnpm run lint`: Lint both TypeScript and SCSS files.
- `pnpm run test:unit`: Run unit tests with Vitest.
- `pnpm run lint:styles`: Run Stylelint on SCSS/CSS files.

## Exports

The package exports several entry points:

- `@swissgeo/theme`: Main entry point for TypeScript/JavaScript utilities.
- `@swissgeo/theme/css`: Compiled CSS.
- `@swissgeo/theme/scss`: Source SCSS files.
- `@swissgeo/theme/fonts`: Bundled font assets.

## License

BSD-3-Clause
