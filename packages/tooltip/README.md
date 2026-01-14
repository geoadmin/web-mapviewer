# @swissgeo/tooltip

Tooltip for SWISSGEO projects.

This package provides a Vue 3 tooltip component based on [floating-ui](https://floating-ui.com/).

## Installation

```bash
pnpm add @swissgeo/tooltip
```

### TailwindCSS integration

To properly style the tooltip, you need to set up TailwindCSS in your project, and then import the tooltip style by doing:

```css
/* style.css */

@import 'tailwindcss';

@import '@swissgeo/tooltip/tailwindcss';
```

## Usage

### Basic Usage

```vue
<script setup>
import SwissGeoTooltip from '@swissgeo/tooltip'
</script>

<template>
  <SwissGeoTooltip tooltip-content="My Tooltip Text">
    <button>Hover me</button>
  </SwissGeoTooltip>
</template>
```

### Custom Content Slot

```vue
<script setup>
import SwissGeoTooltip from '@swissgeo/tooltip'
</script>

<template>
  <SwissGeoTooltip>
    <button>Hover me</button>
    <template #content>
      <span class="font-bold">Rich</span> tooltip content
    </template>
  </SwissGeoTooltip>
</template>
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tooltip-content` | `string` | `''` | The text content of the tooltip. |
| `placement` | `'top' \| 'bottom' \| 'right' \| 'left'` | `'top'` | The desired placement of the tooltip. |
| `disabled` | `boolean` | `false` | Disable the tooltip. |
| `theme` | `'light' \| 'warning' \| 'secondary' \| 'danger'` | `'light'` | The tooltip theme. |
| `open-trigger` | `'hover' \| 'click' \| 'manual'` | `'hover'` | How the tooltip shall be triggered. |
| `no-wrap` | `boolean` | `false` | If whitespace wrapping the content should be avoided. |
| `use-default-padding` | `boolean` | `false` | Use the padding regardless of content slot usage. |

## License

BSD-3-Clause

## Repository

[https://github.com/geoadmin/web-mapviewer](https://github.com/geoadmin/web-mapviewer)
