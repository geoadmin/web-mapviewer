# @swissgeo/staging-config

Staging configuration utilities for SWISSGEO projects.

## Overview

This package provides centralized configuration for SWISSGEO backend service URLs across different deployment environments (development, integration, and production).

## Installation

```bash
npm install @swissgeo/staging-config
```

## Usage

### Import Service Base URLs

```typescript
import { type Staging, type BackendServices } from '@swissgeo/staging-config'
import { getApi3BaseUrl, getWmsBaseUrl, getWmtsBaseUrl } from '@swissgeo/staging-config'

// Get WMS service URL for production environment
const wmsUrl = getWmsBaseUrl() // default environment is 'production'
// => 'https://wms.geo.admin.ch/'

// Get API3 service URL for development environment
const api3Url = getApi3BaseUrl('development')
// => 'https://sys-api3.dev.bgdi.ch/'

// Get WMTS service URL for integration environment
const wmtsUrl = getWmtsBaseUrl('integration')
// => 'https://sys-wmts.int.bgdi.ch/'
```

### Environment-based URL Selection

```typescript
import { getBaseUrl, type Staging } from '@swissgeo/staging-config'

const environment: Staging = 'production' // or 'development', 'integration'
const wmtsUrl = getBaseUrl('wmts', environment)
```

### Overriding Base URLs

You can override base URLs globally for your application, which is useful for testing or local development:

```typescript
import { setBaseUrlOverrides } from '@swissgeo/staging-config'

// Override API3 URL
setBaseUrlOverrides('api3', 'http://localhost:8080/')

// Now getApi3BaseUrl() will return your override
// getApi3BaseUrl() => 'http://localhost:8080/'
```

### Constants

The package also exports various constants used across SWISSGEO projects:

```typescript
import { WMS_TILE_SIZE } from '@swissgeo/staging-config/constants'
```

## Available Services

The package provides base URLs for the following backend services:

- **`wms`**: Web Map Service for raster tile requests
- **`wmts`**: Web Map Tile Service for tile requests
- **`api3`**: Main API (mf-chsdi3) for metadata and layer information
- **`data`**: GeoJSON data service
- **`kml`**: KML file storage and retrieval service
- **`shortlink`**: URL shortening service
- **`tiles3D`**: 3D tiles service (AWS S3)
- **`vectorTiles`**: Vector tile styles and tiles service (AWS S3)
- **`proxy`**: Proxy service for external requests
- **`viewerSpecific`**: Viewer-specific services (icons, print, QR codes, feedback)

## Environments

Each service supports three deployment environments:

- **`development`**: Development environment (`*.dev.bgdi.ch`)
- **`integration`**: Integration testing environment (`*.int.bgdi.ch`)
- **`production`**: Production environment (`*.geo.admin.ch`)

## TypeScript Types

The package exports the following TypeScript types:

- **`Staging`**: Union type for deployment environments (`'development' | 'integration' | 'production'`)
- **`BackendServices`**: Union type for available backend services
- **`ServiceBaseUrl`**: Object mapping staging environments to URLs
- **`ServicesBaseUrl`**: Complete mapping of all services to their base URLs

## Helper Functions

The package provides several helper functions for retrieving service URLs:

- **`getApi3BaseUrl(staging)`**: Returns the API3 base URL.
- **`getWmsBaseUrl(staging)`**: Returns the WMS base URL.
- **`getWmtsBaseUrl(staging)`**: Returns the WMTS base URL.
- **`getServiceKmlBaseUrl(staging)`**: Returns the KML service base URL.
- **`getServiceProxyBaseUrl(staging)`**: Returns the proxy service base URL.
- **`getServiceShortLinkBaseUrl(staging)`**: Returns the shortlink service base URL.
- **`getDataBaseUrl(staging)`**: Returns the GeoJSON data service base URL.
- **`get3dTilesBaseUrl(staging)`**: Returns the 3D tiles base URL.
- **`getVectorTilesBaseUrl(staging)`**: Returns the vector tiles base URL.
- **`getViewerDedicatedServicesBaseUrl(staging)`**: Returns the viewer-specific services base URL.

All functions accept an optional `staging` parameter (`'development' | 'integration' | 'production'`, defaulting to `'production'`).

## Example: Dynamic Service Selection

```typescript
import { servicesBaseUrl, type BackendServices, type Staging } from '@swissgeo/staging-config'

function getServiceUrl(service: BackendServices, environment: Staging): string {
  return servicesBaseUrl[service][environment]
}

// Get WMTS URL for integration environment
const url = getServiceUrl('wmts', 'integration')
// => 'https://sys-wmts.int.bgdi.ch/'
```

## Related Services

For more information about specific services, refer to their repositories:

- [service-wms](https://github.com/geoadmin/service-wms)
- [service-wmts](https://github.com/geoadmin/service-wmts)
- [mf-chsdi3](https://github.com/geoadmin/mf-chsdi3)
- [service-kml](https://github.com/geoadmin/service-kml)
- [service-shortlink](https://github.com/geoadmin/service-shortlink)
- [service-proxy](https://github.com/geoadmin/service-proxy)
- [service-icons](https://github.com/geoadmin/service-icons)
- [service-print3](https://github.com/geoadmin/service-print3)
- [service-qrcode](https://github.com/geoadmin/service-qrcode)
- [service-feedback](https://github.com/geoadmin/service-feedback)

## License

BSD-3-Clause

## Repository

[https://github.com/geoadmin/web-mapviewer](https://github.com/geoadmin/web-mapviewer)
