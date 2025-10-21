import { defineStore } from 'pinia'

import type { ShareStoreGetters, ShareStoreState } from '@/store/modules/share/types/share'

import clearShortLinks from '@/store/modules/share/actions/clearShortLinks'
import closeShareMenuAndRemoveShortLinks from '@/store/modules/share/actions/closeShareMenuAndRemoveShortLinks'
import generateShortLinks from '@/store/modules/share/actions/generateShortLinks'
import setIsMenuSectionShown from '@/store/modules/share/actions/setIsMenuSectionShown'
import setShortLink from '@/store/modules/share/actions/setShortLink'
import toggleShareMenuSection from '@/store/modules/share/actions/toggleShareMenuSection'

const state = (): ShareStoreState => ({
    shortLink: undefined,
    isMenuSectionShown: false,
})

const getters: ShareStoreGetters = {}

const actions = {
    setShortLink,
    setIsMenuSectionShown,
    generateShortLinks,
    closeShareMenuAndRemoveShortLinks,
    toggleShareMenuSection,
    clearShortLinks,
}

const useShareStore = defineStore('share', {
    state,
    getters: { ...getters },
    actions,
})

export default useShareStore
