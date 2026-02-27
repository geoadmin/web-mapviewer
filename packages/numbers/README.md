# @swissgeo/numbers

Number manipulation and formatting utilities for SWISSGEO projects.

## Overview

This package provides a collection of utility functions for working with numbers, including rounding, formatting with Swiss locale, calculating circular means, and other common mathematical operations used within the SWISSGEO ecosystem.

## Installation

```bash
npm install @swissgeo/numbers
```

## Features

- **Rounding & Comparison**: `round`, `closest`, `isNumber`.
- **Formatting**: `format` (Swiss locale), `formatThousand` with custom separators.
- **Math & Utilities**: `randomIntBetween`, `wrapDegrees`, `circularMean`.
- **Validation**: `isTimestampYYYYMMDD`.

## Usage

### Basic Usage

The default export provides access to all utility functions.

```typescript
import { round, isNumber } from '@swissgeo/numbers'

const rounded = round(1.2345, 2) // 1.23
const isNum = isNumber('123') // true
```

### Rounding and Closest Value

```typescript
import { round, closest } from '@swissgeo/numbers'

// Rounding to 2 decimal places
round(10.556, 2) // 10.56

// Finding the closest value in a list
closest(15, [10, 20, 30]) // 20
```

### Formatting

The `format` function uses the `de-CH` locale convention (using `'` as a thousands separator).

```typescript
import { format, formatThousand } from '@swissgeo/numbers'

// Swiss formatting (thousands separator is ')
format(1234.567) // "1'234.57"

// Custom thousand separator
formatThousand(1000000, ' ') // "1 000 000"
```

### Circular Mean and Degrees

Useful for handling angles and rotations.

```typescript
import { wrapDegrees, circularMean } from '@swissgeo/numbers'

// Wrap angle to [-360, 360] range
wrapDegrees(370) // 10

// Compute circular mean of radians
circularMean([0, Math.PI / 2]) // 0.785398... (Math.PI / 4)
```

### Random Integers

```typescript
import { randomIntBetween } from '@swissgeo/numbers'

const random = randomIntBetween(1, 10) // Random integer between 1 and 10 (inclusive)
```

## License

BSD-3-Clause

## Repository

[https://github.com/geoadmin/web-mapviewer](https://github.com/geoadmin/web-mapviewer)
