/**
 * This will remove the query param from the URL It is necessary to do this in vanilla JS because
 * the router does not provide a way to remove a query without reloading the page which then removes
 * the value from the store.
 *
 * @param key The key to remove from the URL
 */
export function removeQueryParamFromHref(key: string): void {
    const [baseUrl, queryString] = window.location.href.split('?')
    console.log('[removeQueryParamFromHref] baseUrl', baseUrl)
    console.log('[removeQueryParamFromHref] queryString', queryString)

    if (!queryString) {
        return
    }

    const params = new URLSearchParams(queryString)
    if (!params.has(key)) {
        return
    }
    params.delete(key)
    console.log('[removeQueryParamFromHref] replaced key', key)

    const newQueryString = params.toString()
    console.log('[removeQueryParamFromHref] newQueryString', newQueryString)
    const newUrl = newQueryString ? `${baseUrl}?${newQueryString}` : baseUrl
    console.log('[removeQueryParamFromHref] newUrl', newUrl)
    window.history.replaceState({}, document.title, newUrl)
}
