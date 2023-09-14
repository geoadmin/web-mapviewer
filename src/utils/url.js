import log from './logging'

/**
 * The code below is a copy from the Vue Router github repository, see
 * https://github.com/vuejs/router/blob/v4.1.6/packages/router/src/query.ts
 *
 * The original code doesn't encode `|` characters, which is an issue as this character is not
 * allowed in URL and some tool will have trouble with this one (e.g. JIRA hyperlink won't work
 * properly if the URL contains non encoded `|` pipe characters). Our URL query parameters for KML
 * and External layers make use of `|` as separator and need to be encoded.
 *
 * So the implementation below is exactly the same as in Vue Router version 4.1.6 with the exception
 * of the `|` encoding.
 *
 * You can track changes by searching for ORIGINAL-CODE: in comments.
 */

const PLUS_RE = /\+/g // %2B
const HASH_RE = /#/g // %23
const AMPERSAND_RE = /&/g // %26
const EQUAL_RE = /=/g // %3D

const ENC_BRACKET_OPEN_RE = /%5B/g // [
const ENC_BRACKET_CLOSE_RE = /%5D/g // ]
const ENC_CARET_RE = /%5E/g // ^
const ENC_BACKTICK_RE = /%60/g // `
const ENC_CURLY_OPEN_RE = /%7B/g // {
const ENC_CURLY_CLOSE_RE = /%7D/g // }
const ENC_SPACE_RE = /%20/g // }

function decode(text) {
    try {
        return decodeURIComponent('' + text)
    } catch (err) {
        log.error(`Error decoding "${text}". Using original value`)
    }
    return '' + text
}

function commonEncode(text) {
    return encodeURI('' + text)
        .replace(ENC_BRACKET_OPEN_RE, '[')
        .replace(ENC_BRACKET_CLOSE_RE, ']')
    // ORIGINAL-CODE: See comment on top of file.
    // .replace(ENC_PIPE_RE, '|')
}

function encodeQueryValue(text) {
    return (
        commonEncode(text)
            // Encode the space as +, encode the + to differentiate it from the space
            .replace(PLUS_RE, '%2B')
            .replace(ENC_SPACE_RE, '+')
            .replace(HASH_RE, '%23')
            .replace(AMPERSAND_RE, '%26')
            .replace(ENC_BACKTICK_RE, '`')
            .replace(ENC_CURLY_OPEN_RE, '{')
            .replace(ENC_CURLY_CLOSE_RE, '}')
            .replace(ENC_CARET_RE, '^')
    )
}

function encodeQueryKey(text) {
    return encodeQueryValue(text).replace(EQUAL_RE, '%3D')
}

/**
 * Transforms a queryString into a {@link LocationQuery} object. Accept both, a version with the
 * leading `?` and without Should work as URLSearchParams
 *
 * This is a copy of Vue Router parseQuery, see
 * https://github.com/vuejs/router/blob/30002aa62130139b81530083f1393bd367160dd2/packages/router/src/query.ts#L54
 *
 * We use a copy to make sure that `decode()` uses `decodeURIComponent()` see comment on top of
 * file.
 *
 * @param search - Search string to parse
 * @returns A query object
 */
export function parseQuery(search) {
    const query = {}
    // avoid creating an object with an empty key and empty value
    // because of split('&')
    if (search === '' || search === '?') {
        return query
    }
    const hasLeadingIM = search[0] === '?'
    const searchParams = (hasLeadingIM ? search.slice(1) : search).split('&')
    for (let i = 0; i < searchParams.length; ++i) {
        // pre decode the + into space
        const searchParam = searchParams[i].replace(PLUS_RE, ' ')
        // allow the = character
        const eqPos = searchParam.indexOf('=')
        const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos))
        const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1))

        if (key in query) {
            // an extra variable for ts types
            let currentValue = query[key]
            if (!Array.isArray(currentValue)) {
                currentValue = query[key] = [currentValue]
            }
            // we force the modification
            currentValue.push(value)
        } else {
            query[key] = value
        }
    }
    return query
}

/**
 * Stringifies a {@link LocationQueryRaw} object. Like `URLSearchParams`, it doesn't prepend a `?`
 *
 * This is a copy of Vue Router stringifyQuery, see
 * https://github.com/vuejs/router/blob/30002aa62130139b81530083f1393bd367160dd2/packages/router/src/query.ts#L93
 *
 * We use a copy because the original encodeQueryValue() doesn't encode `|`, see comment on top of
 * file.
 *
 * @param query - Query object to stringify
 * @returns String version of the query without the leading `?`
 * @internal
 */
export function stringifyQuery(query) {
    let search = ''
    for (let key in query) {
        const value = query[key]
        key = encodeQueryKey(key)
        if (value == null) {
            // only null adds the value
            if (value !== undefined) {
                search += (search.length ? '&' : '') + key
            }
            continue
        }
        // keep null values
        const values = Array.isArray(value)
            ? value.map((v) => v && encodeQueryValue(v))
            : [value && encodeQueryValue(value)]

        values.forEach((value) => {
            // skip undefined values in arrays as if they were not present
            // smaller code than using filter
            if (value !== undefined) {
                // only append & with non-empty search
                search += (search.length ? '&' : '') + key
                if (value != null) {
                    search += '=' + value
                }
            }
        })
    }

    return search
}

/* Import URL utils start */

const ADMIN_URL_REGEXP = new RegExp(
    '^(ftp|http|https)://(.*(.bgdi.ch|.geo.admin.ch|.swisstopo.cloud)|localhost:[0-9]{1,5})'
)

// todo use correct URLs
const PROXY_URL = '//service-proxy.bgdi-dev.swisstopo.cloud'

export function appendParamsToUrl(url, paramString) {
    if (paramString) {
        const parts = (url + ' ').split(/[?&]/)
        url +=
            parts.pop() === ' '
                ? paramString
                : parts.length > 0
                ? '&' + paramString
                : '?' + paramString
    }
    return url
}

// Test if the URL comes from a friendly site
export function isAdminValid(url) {
    return isValidUrl(url) && ADMIN_URL_REGEXP.test(url)
}

// Test if URL is a blob url
export function isBlob(url) {
    return /^blob:/.test(url)
}

// Test if URL uses https
export function isHttps(url) {
    return isValidUrl(url) && /^https/.test(url)
}

// Test if URL represents resource that needs to pass via proxy
export function needsProxy(url) {
    if (isBlob(url)) {
        return false
    }
    return !isHttps(url) || !isAdminValid(url) || /.*kmz$/.test(url)
}

export function buildProxyUrl(url) {
    if (!isValidUrl(url)) {
        return url
    }
    const parts = /^(http|https)(:\/\/)(.+)/.exec(url)
    const protocol = parts[1]
    const resource = parts[3]
    // proxy is RESTFful, <service>/<protocol>/<resource>
    return `${location.protocol}${PROXY_URL}${protocol}/${encodeURIComponent(resource)}`
}

export function proxifyUrlInstant(url) {
    if (needsProxy(url)) {
        return buildProxyUrl(url)
    }
    return url
}

export function proxifyUrl(url) {
    return new Promise((resolve) => {
        if (!isBlob(url) && isHttps(url) && !isAdminValid(url) && !/.*kmz$/.test(url)) {
            fetch(url).then(
                () => resolve(url),
                () => resolve(buildProxyUrl(url))
            )
        } else {
            resolve(proxifyUrlInstant(url))
        }
    })
}

/**
 *  Prepares URL for external layer upload
 *
 * @param url
 * @param lang
 * @returns {Promise<string>}
 */
export function transformUrl(url, lang) {
    // If the url has no file extension or a map parameter,
    // try to load a WMS/WMTS GetCapabilities.
    if (
        (!/\.(kml|kmz|xml|txt)/i.test(url) && !/\w+\/\w+\.[a-zA-Z]+$/i.test(url)) ||
        /map=/i.test(url)
    ) {
        // Append WMS GetCapabilities default parameters
        url = appendParamsToUrl(
            url,
            /wmts/i.test(url)
                ? 'SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0'
                : 'SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0'
        )

        // Use lang param only for admin.ch servers
        if (/admin\.ch/.test(url)) {
            url = appendParamsToUrl(url, `lang=${lang}`)
        }
        // Replace the subdomain template if exists
        url = url.replace(/{s}/, '')
    }
    // Save the good url for the import component.
    // $scope.getCapUrl = url
    return proxifyUrl(url)
}

/* Import URL utils end */

/**
 * Check is provided string valid URL
 *
 * @param {string} urlToCheck
 */
export function isValidUrl(urlToCheck) {
    let url

    try {
        url = new URL(urlToCheck)
    } catch (_) {
        return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:'
}
