/** Checks if file has WMS Capabilities XML content */
export declare function isWmsGetCap(fileContent: string): boolean;
/** Checks if file has WMTS Capabilities XML content */
export declare function isWmtsGetCap(fileContent: string): boolean;
/** Checks if the URL is a WMS url */
export declare function isWmsUrl(url: string): boolean;
/** Checks if the URL is a WMTS url */
export declare function isWmtsUrl(url: string): boolean;
/**
 * Guess the provider URL type and return URL with correct parameters if needed
 *
 * @param provider Base url of the provider
 * @param language Current viewer language
 * @returns Url object with backend parameters (eg. SERVICE=WMS, ...)
 */
export declare function guessExternalLayerUrl(provider: string, language: string): URL;
