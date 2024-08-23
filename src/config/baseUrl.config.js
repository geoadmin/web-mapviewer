/**
 * Adds a slash at the end of the URL if there is none
 *
 * @param {String} url
 * @returns {String} The URL with a trailing slash
 */
export function enforceEndingSlashInUrl(url) {
    if (url && !url.endsWith('/')) {
        return `${url}/`
    }
    return url
}

/**
 * All default base URLs for services.
 *
 * These URLs always end with a slash, so there's no need at add another one after it to create REST
 * endpoints
 *
 * @type {Object}
 */
export const defaultBaseUrlConfig = {
    /**
     * Base part of the URL to use when requesting api3 (mf-chsdi3)
     *
     * @type String
     * @see https://github.com/geoadmin/mf-chsdi3
     */
    api3: enforceEndingSlashInUrl(import.meta.env.VITE_API_BASE_URL),

    /**
     * Base part of the URL to use when requesting the alti service
     *
     * @type String
     * @see https://github.com/geoadmin/service-alti
     */
    serviceAlti: enforceEndingSlashInUrl(import.meta.env.VITE_API_SERVICE_ALTI_BASE_URL),

    /**
     * Base part of the URL to use when requesting the search service.
     *
     * @type String
     * @see https://github.com/geoadmin/service-search-wsgi
     * @see https://github.com/geoadmin/service-search-sphinx
     */
    serviceSearch: enforceEndingSlashInUrl(import.meta.env.VITE_API_SERVICE_SEARCH_BASE_URL),

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
     * @type String
     * @see https://github.com/geoadmin/service-icons
     * @see https://github.com/geoadmin/service-print3
     * @see https://github.com/geoadmin/service-qrcode
     * @see https://github.com/geoadmin/service-feedback
     */
    viewerDedicatedServices: enforceEndingSlashInUrl(import.meta.env.VITE_API_SERVICES_BASE_URL),

    /**
     * Base part of the URL to use for saving, updating or getting kml files.
     *
     * @type String
     * @see https://github.com/geoadmin/service-kml
     */
    serviceKml: enforceEndingSlashInUrl(import.meta.env.VITE_API_SERVICE_KML_BASE_URL),

    /**
     * Base part of the URL to be using service-proxy
     *
     * @type {String}
     * @see https://github.com/geoadmin/service-proxy
     */
    serviceProxy: enforceEndingSlashInUrl(import.meta.env.VITE_APP_SERVICE_PROXY_BASE_URL),

    /**
     * Base part of the URL to communicate with service-shortlink backend
     *
     * @type {String}
     * @see https://github.com/geoadmin/service-shortlink
     */
    serviceShortLink: enforceEndingSlashInUrl(
        import.meta.env.VITE_APP_API_SERVICE_SHORTLINK_BASE_URL
    ),

    /**
     * Base part of the URL to use when requesting GeoJSON data (e.g. for prod
     * https://data.geo.admin.ch).
     *
     * @type {String}
     */
    data: enforceEndingSlashInUrl(import.meta.env.VITE_DATA_BASE_URL),

    /**
     * Default WMTS base part of the URL to use when requesting tiles (e.g. for prod
     * https://wmts.geo.admin.ch/).
     *
     * @type {String}
     * @see https://github.com/geoadmin/service-wmts
     */
    wmts: enforceEndingSlashInUrl(import.meta.env.VITE_WMTS_BASE_URL),

    /**
     * Default WMS base part of the URL to use when requesting tiles (e.g. for prod
     * https://wms.geo.admin.ch).
     *
     * WMS layers tend to carry their own base URL in their metadata, be mindful of that when using
     * this constant (it might be unnecessary)
     *
     * @type {String}
     * @see https://github.com/geoadmin/service-wms
     */
    wms: enforceEndingSlashInUrl(import.meta.env.VITE_WMS_BASE_URL),

    /**
     * Root of the AWS S3 buckets serving 3D tiles
     *
     * @type {String}
     */
    tiles3d: enforceEndingSlashInUrl(import.meta.env.VITE_APP_3D_TILES_BASE_URL),

    /**
     * Root of the AWS S3 buckets serving vector tile styles and tiles
     *
     * @type {String}
     */
    vectorTiles: enforceEndingSlashInUrl(import.meta.env.VITE_APP_VECTORTILES_BASE_URL),
}

export const baseUrlOverrides = {
    ...defaultBaseUrlConfig,
}
Object.keys(baseUrlOverrides).forEach((key) => (baseUrlOverrides[key] = null))

export function getBaseUrl(propertyName) {
    return baseUrlOverrides[propertyName] ?? defaultBaseUrlConfig[propertyName]
}

export function getApi3BaseUrl() {
    return getBaseUrl('api3')
}

export function getServiceAltiBaseUrl() {
    return getBaseUrl('serviceAlti')
}

export function getServiceSearchBaseUrl() {
    return getBaseUrl('serviceSearch')
}

export function getViewerDedicatedServicesBaseUrl() {
    return getBaseUrl('viewerDedicatedServices')
}

export function getServiceKmlBaseUrl() {
    return getBaseUrl('serviceKml')
}

export function getServiceProxyBaseUrl() {
    return getBaseUrl('serviceProxy')
}

export function getServiceShortLinkBaseUrl() {
    return getBaseUrl('serviceShortLink')
}

export function getDataBaseUrl() {
    return getBaseUrl('data')
}

export function getWmsBaseUrl() {
    return getBaseUrl('wms')
}

export function getWmtsBaseUrl() {
    return getBaseUrl('wmts')
}

export function get3dTilesBaseUrl() {
    return getBaseUrl('tiles3d')
}

export function getVectorTilesBaseUrl() {
    return getBaseUrl('vectorTiles')
}
