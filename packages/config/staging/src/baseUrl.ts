// mimicking values from https://github.com/geoadmin/web-mapviewer/blob/36043456b820b03f380804a63e2cac1a8a1850bc/packages/mapviewer/src/config/staging.config.js#L1-L7
export type Staging = 'development' | 'integration' | 'production'

export type BackendServices =
    | 'wms'
    | 'wmts'
    | 'api3'
    | 'data'
    | 'kml'
    | 'shortlink'
    | 'tiles3D'
    | 'vectorTiles'
    | 'proxy'
    | 'viewerSpecific'

export type ServiceBaseUrl = {
    [key in Staging]: string
}
export type ServicesBaseUrl = {
    [key in BackendServices]: ServiceBaseUrl
}

export const servicesBaseUrl: ServicesBaseUrl = {
    /**
     * Default WMS base part of the URL to use when requesting tiles (e.g. for prod
     * https://wms.geo.admin.ch).
     *
     * WMS layers tend to carry their own base URL in their metadata, be mindful of that when using
     * this constant (it might be unnecessary)
     *
     * @see https://github.com/geoadmin/service-wms
     */
    wms: {
        development: 'https://sys-wms.dev.bgdi.ch/',
        integration: 'https://sys-wms.int.bgdi.ch/',
        production: 'https://wms.geo.admin.ch/',
    },
    /**
     * Default WMTS base part of the URL to use when requesting tiles (e.g. for prod
     * https://wmts.geo.admin.ch/).
     *
     * @see https://github.com/geoadmin/service-wmts
     */
    wmts: {
        development: 'https://sys-wmts.dev.bgdi.ch/',
        integration: 'https://sys-wmts.int.bgdi.ch/',
        production: 'https://wmts.geo.admin.ch/',
    },
    /**
     * Base part of the URL to use when requesting api3 (mf-chsdi3)
     *
     * @see https://github.com/geoadmin/mf-chsdi3
     */
    api3: {
        development: 'https://sys-api3.dev.bgdi.ch/',
        integration: 'https://sys-api3.int.bgdi.ch/',
        production: 'https://api3.geo.admin.ch/',
    },
    /**
     * Base part of the URL to use when requesting GeoJSON data (e.g. for prod
     * https://data.geo.admin.ch).
     */
    data: {
        development: 'https://data.geo.admin.ch/',
        integration: 'https://data.geo.admin.ch/',
        production: 'https://data.geo.admin.ch/',
    },
    /**
     * Base part of the URL to use for saving, updating or getting kml files.
     *
     * @see https://github.com/geoadmin/service-kml
     */
    kml: {
        development: 'https://sys-public.dev.bgdi.ch/',
        integration: 'https://sys-public.int.bgdi.ch/',
        production: 'https://public.geo.admin.ch/',
    },
    /**
     * Base part of the URL to communicate with service-shortlink backend
     *
     * @see https://github.com/geoadmin/service-shortlink
     */
    shortlink: {
        development: 'https://sys-s.dev.bgdi.ch/',
        integration: 'https://sys-s.int.bgdi.ch/',
        production: 'https://s.geo.admin.ch/',
    },
    /** Root of the AWS S3 buckets serving 3D tiles */
    tiles3D: {
        development: 'https://sys-3d.dev.bgdi.ch/',
        integration: 'https://sys-3d.int.bgdi.ch/',
        production: 'https://3d.geo.admin.ch/',
    },
    /** Root of the AWS S3 buckets serving vector tile styles and tiles */
    vectorTiles: {
        development: 'https://sys-verctortiles.dev.bgdi.ch/',
        integration: 'https://sys-verctortiles.int.bgdi.ch/',
        production: 'https://vectortiles.geo.admin.ch/',
    },
    /**
     * Base part of the URL to be using service-proxy
     *
     * @see https://github.com/geoadmin/service-proxy
     */
    proxy: {
        development: 'https://sys-proxy.dev.bgdi.ch/',
        integration: 'https://sys-proxy.int.bgdi.ch/',
        production: 'https://proxy.geo.admin.ch/',
    },
    /**
     * Base part of the URL to use when requesting services undocumented to the public, and
     * tailor-made for the viewer.
     *
     * These are, among others :
     *
     * - Icons
     * - Print
     * - QR codes
     * - Feedback
     *
     * @see https://github.com/geoadmin/service-icons
     * @see https://github.com/geoadmin/service-print3
     * @see https://github.com/geoadmin/service-qrcode
     * @see https://github.com/geoadmin/service-feedback
     */
    viewerSpecific: {
        development: 'https://sys-map.dev.bgdi.ch/api/',
        integration: 'https://sys-map.int.bgdi.ch/api/',
        production: 'https://map.geo.admin.ch/api/',
    },
}

/** Adds a slash at the end of the URL if there is none */
function enforceEndingSlashInUrl(url?: string): string | undefined {
    if (url && !url.endsWith('/')) {
        return `${url}/`
    }
    return url
}

export function getDefaultBaseUrl(service: BackendServices, staging: Staging = 'production') {
    return servicesBaseUrl[service][staging]
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

export function getBaseUrl(service: BackendServices, staging: Staging = 'production'): string {
    return baseUrlOverrides[service] ?? getDefaultBaseUrl(service, staging)
}

export function getApi3BaseUrl(staging: Staging = 'production'): string {
    return getBaseUrl('api3', staging)
}

export function getViewerDedicatedServicesBaseUrl(staging: Staging = 'production'): string {
    return getBaseUrl('viewerSpecific', staging)
}

export function getServiceKmlBaseUrl(staging: Staging = 'production'): string {
    return getBaseUrl('kml', staging)
}

export function getServiceProxyBaseUrl(staging: Staging = 'production'): string {
    return getBaseUrl('proxy', staging)
}

export function getServiceShortLinkBaseUrl(staging: Staging = 'production'): string {
    return getBaseUrl('shortlink', staging)
}

export function getDataBaseUrl(staging: Staging = 'production'): string {
    return getBaseUrl('data', staging)
}

export function getWmsBaseUrl(staging: Staging = 'production'): string {
    return getBaseUrl('wms', staging)
}

export function getWmtsBaseUrl(staging: Staging = 'production'): string {
    return getBaseUrl('wmts', staging)
}

export function get3dTilesBaseUrl(staging: Staging = 'production'): string {
    return getBaseUrl('tiles3D', staging)
}

export function getVectorTilesBaseUrl(staging: Staging = 'production'): string {
    return getBaseUrl('vectorTiles', staging)
}

export default {
    setBaseUrlOverrides,
    getBaseUrl,
    getApi3BaseUrl,
    getViewerDedicatedServicesBaseUrl,
    getServiceKmlBaseUrl,
    getServiceProxyBaseUrl,
    getServiceShortLinkBaseUrl,
    getDataBaseUrl,
    getWmsBaseUrl,
    getWmtsBaseUrl,
    get3dTilesBaseUrl,
    getVectorTilesBaseUrl,
}
