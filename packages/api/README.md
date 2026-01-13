# @swissgeo/api

API utilities to interact with SWISSGEO's backend services.

This package provides a collection of functions and types to interact with various SWISSGEO services, including search, elevation (height), profile, print, and more.

## Installation

```bash
pnpm add @swissgeo/api
```

### Peer dependencies

Most functions that deal with coordinates require the [@swissgeo/coordinates](https://www.npmjs.com/package/@swissgeo/coordinates) package to access the coordinate transformation utilities.

```bash
pnpm add @swissgeo/coordinates
```

## Features

This package provides utilities for:

- **Features**: Interaction with geographic features.
- **Feedback**: Sending feedback to the platform.
- **Files**: KML file management. Aimed at the drawing tools on [map.geo.admin.ch](https://map.geo.admin.ch).
- **Height**: Requesting elevation at specific coordinates.
- **Icons**: Accessing platform icons.
- **LV03 Reframe**: Coordinate transformation (LV03 <-> LV95).
- **Print**: Interacting with MapFish Print services.
- **Profile**: Requesting elevation profiles.
- **QR Code**: Generating QR codes.
- **Search**: Searching for locations, layers, and features (in layers).
- **Shortlink**: Generating and resolving shorten URL.
- **Topics**: Accessing map topics and layers metadata.
- **What3Words**: Integration with What3Words services.

## Usage (some samples)

### Search API

```typescript
import { LV95 } from '@swissgeo/coordinates'
import { searchAPI } from '@swissgeo/api'

const results = await searchAPI.search({ 
    queryString: "Bern",
    outputProjection: LV95,
    lang: 'en',
    // in m/px, you can get this from your OpenLayers instance by calling map.getView().getResolution()
    resolution: 1000
})
```

### Height API

```typescript
import { LV95, WGS84 } from '@swissgeo/coordinates'
import { heightAPI } from '@swissgeo/api'

const elevation = await getHeightForPosition([2600000, 1200000], LV95)
const elevationWGS84 = await getHeightForPosition([7.530, 46.627], WGS84)
```

## License

BSD-3-Clause

## Repository

[https://github.com/geoadmin/web-mapviewer](https://github.com/geoadmin/web-mapviewer)
