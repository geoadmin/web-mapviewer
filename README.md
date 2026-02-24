# web-mapviewer

The next generation map viewer application of [map.geo.admin.ch](https://map.geo.admin.ch).

Designed to provide a modern and feature-rich interface for exploring Swiss geospatial data.
It supports interactive tools, external layer providers and is backed by robust CI/CD processes for seamless deployment.

<!-- prettier-ignore -->
| Branch      | CI Status  | E2E Tests | Deployed version |
|-------------| ---------- | --------- | ---------------- |
| develop     | ![Build Status](https://codebuild.eu-central-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiYTlsZkdlMzducmJKQ2hqSkpkK1VyNDVXR2R2NGtodjZDYVBtOVRqTFB0UzI0SHBVMU50TXVnTHlxMXpleFlwTTF6OVVnS2wyaXZUcG1SN1BpZXNBRk04PSIsIml2UGFyYW1ldGVyU3BlYyI6Imt1elJ6MWpOZzYvOWlKdVIiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=develop) | [![web-mapviewer](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/simple/fj2ezv/develop&style=plastic&logo=cypress)](https://cloud.cypress.io/projects/fj2ezv/runs) | <https://sys-map.dev.bgdi.ch/> |
| master      | ![Build Status](https://codebuild.eu-central-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiYTlsZkdlMzducmJKQ2hqSkpkK1VyNDVXR2R2NGtodjZDYVBtOVRqTFB0UzI0SHBVMU50TXVnTHlxMXpleFlwTTF6OVVnS2wyaXZUcG1SN1BpZXNBRk04PSIsIml2UGFyYW1ldGVyU3BlYyI6Imt1elJ6MWpOZzYvOWlKdVIiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master) | [![web-mapviewer](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/simple/fj2ezv/master&style=plastic&logo=cypress)](https://cloud.cypress.io/projects/fj2ezv/runs) | <https://sys-map.int.bgdi.ch/> |

## Getting started

### Pre-Requirements

The following tools are required to use `web-mapviewer` locally

- Nodejs 22
- pnpm 10

### Install

```bash
pnpm install
```

### Running project locally

```bash
pnpm run build-all
pnpm run dev
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Exported Packages

This monorepo contains several packages that are published to [NPMJS.com](https://www.npmjs.com/org/swissgeo) under the `@swissgeo` organization.
Detailed dependency mapping can be found in [PACKAGES.md](PACKAGES.md).

### Core Libraries

| Package | Version | Description |
| ------- | ------- | ----------- |
| [`@swissgeo/api`](https://www.npmjs.com/package/@swissgeo/api) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/api) | API utilities to interact with SWISSGEO's backend services |
| [`@swissgeo/coordinates`](https://www.npmjs.com/package/@swissgeo/coordinates) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/coordinates) | Projection definition and coordinates utils for SWISSGEO projects |
| [`@swissgeo/drawing`](https://www.npmjs.com/package/@swissgeo/drawing) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/drawing) | Components to draw on a map and export the result as KML or GeoJSON |
| [`@swissgeo/elevation-profile`](https://www.npmjs.com/package/@swissgeo/elevation-profile) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/elevation-profile) | Components to request and display an elevation profile over Switzerland |
| [`@swissgeo/layers`](https://www.npmjs.com/package/@swissgeo/layers) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/layers) | Layers definition for SwissGeo |
| [`@swissgeo/log`](https://www.npmjs.com/package/@swissgeo/log) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/log) | Logging utils for SWISSGEO projects |
| [`@swissgeo/numbers`](https://www.npmjs.com/package/@swissgeo/numbers) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/numbers) | Numbers utils for SWISSGEO projects |
| [`@swissgeo/theme`](https://www.npmjs.com/package/@swissgeo/theme) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/theme) | Shared SCSS variable and theme utilities |
| [`@swissgeo/tooltip`](https://www.npmjs.com/package/@swissgeo/tooltip) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/tooltip) | Tooltip for geoadmin |

### Configuration Packages

| Package | Version | Description |
| ------- | ------- | ----------- |
| [`@swissgeo/config-eslint`](https://www.npmjs.com/package/@swissgeo/config-eslint) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/config-eslint) | Shared ESLint config for SWISSGEO projects |
| [`@swissgeo/config-prettier`](https://www.npmjs.com/package/@swissgeo/config-prettier) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/config-prettier) | Shared Prettier config for SWISSGEO projects |
| [`@swissgeo/config-stylelint`](https://www.npmjs.com/package/@swissgeo/config-stylelint) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/config-stylelint) | Shared Stylelint config for SWISSGEO projects |
| [`@swissgeo/config-typescript`](https://www.npmjs.com/package/@swissgeo/config-typescript) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/config-typescript) | TypeScript configuration for SWISSGEO projects |
| [`@swissgeo/staging-config`](https://www.npmjs.com/package/@swissgeo/staging-config) | ![npm (scoped)](https://img.shields.io/npm/v/@swissgeo/staging-config) | Staging config utils for swissgeo |

## Check External Layer Provider list

In the `Import` tool we provide a hardcoded list of provider via the [external-providers.json](packages/mapviewer/src/modules/menu/components/advancedTools/ImportCatalogue/external-providers.json) file. Because we have quite a lot of provider, we have a CLI tool in order to
check their validity. The tool can also be used with a single url as input parameter to see the URL would be valid
for our application.

```bash
pnpm install
./packages/mapviewer/scripts/check-external-layers-providers.js
```

You can use `-h` option to get more detail on the script.
