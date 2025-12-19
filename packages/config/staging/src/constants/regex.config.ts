/** This Regular expression matches our own internal backend or the localhost */
export const LOCAL_OR_INTERNAL_URL_REGEX: RegExp =
    /^(https:\/\/[^/]*(bgdi\.ch|geo\.admin\.ch)|https?:\/\/localhost)/

/**
 * List of whitelisted URLS regexes for external layers. External layers which baseUrl match one of
 * these regexes won't show a disclaimer.
 */
export const EXTERNAL_PROVIDER_WHITELISTED_URL_REGEXES: Array<RegExp> = [
    LOCAL_OR_INTERNAL_URL_REGEX,
]
