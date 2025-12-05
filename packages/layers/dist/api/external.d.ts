import { WMSCapabilitiesResponse } from '../parsers/WMSCapabilitiesParser';
import { WMTSCapabilitiesResponse } from '../parsers/WMTSCapabilitiesParser';
/** Timeout for accessing external server in [ms] */
export declare const EXTERNAL_SERVER_TIMEOUT = 30000;
/** Sets the WMS GetCapabilities url parameters */
export declare function setWmsGetCapabilitiesParams(url: URL, language?: string): URL;
/** Sets the WMS GetMap url parameters */
export declare function setWmsGetMapParams(url: URL, layer: string, crs: string, style: string): URL;
/**
 * Read and parse WMS GetCapabilities
 *
 * @param baseUrl Base URL for the WMS server
 * @param language Language parameter to use if the server support localization
 */
export declare function readWmsCapabilities(baseUrl: string, language?: string): Promise<WMSCapabilitiesResponse | undefined>;
/**
 * Parse WMS Get Capabilities string
 *
 * @param content Input content to parse
 */
export declare function parseWmsCapabilities(content: string): WMSCapabilitiesResponse;
/** Sets the WMTS GetCapabilities url parameters */
export declare function setWmtsGetCapParams(url: URL, language?: string): URL;
/** Read and parse WMTS GetCapabilities */
export declare function readWmtsCapabilities(baseUrl: string, language?: string): Promise<WMTSCapabilitiesResponse>;
/**
 * Parse WMTS Get Capabilities string
 *
 * @param content Input content to parse
 * @param originUrl Origin URL of the content, this is used as default GetCapabilities URL if not
 *   found in the Capabilities
 */
export declare function parseWmtsCapabilities(content: string, originUrl: URL): WMTSCapabilitiesResponse;
/**
 * Encode an external layer parameter.
 *
 * This percent encode the special character | used to separate external layer parameters.
 *
 * NOTE: We don't use encodeURIComponent here because the Vue Router will anyway do the
 * encodeURIComponent() therefore by only encoding | we avoid to encode other special character
 * twice. But we need to encode | twice to avoid layer parsing issue.
 *
 * @param {string} param Parameter to encode
 * @returns {string} Percent encoded parameter
 */
export declare function encodeExternalLayerParam(param: string): string;
/**
 * Decode an external layer parameter.
 *
 * This percent decode the special character | used to separate external layer parameters.
 *
 * NOTE: We don't use decodeURIComponent here because the Vue Router will anyway do the
 * decodeURIComponent() therefore by only decoding | we avoid to decode other special character
 * twice. But we need to decode | twice to avoid layer parsing issue.
 *
 * @param {string} param Parameter to encode
 * @returns {string} Percent encoded parameter
 */
export declare function decodeExternalLayerParam(param: string): string;
