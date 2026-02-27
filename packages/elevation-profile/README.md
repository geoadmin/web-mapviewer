# @swissgeo/elevation-profile

Components to request and display an elevation profile over Switzerland.

This package provides a Vue 3 component that fetches elevation data for a given path and displays it as an interactive chart using Chart.js. It also includes bridge components for easy integration with Cesium and OpenLayers.

## Installation

```bash
pnpm add @swissgeo/elevation-profile
```

### TailwindCSS integration

To properly style the profile, you need to set up TailwindCSS in your project, and then to import the profile style by doing
```css
/* style.css */

@import 'tailwindcss';

@import '@swissgeo/elevation-profile/tailwindcss';
```

## Usage

### Basic Usage

```vue
<script setup>
import SwissGeoElevationProfile from '@swissgeo/elevation-profile'

const points = [
  [2600000, 1200000],
  [2601000, 1201000],
  // ... more coordinates in LV95 (CH1903+)
]
</script>

<template>
  <div style="height: 300px;">
    <SwissGeoElevationProfile :points="points" />
  </div>
</template>
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `points` | `SingleCoordinate[]` | `[]` | Array of coordinates defining the path for the elevation profile. |
| `projection` | `string` | `'EPSG:2056'` | The projection of the input points (e.g., `'EPSG:2056'` for LV95 or `'EPSG:4326'` for WGS84). |
| `simplify` | `boolean` | `false` | Whether to simplify the geometry before requesting the profile. |
| `filename` | `string` | `'export'` | The default filename used when exporting the profile data as CSV. |

## Map Integration

The package provides "bridge" components that allow synchronizing the elevation profile with a map. When you hover over the elevation chart, these components will display a marker at the corresponding location on the map.

### Cesium Integration

```vue
<script setup>
import SwissGeoElevationProfile, { SwissGeoElevationProfileCesiumBridge } from '@swissgeo/elevation-profile'

const points = [...] // your points
const cesiumViewer = ... // your Cesium Viewer instance
</script>

<template>
  <SwissGeoElevationProfile :points="points">
    <SwissGeoElevationProfileCesiumBridge :cesium-viewer="cesiumViewer" />
  </SwissGeoElevationProfile>
</template>
```

### OpenLayers Integration

```vue
<script setup>
import SwissGeoElevationProfile, { SwissGeoElevationProfileOpenLayersBridge } from '@swissgeo/elevation-profile'

const points = [...] // your points
const olMap = ... // your OpenLayers Map instance
</script>

<template>
  <SwissGeoElevationProfile :points="points">
    <SwissGeoElevationProfileOpenLayersBridge :ol-instance="olMap" />
  </SwissGeoElevationProfile>
</template>
```

## License

BSD-3-Clause

## Repository

[https://github.com/geoadmin/web-mapviewer](https://github.com/geoadmin/web-mapviewer)
