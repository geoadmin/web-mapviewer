# @swissgeo/coordinates

Projection definitions and coordinate utilities for SWISSGEO projects, with utilities to set up an OpenLayers map in LV95.

## Overview

This package provides a comprehensive set of tools for working with geographic coordinates and map extents, with a focus on Swiss coordinate systems (LV95, LV03) and standard systems (WGS84, Web Mercator).

## Installation

```bash
npm install @swissgeo/coordinates
```

Note: This package has `proj4` as a peer dependency.

Note: If you intend to use the OpenLayers utilities, you will also need to install `ol` (optional dependency).

## Features

- **Projection Definitions**: Built-in support for:
  - **LV95** (EPSG:2056) - Swiss CH1903+ / LV95
  - **LV03** (EPSG:21781) - Swiss CH1903 / LV03
  - **WGS84** (EPSG:4326) - World Geodetic System 1984
  - **Web Mercator** (EPSG:3857) - WGS 84 / Pseudo-Mercator
- **Coordinate Utilities**: Formatting, reprojection, rounding, and validation.
- **Extent Utilities**: Normalization, reprojection, intersection, and center calculation.
- **OpenLayers Integration**: Helper functions for OpenLayers in regard to Swiss projection systems (TileGrids, Views).

## Usage

### Basic Usage

The default export provides access to all coordinate systems and utility modules.

```typescript
import { LV95, WGS84, coordinatesUtils } from '@swissgeo/coordinates'

// Reproject a coordinate
const pointLV95 = [2600000, 1200000]
const pointWGS84 = coordinatesUtils.reprojectAndRound(LV95, WGS84, pointLV95)
```

### Projections and Constants

You can import specific coordinate systems and constants:

```typescript
import { LV95, constants } from '@swissgeo/coordinates'

console.log(LV95.epsg) // "EPSG:2056"
console.log(constants.LV95_RESOLUTIONS) // Array of resolutions for LV95
```

### Coordinate Utilities

```typescript
import { coordinatesUtils } from '@swissgeo/coordinates'

// Format coordinates for display
const formatted = coordinatesUtils.toRoundedString([2600000, 1200000], 2)
// => "2'600'000.00, 1'200'000.00"

// Parse CRS string to CoordinateSystem object
const crs = coordinatesUtils.parseCRS('EPSG:2056')
// => LV95
```

### Extent Utilities

```typescript
import { extentUtils, LV95, WGS84 } from '@swissgeo/coordinates'

const extentLV95 = [2485000, 1075000, 2837000, 1296000]

// Reproject an extent
const extentWGS84 = extentUtils.projExtent(LV95, WGS84, extentLV95)

// Get center of an extent
const center = extentUtils.getExtentCenter(extentLV95)
```

### OpenLayers Integration

The package provides specialized helpers for OpenLayers in `@swissgeo/coordinates/ol`.

```typescript
import { getLV95View, getLV95TileGrid, registerSwissGeoProjections } from '@swissgeo/coordinates/ol'
import TileLayer from 'ol/layer/Tile'
import Map from 'ol/Map'
import XYZ from 'ol/source/XYZ'
import proj4 from 'proj4'

// 1. Register projections in proj4 and OpenLayers
registerSwissGeoProjections(proj4)

// 2. Use helpers to create View and TileGrid
const map = new Map({
  target: 'map',
  view: getLV95View(),
  layers: [
    new TileLayer({
      source: new XYZ({
        url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/2056/{z}/{x}/{y}.jpeg'
        projection: LV95.epsg,
        tileGrid: getLV95TileGrid()
      })
    })
  ]
})
```

## License

BSD-3-Clause

## Repository

[https://github.com/geoadmin/web-mapviewer](https://github.com/geoadmin/web-mapviewer)
