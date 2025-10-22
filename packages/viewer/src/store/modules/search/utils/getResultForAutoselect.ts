import type { SearchResult } from '@/api/search.api'

import { SearchResultTypes } from '@/api/search.api'

/**
 * Returns the appropriate result for autoselection from a list of search results.
 *
 * If there is only one result, it returns that result. Otherwise, it tries to find a result with
 * the resultType of LOCATION. If such a result is found, it returns that result. If no result with
 * resultType LOCATION is found, it returns the first result in the list.
 *
 * @param results - The list of search results.
 * @returns The selected search result for autoselection.
 */
export default function getResultForAutoselect(results: SearchResult[]): SearchResult {
    if (results.length === 1 && results[0]) {
        return results[0]
    }

    // Try to find a result with resultType LOCATION
    const locationResult = results.find(
        (result) => result.resultType === SearchResultTypes.LOCATION
    )

    // If a location result is found, return it; otherwise, return the first result
    return locationResult ?? results[0]! // the outer function established that this element should exist
}
