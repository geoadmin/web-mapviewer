/**
 * List of whitelisted URLS regexes for external layers. External layers which baseUrl
 * match one of these regexes won't show a disclaimer
 */

export const EXTERNAL_PROVIDER_WHITELISTED_URL_REGEXES : Array<RegExp> = [/^(.+\.)?geo\.admin\.ch.*$/g]
