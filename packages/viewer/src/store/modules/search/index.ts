import { defineStore } from 'pinia'

import type { SearchStoreGetters, SearchStoreState } from '@/store/modules/search/types'

import selectResultEntry from '@/store/modules/search/actions/selectResultEntry'
import setAutoSelect from '@/store/modules/search/actions/setAutoSelect'
import setSearchQuery from '@/store/modules/search/actions/setSearchQuery'

const state = (): SearchStoreState => ({
    query: '',
    results: [],
    autoSelect: false,
})

const getters: SearchStoreGetters = {}

const actions = {
    setAutoSelect,
    setSearchQuery,
    selectResultEntry,
}

const useSearchStore = defineStore('search', {
    state,
    getters: { ...getters },
    actions,
})

export default useSearchStore
