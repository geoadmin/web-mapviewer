import type { SearchResult } from '@/api/search.api'

export interface SearchStoreState {
    /** The search query. It will trigger a search to the backend if it contains 3 or more characters */
    query: string
    /** Search results from the backend for the current query */
    results: SearchResult[]
    /** If true, the first search result will be automatically selected */
    autoSelect: boolean
}

export type SearchStoreGetters = object

export type SearchStoreStateAndGetters = SearchStoreState & SearchStoreGetters

export type SearchStore = ReturnType<typeof import('@/store/modules/search').default>
