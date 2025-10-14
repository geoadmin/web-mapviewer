import { type BackendServices, servicesBaseUrl } from '@swissgeo/staging-config'

import { ENVIRONMENT } from '@/config/staging.config'

/** Adds a slash at the end of the URL if there is none */
function enforceEndingSlashInUrl(url?: string): string | undefined {
    if (url && !url.endsWith('/')) {
        return `${url}/`
    }
    return url
}

export function getDefaultBaseUrl(service: BackendServices) {
    return servicesBaseUrl[service][ENVIRONMENT]
}

const baseUrlOverrides: Record<BackendServices, string | undefined> = {
    wms: undefined,
    wmts: undefined,
    api3: undefined,
    data: undefined,
    kml: undefined,
    shortlink: undefined,
    tiles3D: undefined,
    vectorTiles: undefined,
    proxy: undefined,
    viewerSpecific: undefined,
}

export function hasBaseUrlOverrides(): boolean {
    return Object.values(baseUrlOverrides).some((value) => value !== undefined)
}

export function getBaseUrlOverride(service: BackendServices): string | undefined {
    return baseUrlOverrides[service]
}

export function setBaseUrlOverrides(service: BackendServices, value?: string) {
    baseUrlOverrides[service] = enforceEndingSlashInUrl(value)
}

export function getBaseUrl(service: BackendServices): string {
    return baseUrlOverrides[service] ?? getDefaultBaseUrl(service)
}

export function getApi3BaseUrl(): string {
    return getBaseUrl('api3')
}

export function getViewerDedicatedServicesBaseUrl(): string {
    return getBaseUrl('viewerSpecific')
}

export function getServiceKmlBaseUrl(): string {
    return getBaseUrl('kml')
}

export function getServiceProxyBaseUrl(): string {
    return getBaseUrl('proxy')
}

export function getServiceShortLinkBaseUrl(): string {
    return getBaseUrl('shortlink')
}

export function getDataBaseUrl(): string {
    return getBaseUrl('data')
}

export function getWmsBaseUrl(): string {
    return getBaseUrl('wms')
}

export function getWmtsBaseUrl(): string {
    return getBaseUrl('wmts')
}

export function get3dTilesBaseUrl(): string {
    return getBaseUrl('tiles3D')
}

export function getVectorTilesBaseUrl(): string {
    return getBaseUrl('vectorTiles')
}
