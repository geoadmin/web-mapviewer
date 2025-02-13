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

## Check External Layer Provider list

In the `Import` tool we provide a hardcoded list of provider via the [external-providers.json](./packages/mapviewer/src/modules/menu/components/advancedTools/ImportCatalogue/external-providers.json) file. Because we have quite a lot of provider, we have a CLI tool in order to
check their validity. The tool can also be used with a single url as input parameter to see the URL would be valid
for our application.

```bash
pnpm install
./packages/mapviewer/scripts/check-external-layers-providers.js
```

You can use `-h` option to get more detail on the script.
