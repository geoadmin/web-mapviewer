/**
 * This will remove the query param from the URL It is necessary to do this in vanilla JS because
 * the router does not provide a way to remove a query without reloading the page which then removes
 * the value from the store.
 *
 * @param {Object} key The key to remove from the URL
 */
export function removeQueryParamFromHref(key) {
    const [baseUrl, queryString] = window.location.href.split('?')
    if (!queryString) {
        return
    }

    const params = new URLSearchParams(queryString)
    if (!params.has(key)) {
        return
    }
    params.delete(key)

    const newQueryString = params.toString()
    const newUrl = newQueryString ? `${baseUrl}?${newQueryString}` : baseUrl
    window.history.replaceState({}, document.title, newUrl)
}
