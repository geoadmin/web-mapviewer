# @swissgeo/log

Logging utilities for SWISSGEO projects.

## Overview

This package provides a standardized logging utility for SWISSGEO projects, supporting various log levels, stylized console output with predefined colors, and structured message objects.

### Why a dedicated package?

So that ESLint can be set to raise errors on console logs in the codebase, whilst having the possibility to write long-term logging in the code.

## Installation

```bash
npm install @swissgeo/log
```

## Features

- **Log Levels**: Support for `Error`, `Warn`, `Info`, and `Debug`.
- **Stylized Output**: Predefined background colors for log titles (using Tailwind-like colors).
- **Configurable Verbosity**: Easily control which log levels are output to the console.
- **Structured Messages**: Classes for defining messages with optional parameters (useful for i18n integration).

## Usage

### Basic Usage

The default export is a `log` object that provides methods for different log levels.

```typescript
import log from '@swissgeo/log'

log.error('This is an error message')
log.warn('This is a warning')

// By default, info and debug levels are disabled
log.info('This will not be shown by default')
```

### Enabling Log Levels

You can control which levels are displayed by modifying the `wantedLevels` array.

```typescript
import log, { LogLevel } from '@swissgeo/log'

// Enable all log levels
log.wantedLevels = [
  LogLevel.Error,
  LogLevel.Warn,
  LogLevel.Info,
  LogLevel.Debug
]

log.info('Now this info message will be displayed')
```

### Styled Logs with Titles

You can provide an object to any log method to create a stylized title for your log message.

```typescript
import log, { LogPreDefinedColor } from '@swissgeo/log'

log.info({
  title: 'API',
  titleColor: LogPreDefinedColor.Sky,
  messages: ['Fetching data from server...', { url: '/api/data' }]
})

log.warn({
  title: 'DEPRECATED',
  titleColor: LogPreDefinedColor.Amber,
  messages: ['This method will be removed in v2.0']
})
```

### Using Message Classes

The package also provides `Message`, `ErrorMessage`, and `WarningMessage` classes for structured data, to help their integration in translation tools such as `vue-i18n`.

```typescript
import { Message, ErrorMessage } from '@swissgeo/log'

const msg = new Message('translation.key', { count: 5 })
const errorMsg = new ErrorMessage('error.occurred')

console.log(msg.msg) // 'translation.key'
console.log(msg.params) // { count: 5 }

// and can then be used as (in vue-i18n context)
t(msg.msg, msg.params)
// translation exemple (using params to swap placeholders) => "There was an error with 5 problems"

```

## Available Colors

`LogPreDefinedColor` includes a wide range of colors based on TailwindCSS (using OKLCH):
`Red`, `Orange`, `Amber`, `Yellow`, `Lime`, `Green`, `Emerald`, `Teal`, `Cyan`, `Sky`, `Blue`, `Indigo`, `Violet`, `Purple`, `Fuchsia`, `Pink`, `Rose`, `Slate`, `Gray`, `Zinc`, `Neutral`, `Stone`.

## License

BSD-3-Clause

## Repository

[https://github.com/geoadmin/web-mapviewer](https://github.com/geoadmin/web-mapviewer)
